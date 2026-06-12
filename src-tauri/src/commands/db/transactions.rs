use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Transaction;

#[tauri::command]
pub fn db_add_transaction(state: tauri::State<'_, DbState>, transaction: Transaction) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let shift_int = if transaction.shift_to_next_month { 1 } else { 0 };
    conn.execute(
        "INSERT INTO transactions (id, date, description, amount, account_id, category_id, shift_to_next_month, transfer_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        (&transaction.id, &transaction.date, &transaction.description, transaction.amount, &transaction.account_id, &transaction.category_id, shift_int, &transaction.transfer_id),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_update_transaction(state: tauri::State<'_, DbState>, transaction: Transaction) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let shift_int = if transaction.shift_to_next_month { 1 } else { 0 };
    conn.execute(
        "UPDATE transactions SET date = ?2, description = ?3, amount = ?4, account_id = ?5, category_id = ?6, shift_to_next_month = ?7, transfer_id = ?8 WHERE id = ?1",
        (&transaction.id, &transaction.date, &transaction.description, transaction.amount, &transaction.account_id, &transaction.category_id, shift_int, &transaction.transfer_id),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_delete_transaction(state: tauri::State<'_, DbState>, id: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM transactions WHERE id = ?1", [&id])?;
    Ok(())
}
