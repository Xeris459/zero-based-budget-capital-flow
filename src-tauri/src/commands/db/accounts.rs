use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Account;

#[tauri::command]
pub fn db_add_account(state: tauri::State<'_, DbState>, account: Account) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let active_val = account.active.unwrap_or(true) as i32;
    conn.execute(
        "INSERT INTO accounts (id, name, type, bank_id, starting_balance, balance, active) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (&account.id, &account.name, &account.acc_type, &account.bank_id, account.starting_balance, account.balance, active_val),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_update_account(state: tauri::State<'_, DbState>, account: Account) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let active_val = account.active.unwrap_or(true) as i32;
    conn.execute(
        "UPDATE accounts SET name = ?2, type = ?3, bank_id = ?4, starting_balance = ?5, balance = ?6, active = ?7 WHERE id = ?1",
        (&account.id, &account.name, &account.acc_type, &account.bank_id, account.starting_balance, account.balance, active_val),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_delete_account(state: tauri::State<'_, DbState>, id: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM accounts WHERE id = ?1", [&id])?;
    Ok(())
}
