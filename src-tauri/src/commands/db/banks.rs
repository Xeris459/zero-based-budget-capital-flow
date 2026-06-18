use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Bank;
use crate::auth::crypto::encrypt_data;

#[tauri::command]
pub fn db_add_bank(state: tauri::State<'_, DbState>, bank: Bank) -> Result<(), AppError> {
    db_add_bank_inner(&state, bank)
}

pub fn db_add_bank_inner(state: &DbState, bank: Bank) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let key = state.get_key()?;

    // Encrypt sensitive fields
    let enc_name = encrypt_data(&bank.name, &key)?;
    let enc_code = encrypt_data(&bank.code, &key)?;

    conn.execute(
        "INSERT INTO banks (id, name, code, color) VALUES (?1, ?2, ?3, ?4)",
        (&bank.id, &enc_name, &enc_code, &bank.color),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_delete_bank(state: tauri::State<'_, DbState>, id: String) -> Result<(), AppError> {
    db_delete_bank_inner(&state, id)
}

pub fn db_delete_bank_inner(state: &DbState, id: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM banks WHERE id = ?1", [&id])?;
    Ok(())
}
