pub mod errors;
pub mod auth {
    pub mod crypto;
    pub mod biometrics;
}
pub mod db {
    pub mod manager;
    pub mod models;
}
pub mod commands;

use crate::db::manager::DbState;
use tauri::Manager;
use tauri_plugin_decorum::WebviewWindowExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_decorum::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .manage(DbState::new())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      // Create a custom overlay titlebar (hides native chrome but keeps Snap Layout)
      let main_window = app.get_webview_window("main").unwrap();
      main_window.create_overlay_titlebar().unwrap();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::auth::has_pin_setup,
      commands::auth::register_pin,
      commands::auth::unlock_db,
      commands::auth::hash_credential,
      commands::auth::verify_credential,
      commands::auth::unlock_db_from_keyring,
      commands::biometrics::check_biometric_available,
      commands::biometrics::enable_biometric,
      commands::biometrics::disable_biometric,
      commands::biometrics::authenticate_biometric,
      commands::db::initial::db_get_initial_data,
      commands::db::banks::db_add_bank,
      commands::db::banks::db_delete_bank,
      commands::db::accounts::db_add_account,
      commands::db::accounts::db_update_account,
      commands::db::accounts::db_delete_account,
      commands::db::categories::db_add_category,
      commands::db::categories::db_update_category,
      commands::db::categories::db_delete_category,
      commands::db::budgets::db_set_budget_planned,
      commands::db::budgets::db_reset_current_plan,
      commands::db::transactions::db_add_transaction,
      commands::db::transactions::db_update_transaction,
      commands::db::transactions::db_delete_transaction,
      commands::db::initial::db_save_config,
      commands::db::reset::db_reset_all_data,
      commands::db::import::db_import_all_data,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
