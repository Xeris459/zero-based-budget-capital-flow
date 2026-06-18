use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Account;
use crate::auth::crypto::encrypt_data;

#[tauri::command]
pub fn db_add_account(state: tauri::State<'_, DbState>, account: Account) -> Result<(), AppError> {
    db_add_account_inner(&state, account)
}

pub fn db_add_account_inner(state: &DbState, account: Account) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let key = state.get_key()?;
    let active_val = account.active.unwrap_or(true) as i32;

    // Encrypt sensitive fields
    let enc_name = encrypt_data(&account.name, &key)?;
    let enc_starting = encrypt_data(&account.starting_balance.to_string(), &key)?;
    let enc_balance = encrypt_data(&account.balance.to_string(), &key)?;

    conn.execute(
        "INSERT INTO accounts (id, name, type, bank_id, starting_balance, balance, active) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (&account.id, &enc_name, &account.acc_type, &account.bank_id, &enc_starting, &enc_balance, active_val),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_update_account(state: tauri::State<'_, DbState>, account: Account) -> Result<(), AppError> {
    db_update_account_inner(&state, account)
}

pub fn db_update_account_inner(state: &DbState, account: Account) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let key = state.get_key()?;
    let active_val = account.active.unwrap_or(true) as i32;

    // Encrypt sensitive fields
    let enc_name = encrypt_data(&account.name, &key)?;
    let enc_starting = encrypt_data(&account.starting_balance.to_string(), &key)?;
    let enc_balance = encrypt_data(&account.balance.to_string(), &key)?;

    conn.execute(
        "UPDATE accounts SET name = ?2, type = ?3, bank_id = ?4, starting_balance = ?5, balance = ?6, active = ?7 WHERE id = ?1",
        (&account.id, &enc_name, &account.acc_type, &account.bank_id, &enc_starting, &enc_balance, active_val),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_delete_account(state: tauri::State<'_, DbState>, id: String) -> Result<(), AppError> {
    db_delete_account_inner(&state, id)
}

pub fn db_delete_account_inner(state: &DbState, id: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM accounts WHERE id = ?1", [&id])?;
    Ok(())
}
