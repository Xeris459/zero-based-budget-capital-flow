use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::commands::get_db_path;
use crate::auth::biometrics;
use keyring::Entry;

#[tauri::command]
pub async fn check_biometric_available() -> Result<bool, AppError> {
    biometrics::is_biometric_available().await
}

#[tauri::command]
pub fn enable_biometric(pin: String) -> Result<(), AppError> {
    let entry = Entry::new("capital-flow", "database_pin")
        .map_err(|e| AppError::System(format!("Keyring initialization failed: {}", e)))?;
    
    entry.set_password(&pin)
        .map_err(|e| AppError::System(format!("Failed to save PIN to keyring: {}", e)))?;
    
    Ok(())
}

#[tauri::command]
pub fn disable_biometric() -> Result<(), AppError> {
    let entry = Entry::new("capital-flow", "database_pin")
        .map_err(|e| AppError::System(format!("Keyring initialization failed: {}", e)))?;
    
    let _ = entry.delete_password();
    Ok(())
}

#[tauri::command]
pub async fn authenticate_biometric(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, DbState>,
) -> Result<String, AppError> {
    // 1. Trigger Windows Hello prompt
    let verified = biometrics::authenticate_with_biometrics("Access Capital Flow").await?;
    if !verified {
        return Err(AppError::Auth("Biometric authentication was cancelled or rejected.".to_string()));
    }
    
    // 2. Fetch PIN from keyring
    let entry = Entry::new("capital-flow", "database_pin")
        .map_err(|e| AppError::System(format!("Keyring initialization failed: {}", e)))?;
        
    let pin = entry.get_password()
        .map_err(|e| AppError::Auth(format!("Biometrics verified, but no PIN was saved in secure storage: {}", e)))?;
        
    // 3. Unlock database
    let db_path = get_db_path(&app_handle)?;
    state.unlock(&pin, db_path)?;
    
    Ok(pin)
}
