use crate::errors::AppError;
use crate::auth::crypto::{derive_key, decrypt_data, encrypt_data, generate_salt};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

pub struct DbState {
    pub pool: Arc<Mutex<Option<Pool<SqliteConnectionManager>>>>,
    pub key: Arc<Mutex<Option<[u8; 32]>>>,
}

// Relational SQLite schema migrations
fn run_migrations(conn: &rusqlite::Connection, key: &[u8; 32]) -> Result<(), AppError> {
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
        
        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS banks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            color TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            bank_id TEXT NOT NULL,
            starting_balance TEXT NOT NULL,
            balance TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT NOT NULL,
            global_category TEXT
        );
        
        CREATE TABLE IF NOT EXISTS budgets (
            month TEXT NOT NULL,
            category_id TEXT NOT NULL,
            planned TEXT NOT NULL,
            PRIMARY KEY (month, category_id),
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            amount TEXT NOT NULL,
            account_id TEXT NOT NULL,
            category_id TEXT NOT NULL,
            shift_to_next_month INTEGER NOT NULL DEFAULT 0,
            transfer_id TEXT,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        
        -- Secure store for encrypted sentinel and metadata
        CREATE TABLE IF NOT EXISTS secure_store (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );"
    )?;
    
    // Migration: Add active column to accounts if database already exists without it
    let column_exists: i64 = conn.query_row(
        "SELECT count(*) FROM pragma_table_info('accounts') WHERE name='active'",
        [],
        |row| row.get(0),
    ).unwrap_or(0);
    if column_exists == 0 {
        let _ = conn.execute("ALTER TABLE accounts ADD COLUMN active INTEGER NOT NULL DEFAULT 1", []);
    }

    // Migration: Add global_category column to categories if database already exists without it
    let col_categories_global_exists: i64 = conn.query_row(
        "SELECT count(*) FROM pragma_table_info('categories') WHERE name='global_category'",
        [],
        |row| row.get(0),
    ).unwrap_or(0);
    if col_categories_global_exists == 0 {
        let _ = conn.execute("ALTER TABLE categories ADD COLUMN global_category TEXT", []);
    }
    
    // Seed defaults if not already seeded
    seed_defaults(conn, key)?;
    
    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed guard: both branches write is_seeded=true so they run at most once.
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(feature = "seed")]
fn seed_defaults(conn: &rusqlite::Connection, key: &[u8; 32]) -> Result<(), AppError> {
    let already: i64 = conn.query_row(
        "SELECT count(*) FROM config WHERE key = 'is_seeded' AND value = 'true'",
        [],
        |row| row.get(0),
    ).map_err(AppError::Db)?;
    if already > 0 {
        return Ok(());
    }

    let config_keys = [
        ("kMode", "true"),
        ("currentMonth", "06"),
        ("currentYear", "2026"),
        ("currencySymbol", "Rp"),
        ("warningThreshold", "0.8"),
        ("glowEffects", "true"),
        ("isSidebarCollapsed", "false"),
    ];
    for (k, v) in config_keys.iter() {
        conn.execute("INSERT OR IGNORE INTO config (key, value) VALUES (?1, ?2);", [k, v]).map_err(AppError::Db)?;
    }

    let default_banks = [
        ("bank-bca",    "Bank BCA",     "BCA",  "#6366f1"),
        ("bank-jago",   "Bank Jago",    "Jago", "#4edea3"),
        ("bank-mandiri","Bank Mandiri", "Mandiri","#ffb95f"),
        ("bank-cash",   "Pocket Cash",  "CASH", "#908fa0"),
    ];
    for (id, name, code, color) in default_banks.iter() {
        let enc_name = encrypt_data(name, key)?;
        let enc_code = encrypt_data(code, key)?;
        conn.execute(
            "INSERT OR IGNORE INTO banks (id, name, code, color) VALUES (?1, ?2, ?3, ?4);",
            (id, &enc_name, &enc_code, color),
        ).map_err(AppError::Db)?;
    }

    let default_accounts = [
        ("acc-checking", "Checking Account",    "checking",    "bank-bca",     12500000.0, 12500000.0),
        ("acc-savings",  "High-Yield Savings",  "savings",     "bank-jago",    30000000.0, 30000000.0),
        ("acc-credit",   "Reward Credit Card",  "credit_card", "bank-mandiri", -2700000.0, -2700000.0),
        ("acc-cash",     "Wallet Cash",          "cash",        "bank-cash",     5400000.0,  5400000.0),
    ];
    for (id, name, acc_type, bank_id, start_bal, bal) in default_accounts.iter() {
        let enc_name = encrypt_data(name, key)?;
        let enc_starting = encrypt_data(&start_bal.to_string(), key)?;
        let enc_balance = encrypt_data(&bal.to_string(), key)?;
        conn.execute(
            "INSERT OR IGNORE INTO accounts (id, name, type, bank_id, starting_balance, balance) VALUES (?1, ?2, ?3, ?4, ?5, ?6);",
            (id, &enc_name, acc_type, bank_id, &enc_starting, &enc_balance),
        ).map_err(AppError::Db)?;
    }

    let default_categories = [
        ("cat-inc-salary", "Primary Salary",       "income"),
        ("cat-inc-side",   "Side Hustle",           "income"),
        ("cat-inc-div",    "Dividends",             "income"),
        ("cat-exp-housing","Housing",               "expenses"),
        ("cat-exp-food",   "Food",                  "expenses"),
        ("cat-exp-utils",  "Utilities",             "expenses"),
        ("cat-exp-ent",    "Entertainment",         "expenses"),
        ("cat-sav-emg",    "Emergency Fund",        "savings"),
        ("cat-sav-ret",    "Retirement",            "savings"),
        ("cat-sav-vac",    "Vacation",              "savings"),
        ("cat-sav-car",    "New Car",               "savings"),
        ("cat-debt-cc",    "Credit Card Payment",   "debt"),
    ];
    for (id, name, parent_id) in default_categories.iter() {
        let enc_name = encrypt_data(name, key)?;
        conn.execute(
            "INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES (?1, ?2, ?3);",
            (id, &enc_name, parent_id),
        ).map_err(AppError::Db)?;
    }

    let default_budgets = [
        ("2026-06", "cat-inc-salary",  10000000.0),
        ("2026-06", "cat-inc-side",     3500000.0),
        ("2026-06", "cat-inc-div",      1500000.0),
        ("2026-06", "cat-exp-housing",  5000000.0),
        ("2026-06", "cat-exp-food",     2500000.0),
        ("2026-06", "cat-exp-utils",    1500000.0),
        ("2026-06", "cat-exp-ent",      1000000.0),
        ("2026-06", "cat-sav-emg",      1000000.0),
        ("2026-06", "cat-sav-ret",      1000000.0),
        ("2026-06", "cat-sav-vac",       300000.0),
        ("2026-06", "cat-sav-car",       200000.0),
        ("2026-06", "cat-debt-cc",      2500000.0),
    ];
    for (month, cat_id, planned) in default_budgets.iter() {
        let enc_planned = encrypt_data(&planned.to_string(), key)?;
        conn.execute(
            "INSERT OR IGNORE INTO budgets (month, category_id, planned) VALUES (?1, ?2, ?3);",
            (month, cat_id, &enc_planned),
        ).map_err(AppError::Db)?;
    }

    let default_transactions = [
        ("tx-inc-1",     "2026-06-01", "Monthly Salary Paycheck",   10000000.0, "acc-checking", "cat-inc-salary",  0, None),
        ("tx-inc-2",     "2026-06-03", "Side Hustle Coding Project",  2625000.0, "acc-checking", "cat-inc-side",    0, None),
        ("tx-inc-3",     "2026-06-05", "Dividends Pay",               750000.0, "acc-savings",  "cat-inc-div",     0, None),
        ("tx-exp-1",     "2026-06-02", "Apartment Rental Payment",  -2205000.0, "acc-checking", "cat-exp-housing", 0, None),
        ("tx-exp-2",     "2026-06-04", "Supermarket Groceries",      -650000.0, "acc-checking", "cat-exp-food",    0, None),
        ("tx-exp-3",     "2026-06-07", "Weekend Restaurant Outing",  -610000.0, "acc-cash",     "cat-exp-food",    0, None),
        ("tx-exp-4",     "2026-06-05", "Electricity & Wifi Bill",    -756000.0, "acc-checking", "cat-exp-utils",   0, None),
        ("tx-exp-5",     "2026-06-06", "Emergency Fund Transfer",   -1008000.0, "acc-savings",  "cat-sav-emg",     0, None),
        ("tx-exp-6",     "2026-06-08", "Minimum Credit Card Pay",    -630000.0, "acc-checking", "cat-debt-cc",     0, None),
        ("tx-exp-7",     "2026-06-09", "Cinema Tickets & Snacks",    -441000.0, "acc-cash",     "cat-exp-ent",     0, None),
    ];
    for (id, date, desc, amount, acc_id, cat_id, shift, xfer_id) in default_transactions.iter() {
        let enc_date = encrypt_data(date, key)?;
        let enc_desc = encrypt_data(desc, key)?;
        let enc_amount = encrypt_data(&amount.to_string(), key)?;
        conn.execute(
            "INSERT OR IGNORE INTO transactions (id, date, description, amount, account_id, category_id, shift_to_next_month, transfer_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);",
            (id, &enc_date, &enc_desc, &enc_amount, acc_id, cat_id, *shift, xfer_id),
        ).map_err(AppError::Db)?;
    }

    conn.execute("INSERT OR REPLACE INTO config (key, value) VALUES ('is_seeded', 'true');", []).map_err(AppError::Db)?;
    Ok(())
}

#[cfg(not(feature = "seed"))]
fn seed_defaults(conn: &rusqlite::Connection, _key: &[u8; 32]) -> Result<(), AppError> {
    conn.execute("INSERT OR IGNORE INTO config (key, value) VALUES ('is_seeded', 'true');", []).map_err(AppError::Db)?;
    conn.execute("INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES ('cat-debt-cc', 'Credit Card Payment / Transfer', 'debt');", []).map_err(AppError::Db)?;
    Ok(())
}

impl DbState {
    pub fn new() -> Self {
        Self {
            pool: Arc::new(Mutex::new(None)),
            key: Arc::new(Mutex::new(None)),
        }
    }

    pub fn unlock(&self, pin: &str, db_path: PathBuf) -> Result<bool, AppError> {
        let db_exists = db_path.exists();
        
        let manager = SqliteConnectionManager::file(db_path);
        let pool = Pool::new(manager)
            .map_err(|e| AppError::Pool(format!("Failed to initialize database pool: {}", e)))?;
            
        let conn = pool.get().map_err(|e| AppError::Pool(e.to_string()))?;
        
        // 1. Handle Key Derivation Salt (VULN-002)
        let salt = if db_exists {
            // Retrieve existing salt
            let mut stmt = conn.prepare("SELECT value FROM config WHERE key = 'auth_salt'")?;
            let mut rows = stmt.query([])?;
            if let Some(row) = rows.next()? {
                row.get::<_, String>(0)?
            } else {
                // Fallback for legacy DBs or corrupted state
                let new_salt = generate_salt();
                conn.execute_batch("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL);")?;
                conn.execute("INSERT OR REPLACE INTO config (key, value) VALUES ('auth_salt', ?1)", [&new_salt])?;
                new_salt
            }
        } else {
            // New DB: generate and save salt
            let new_salt = generate_salt();
            conn.execute_batch("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL);")?;
            conn.execute("INSERT INTO config (key, value) VALUES ('auth_salt', ?1)", [&new_salt])?;
            new_salt
        };

        let derived_key = derive_key(pin, &salt)?;
        
        // 2. Ensure secure_store exists before checking sentinel
        conn.execute_batch("CREATE TABLE IF NOT EXISTS secure_store (key TEXT PRIMARY KEY, value TEXT NOT NULL);")?;

        // 3. PIN Validation via Sentinel (VULN-004)
        let mut stmt = conn.prepare("SELECT value FROM secure_store WHERE key = 'sentinel'")?;
        let mut rows = stmt.query([])?;
        
        if let Some(row) = rows.next()? {
            let encrypted_sentinel: String = row.get(0)?;
            // Attempt to decrypt; if it fails, it returns an AppError::Auth (wrong PIN)
            let decrypted = decrypt_data(&encrypted_sentinel, &derived_key)?;
            if decrypted != "capital-flow-validated" {
                return Err(AppError::Auth("Invalid PIN validation token".to_string()));
            }
        } else {
            // Registration: create sentinel
            let encrypted = encrypt_data("capital-flow-validated", &derived_key)?;
            conn.execute("INSERT OR REPLACE INTO secure_store (key, value) VALUES ('sentinel', ?1)", [&encrypted])?;
        }

        // 4. Run Migrations (which handles seeding)
        run_migrations(&conn, &derived_key)?;
        
        // Success
        let mut pool_guard = self.pool.lock().unwrap();
        *pool_guard = Some(pool);
        
        let mut key_guard = self.key.lock().unwrap();
        *key_guard = Some(derived_key);
        
        Ok(true)
    }

    pub fn get_conn(&self) -> Result<r2d2::PooledConnection<SqliteConnectionManager>, AppError> {
        let pool_guard = self.pool.lock().unwrap();
        let pool = pool_guard.as_ref().ok_or_else(|| AppError::Auth("Database is locked. Please unlock first.".to_string()))?;
        pool.get().map_err(|e| AppError::Pool(e.to_string()))
    }
    
    pub fn get_key(&self) -> Result<[u8; 32], AppError> {
        let key_guard = self.key.lock().unwrap();
        key_guard.ok_or_else(|| AppError::Auth("Database key is missing. Please unlock first.".to_string()))
    }
}
