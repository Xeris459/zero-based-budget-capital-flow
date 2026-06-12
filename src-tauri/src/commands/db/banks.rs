use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Bank;

#[tauri::command]
pub fn db_add_bank(state: tauri::State<'_, DbState>, bank: Bank) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute(
        "INSERT INTO banks (id, name, code, color) VALUES (?1, ?2, ?3, ?4)",
        [&bank.id, &bank.name, &bank.code, &bank.color],
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_delete_bank(state: tauri::State<'_, DbState>, id: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM banks WHERE id = ?1", [&id])?;
    Ok(())
}
