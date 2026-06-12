use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::commands::get_db_path;

#[tauri::command]
pub fn has_pin_setup(app_handle: tauri::AppHandle) -> Result<bool, AppError> {
    let db_path = get_db_path(&app_handle)?;
    Ok(db_path.exists())
}

#[tauri::command]
pub fn register_pin(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, DbState>,
    pin: String,
) -> Result<bool, AppError> {
    let db_path = get_db_path(&app_handle)?;
    if db_path.exists() {
        return Err(AppError::Auth("PIN is already registered. Delete the database file to reset.".to_string()));
    }
    
    state.unlock(&pin, db_path)
}

#[tauri::command]
pub fn unlock_db(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, DbState>,
    pin: String,
) -> Result<bool, AppError> {
    let db_path = get_db_path(&app_handle)?;
    if !db_path.exists() {
        return Err(AppError::Auth("PIN has not been registered yet.".to_string()));
    }
    
    state.unlock(&pin, db_path)
}

#[tauri::command]
pub fn hash_credential(plain: String) -> Result<String, AppError> {
    crate::auth::crypto::hash_credential(&plain)
}

#[tauri::command]
pub fn verify_credential(plain: String, hash: String) -> Result<bool, AppError> {
    crate::auth::crypto::verify_credential(&plain, &hash)
}

#[tauri::command]
pub fn unlock_db_from_keyring(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, DbState>,
) -> Result<String, AppError> {
    let entry = keyring::Entry::new("capital-flow", "database_pin")
        .map_err(|e| AppError::System(format!("Keyring initialization failed: {}", e)))?;
        
    let pin = entry.get_password()
        .map_err(|e| AppError::Auth(format!("No PIN was saved in secure storage: {}", e)))?;
        
    let db_path = get_db_path(&app_handle)?;
    state.unlock(&pin, db_path)?;
    
    Ok(pin)
}
