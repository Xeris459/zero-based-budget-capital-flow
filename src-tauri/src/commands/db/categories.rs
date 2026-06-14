use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Category;

#[tauri::command]
pub fn db_add_category(state: tauri::State<'_, DbState>, category: Category) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute(
        "INSERT INTO categories (id, name, parent_id) VALUES (?1, ?2, ?3)",
        [&category.id, &category.name, &category.parent_id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_delete_category(state: tauri::State<'_, DbState>, id: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM categories WHERE id = ?1", [&id])?;
    Ok(())
}

#[tauri::command]
pub fn db_update_category(state: tauri::State<'_, DbState>, category: Category) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute(
        "UPDATE categories SET name = ?1, parent_id = ?2 WHERE id = ?3",
        [&category.name, &category.parent_id, &category.id],
    )?;
    Ok(())
}
