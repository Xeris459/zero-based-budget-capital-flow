pub mod auth;
pub mod biometrics;
pub mod db;

use std::path::PathBuf;
use tauri::Manager;
use crate::errors::AppError;

// Shared DRY helper to get the database path
pub fn get_db_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, AppError> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| AppError::System(format!("Failed to resolve app data directory: {}", e)))?;
    
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir)
            .map_err(|e| AppError::System(format!("Failed to create app data directory: {}", e)))?;
    }
    
    Ok(app_dir.join("zero_based_budget.db"))
}
