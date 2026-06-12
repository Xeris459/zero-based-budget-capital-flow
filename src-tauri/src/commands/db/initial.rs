use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::{Bank, Account, Category, Budget, Transaction, InitialData};

#[tauri::command]
pub fn db_get_initial_data(state: tauri::State<'_, DbState>) -> Result<InitialData, AppError> {
    let conn = state.get_conn()?;
    
    // 1. Fetch config key-values
    let mut stmt = conn.prepare("SELECT key, value FROM config")?;
    let config_rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    
    let mut config_map = std::collections::HashMap::new();
    for row in config_rows {
        let (k, v) = row?;
        config_map.insert(k, v);
    }
    
    let get_bool = |key: &str, default: bool| -> bool {
        config_map.get(key).and_then(|s| s.parse().ok()).unwrap_or(default)
    };
    let get_string = |key: &str, default: &str| -> String {
        config_map.get(key).cloned().unwrap_or_else(|| default.to_string())
    };
    let get_f64 = |key: &str, default: f64| -> f64 {
        config_map.get(key).and_then(|s| s.parse().ok()).unwrap_or(default)
    };

    // 2. Fetch Banks
    let mut stmt = conn.prepare("SELECT id, name, code, color FROM banks")?;
    let banks = stmt.query_map([], |row| {
        Ok(Bank {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
            color: row.get(3)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    // 3. Fetch Accounts
    let mut stmt = conn.prepare("SELECT id, name, type, bank_id, starting_balance, balance FROM accounts")?;
    let accounts = stmt.query_map([], |row| {
        Ok(Account {
            id: row.get(0)?,
            name: row.get(1)?,
            acc_type: row.get(2)?,
            bank_id: row.get(3)?,
            starting_balance: row.get(4)?,
            balance: row.get(5)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    // 4. Fetch Categories
    let mut stmt = conn.prepare("SELECT id, name, parent_id FROM categories")?;
    let categories = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_id: row.get(2)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    // 5. Fetch Budgets
    let mut stmt = conn.prepare("SELECT month, category_id, planned FROM budgets")?;
    let budgets = stmt.query_map([], |row| {
        Ok(Budget {
            month: row.get(0)?,
            category_id: row.get(1)?,
            planned: row.get(2)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    // 6. Fetch Transactions
    let mut stmt = conn.prepare("SELECT id, date, description, amount, account_id, category_id, shift_to_next_month, transfer_id FROM transactions")?;
    let transactions = stmt.query_map([], |row| {
        let shift_int: i32 = row.get(6)?;
        Ok(Transaction {
            id: row.get(0)?,
            date: row.get(1)?,
            description: row.get(2)?,
            amount: row.get(3)?,
            account_id: row.get(4)?,
            category_id: row.get(5)?,
            shift_to_next_month: shift_int != 0,
            transfer_id: row.get(7)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(InitialData {
        banks,
        accounts,
        categories,
        budgets,
        transactions,
        k_mode: get_bool("kMode", true),
        current_month: get_string("currentMonth", "06"),
        current_year: get_string("currentYear", "2026"),
        currency_symbol: get_string("currencySymbol", "Rp"),
        warning_threshold: get_f64("warningThreshold", 0.8),
        glow_effects: get_bool("glowEffects", true),
        is_sidebar_collapsed: get_bool("isSidebarCollapsed", false),
        filter_type: get_string("filterType", "monthly"),
        planner_view: get_string("plannerView", "monthly"),
        max_debt_limit: get_f64("maxDebtLimit", 5000000.0),
        min_savings_rate: get_f64("minSavingsRate", 10.0),
        low_cash_threshold: get_f64("lowCashThreshold", 100000.0),
    })
}

#[tauri::command]
pub fn db_save_config(state: tauri::State<'_, DbState>, key: String, value: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute(
        "INSERT OR REPLACE INTO config (key, value) VALUES (?1, ?2)",
        [key, value],
    )?;
    Ok(())
}
