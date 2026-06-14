use crate::errors::AppError;
use crate::auth::crypto::{derive_key, decrypt_data};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

pub struct DbState {
    pub pool: Arc<Mutex<Option<Pool<SqliteConnectionManager>>>>,
    pub key: Arc<Mutex<Option<[u8; 32]>>>,
}

// Relational SQLite schema migrations
fn run_migrations(conn: &rusqlite::Connection) -> Result<(), rusqlite::Error> {
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
            starting_balance REAL NOT NULL,
            balance REAL NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS budgets (
            month TEXT NOT NULL,
            category_id TEXT NOT NULL,
            planned REAL NOT NULL,
            PRIMARY KEY (month, category_id),
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            account_id TEXT NOT NULL,
            category_id TEXT NOT NULL,
            shift_to_next_month INTEGER NOT NULL DEFAULT 0,
            transfer_id TEXT,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        
        -- Legacy secure_store table fallback check support
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
    
    // Seed defaults if not already seeded
    seed_defaults(conn)?;
    
    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed guard: both branches write is_seeded=true so they run at most once.
//
// Build with demo data : cargo tauri dev --features seed
// Build clean (default): cargo tauri build   (no --features seed)
// ─────────────────────────────────────────────────────────────────────────────

/// `--features seed` variant: inserts demo banks, accounts, categories,
/// budgets, and transactions so developers can explore the app with realistic data.
#[cfg(feature = "seed")]
fn seed_defaults(conn: &rusqlite::Connection) -> Result<(), rusqlite::Error> {
    // Skip if already seeded or user explicitly reset the DB
    let already: i64 = conn.query_row(
        "SELECT count(*) FROM config WHERE key = 'is_seeded' AND value = 'true'",
        [],
        |row| row.get(0),
    )?;
    if already > 0 {
        return Ok(());
    }

    // 1. Seed Config keys
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
        conn.execute("INSERT OR IGNORE INTO config (key, value) VALUES (?1, ?2);", [k, v])?;
    }

    // 2. Seed Banks
    let default_banks = [
        ("bank-bca",    "Bank BCA",     "BCA",  "#6366f1"),
        ("bank-jago",   "Bank Jago",    "Jago", "#4edea3"),
        ("bank-mandiri","Bank Mandiri", "Mandiri","#ffb95f"),
        ("bank-cash",   "Pocket Cash",  "CASH", "#908fa0"),
    ];
    for (id, name, code, color) in default_banks.iter() {
        conn.execute(
            "INSERT OR IGNORE INTO banks (id, name, code, color) VALUES (?1, ?2, ?3, ?4);",
            [id, name, code, color],
        )?;
    }

    // 3. Seed Accounts
    let default_accounts = [
        ("acc-checking", "Checking Account",    "checking",    "bank-bca",     12500000.0, 12500000.0),
        ("acc-savings",  "High-Yield Savings",  "savings",     "bank-jago",    30000000.0, 30000000.0),
        ("acc-credit",   "Reward Credit Card",  "credit_card", "bank-mandiri", -2700000.0, -2700000.0),
        ("acc-cash",     "Wallet Cash",          "cash",        "bank-cash",     5400000.0,  5400000.0),
    ];
    for (id, name, acc_type, bank_id, start_bal, bal) in default_accounts.iter() {
        conn.execute(
            "INSERT OR IGNORE INTO accounts (id, name, type, bank_id, starting_balance, balance) VALUES (?1, ?2, ?3, ?4, ?5, ?6);",
            (id, name, acc_type, bank_id, *start_bal, *bal),
        )?;
    }

    // 4. Seed Categories
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
        conn.execute(
            "INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES (?1, ?2, ?3);",
            [id, name, parent_id],
        )?;
    }

    // 5. Seed Budgets
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
        conn.execute(
            "INSERT OR IGNORE INTO budgets (month, category_id, planned) VALUES (?1, ?2, ?3);",
            (month, cat_id, *planned),
        )?;
    }

    // 6. Seed Transactions
    let default_transactions: [(&str, &str, &str, f64, &str, &str, i32, Option<&str>); 16] = [
        // June 2026
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
        // May 2026
        ("tx-may-inc-1", "2026-05-01", "Salary May",                10000000.0, "acc-checking", "cat-inc-salary",  0, None),
        ("tx-may-inc-2", "2026-05-04", "Freelance May",              3000000.0, "acc-checking", "cat-inc-side",    0, None),
        ("tx-may-exp-1", "2026-05-02", "Rent May",                  -5000000.0, "acc-checking", "cat-exp-housing", 0, None),
        ("tx-may-exp-2", "2026-05-05", "Food May",                  -2200000.0, "acc-checking", "cat-exp-food",    0, None),
        ("tx-may-exp-3", "2026-05-06", "Internet May",               -800000.0, "acc-checking", "cat-exp-utils",   0, None),
        ("tx-may-exp-4", "2026-05-10", "Saving May",                -1500000.0, "acc-savings",  "cat-sav-emg",     0, None),
    ];
    for (id, date, desc, amount, acc_id, cat_id, shift, xfer_id) in default_transactions.iter() {
        conn.execute(
            "INSERT OR IGNORE INTO transactions (id, date, description, amount, account_id, category_id, shift_to_next_month, transfer_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);",
            (id, date, desc, *amount, acc_id, cat_id, *shift, xfer_id),
        )?;
    }

    // Mark as seeded — prevents re-seeding on subsequent startups
    conn.execute(
        "INSERT OR REPLACE INTO config (key, value) VALUES ('is_seeded', 'true');",
        [],
    )?;

    Ok(())
}

/// Default (no `--features seed`) variant: database starts completely empty.
/// We still write is_seeded=true immediately so this branch is never re-entered.
#[cfg(not(feature = "seed"))]
fn seed_defaults(conn: &rusqlite::Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT OR IGNORE INTO config (key, value) VALUES ('is_seeded', 'true');",
        [],
    )?;
    // Seed default CC/debt category so transfers don't fail foreign key constraints
    conn.execute(
        "INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES ('cat-debt-cc', 'Credit Card Payment / Transfer', 'debt');",
        [],
    )?;
    Ok(())
}

impl DbState {
    pub fn new() -> Self {
        Self {
            pool: Arc::new(Mutex::new(None)),
            key: Arc::new(Mutex::new(None)),
        }
    }

    // Unlocks standard SQLite and verifies the derived key with existing data
    pub fn unlock(&self, pin: &str, db_path: PathBuf) -> Result<bool, AppError> {
        let derived_key = derive_key(pin)?;
        
        let manager = SqliteConnectionManager::file(db_path);
        let pool = Pool::new(manager)
            .map_err(|e| AppError::Pool(format!("Failed to initialize database pool: {}", e)))?;
            
        let conn = pool.get().map_err(|e| AppError::Pool(e.to_string()))?;
        run_migrations(&conn)?;
        
        // Check if there is an existing encrypted state in secure_store (fallback key validation)
        let mut stmt = conn.prepare("SELECT value FROM secure_store WHERE key = 'state'")?;
        let mut rows = stmt.query([])?;
        
        if let Some(row) = rows.next()? {
            let encrypted_val: String = row.get(0)?;
            // Attempt to decrypt; if it fails, it returns an AppError::Auth (wrong PIN)
            decrypt_data(&encrypted_val, &derived_key)?;
        }
        
        // Decryption succeeded or database is brand new
        let mut pool_guard = self.pool.lock().unwrap();
        *pool_guard = Some(pool);
        
        let mut key_guard = self.key.lock().unwrap();
        *key_guard = Some(derived_key);
        
        Ok(true)
    }

    // Gets database connection from the pool
    pub fn get_conn(&self) -> Result<r2d2::PooledConnection<SqliteConnectionManager>, AppError> {
        let pool_guard = self.pool.lock().unwrap();
        let pool = pool_guard.as_ref().ok_or_else(|| AppError::Auth("Database is locked. Please unlock first.".to_string()))?;
        pool.get().map_err(|e| AppError::Pool(e.to_string()))
    }
    
    // Gets the derived encryption key
    pub fn get_key(&self) -> Result<[u8; 32], AppError> {
        let key_guard = self.key.lock().unwrap();
        key_guard.ok_or_else(|| AppError::Auth("Database key is missing. Please unlock first.".to_string()))
    }
}
