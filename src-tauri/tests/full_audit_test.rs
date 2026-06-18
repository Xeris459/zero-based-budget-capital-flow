use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use app_lib::db::manager::DbState;
use app_lib::db::models::{Bank, Category};
use app_lib::commands::db::banks::*;
use app_lib::commands::db::categories::*;
use app_lib::commands::db::initial::*;
use app_lib::commands::db::reset::*;
use app_lib::commands::db::import::*;
use app_lib::commands::auth::*;

// Helper to generate a unique temporary database file path
fn get_temp_db_path() -> PathBuf {
    let mut path = env::temp_dir();
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_nanos();
    path.push(format!("full_audit_{}.db", now));
    path
}

struct TestDbGuard {
    path: PathBuf,
}

impl Drop for TestDbGuard {
    fn drop(&mut self) {
        if self.path.exists() {
            let _ = fs::remove_file(&self.path);
        }
    }
}

#[test]
fn test_auth_workflow() {
    let db_path = get_temp_db_path();
    let _guard = TestDbGuard { path: db_path.clone() };
    let state = DbState::new();

    // 1. Initial state: no PIN setup
    assert!(!has_pin_setup_inner(db_path.clone()).unwrap());

    // 2. Register PIN
    register_pin_inner(&state, "secret123".to_string(), db_path.clone()).expect("Failed to register");
    
    // Explicitly check file existence
    assert!(db_path.exists(), "Database file should exist after registration");
    assert!(has_pin_setup_inner(db_path.clone()).unwrap());

    // 3. Registering again should fail because file exists
    let res = register_pin_inner(&state, "new".to_string(), db_path.clone());
    assert!(res.is_err(), "Expected error when registering PIN again for existing DB");

    // 4. Unlock with wrong PIN
    let state2 = DbState::new();
    
    // Let's add a state key to make PIN validation work
    {
        let conn = state.get_conn().unwrap();
        let key = state.get_key().unwrap();
        let encrypted = app_lib::auth::crypto::encrypt_data("{\"ok\":true}", &key).unwrap();
        conn.execute("INSERT INTO secure_store (key, value) VALUES ('state', ?1)", [encrypted]).unwrap();
    }

    let res_wrong = unlock_db_inner(&state2, "wrong".to_string(), db_path.clone());
    assert!(res_wrong.is_err(), "Expected error when unlocking with wrong PIN");

    // 5. Unlock with correct PIN
    unlock_db_inner(&state2, "secret123".to_string(), db_path.clone()).expect("Failed to unlock");
    assert!(state2.get_conn().is_ok());
}

#[test]
fn test_data_management_workflow() {
    let db_path = get_temp_db_path();
    let _guard = TestDbGuard { path: db_path.clone() };
    let state = DbState::new();
    state.unlock("test", db_path).unwrap();

    // 1. Save Config
    db_save_config_inner(&state, "currencySymbol".to_string(), "$".to_string()).unwrap();
    
    // 2. Add Bank
    db_add_bank_inner(&state, Bank {
        id: "b1".to_string(),
        name: "Test Bank".to_string(),
        code: "TB".to_string(),
        color: "#fff".to_string(),
    }).unwrap();

    // 3. Add Category
    db_add_category_inner(&state, Category {
        id: "c1".to_string(),
        name: "Cat 1".to_string(),
        parent_id: "expenses".to_string(),
    }).unwrap();

    // 4. Get Initial Data
    let initial = db_get_initial_data_inner(&state).unwrap();
    assert_eq!(initial.currency_symbol, "$");
    assert_eq!(initial.banks.len(), 1);
    // 1 added ("c1") + 1 fallback ("cat-debt-cc") = 2
    assert_eq!(initial.categories.len(), 2, "Categories should contain 1 added + 1 fallback");

    // 5. Reset Data
    db_reset_all_data_inner(&state).unwrap();
    let initial_post = db_get_initial_data_inner(&state).unwrap();
    assert_eq!(initial_post.banks.len(), 0);
    assert_eq!(initial_post.categories.len(), 0);

    // 6. Import Data
    let payload = ImportPayload {
        banks: vec![Bank { id: "ib1".to_string(), name: "Imp Bank".to_string(), code: "IB".to_string(), color: "#000".to_string() }],
        accounts: vec![],
        categories: vec![],
        budgets: vec![],
        transactions: vec![],
    };
    db_import_all_data_inner(&state, payload).unwrap();
    let initial_imp = db_get_initial_data_inner(&state).unwrap();
    assert_eq!(initial_imp.banks.len(), 1);
    assert_eq!(initial_imp.banks[0].id, "ib1");
}
