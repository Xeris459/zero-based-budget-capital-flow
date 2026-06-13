use tauri::State;
use crate::db::manager::DbState;
use crate::errors::AppError;

/// Deletes all user data (banks, accounts, categories, budgets, transactions)
/// and inserts a sentinel config key `is_seeded = true` so seed_defaults()
/// knows not to re-seed on the next startup.
#[tauri::command]
pub fn db_reset_all_data(state: State<DbState>) -> Result<(), AppError> {
    let conn = state.get_conn()?;

    conn.execute_batch(
        "DELETE FROM transactions;
         DELETE FROM budgets;
         DELETE FROM accounts;
         DELETE FROM categories;
         DELETE FROM banks;
         INSERT OR REPLACE INTO config (key, value) VALUES ('is_seeded', 'true');"
    )?;

    Ok(())
}
