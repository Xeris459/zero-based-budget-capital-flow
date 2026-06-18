use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Category;
use crate::auth::crypto::encrypt_data;

#[tauri::command]
pub fn db_add_category(state: tauri::State<'_, DbState>, category: Category) -> Result<(), AppError> {
    db_add_category_inner(&state, category)
}

pub fn db_add_category_inner(state: &DbState, category: Category) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let key = state.get_key()?;

    // Encrypt sensitive fields
    let enc_name = encrypt_data(&category.name, &key)?;

    conn.execute(
        "INSERT INTO categories (id, name, parent_id, global_category) VALUES (?1, ?2, ?3, ?4)",
        (&category.id, &enc_name, &category.parent_id, &category.global_category),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_delete_category(state: tauri::State<'_, DbState>, id: String) -> Result<(), AppError> {
    db_delete_category_inner(&state, id)
}

pub fn db_delete_category_inner(state: &DbState, id: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM categories WHERE id = ?1", [&id])?;
    Ok(())
}

#[tauri::command]
pub fn db_update_category(state: tauri::State<'_, DbState>, category: Category) -> Result<(), AppError> {
    db_update_category_inner(&state, category)
}

pub fn db_update_category_inner(state: &DbState, category: Category) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let key = state.get_key()?;

    // Encrypt sensitive fields
    let enc_name = encrypt_data(&category.name, &key)?;

    conn.execute(
        "UPDATE categories SET name = ?1, parent_id = ?2, global_category = ?3 WHERE id = ?4",
        (&enc_name, &category.parent_id, &category.global_category, &category.id),
    )?;
    Ok(())
}
