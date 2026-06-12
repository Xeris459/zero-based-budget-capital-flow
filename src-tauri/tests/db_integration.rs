use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use app_lib::db::manager::DbState;
use app_lib::auth::crypto::{encrypt_data, decrypt_data};

// Helper to generate a unique temporary database file path
fn get_temp_db_path() -> PathBuf {
    let mut path = env::temp_dir();
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_nanos();
    path.push(format!("test_zbb_{}.db", now));
    path
}

// Struct to auto-delete database files when a test finishes or panics
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
fn test_db_state_initial_lock() {
    let state = DbState::new();
    
    // Connections and key retrieval should fail when locked
    let conn_res = state.get_conn();
    assert!(conn_res.is_err(), "Expected connection retrieval to fail when database is locked");
    
    let key_res = state.get_key();
    assert!(key_res.is_err(), "Expected key retrieval to fail when database is locked");
}

#[test]
fn test_db_unlock_and_migration_seeding() {
    let db_path = get_temp_db_path();
    let _guard = TestDbGuard { path: db_path.clone() };
    
    let state = DbState::new();
    assert!(!db_path.exists(), "Temporary database should not exist initially");
    
    // Unlock new database (which should run migrations & seed defaults)
    let unlock_res = state.unlock("my-test-pin", db_path.clone());
    assert!(unlock_res.is_ok(), "Failed to unlock new database path");
    assert!(unlock_res.unwrap(), "Unlock should return true on success");
    assert!(db_path.exists(), "Database file should be created on disk");
    
    // Get connection and verify seeded defaults
    let conn = state.get_conn().expect("Failed to get connection pool");
    let key = state.get_key().expect("Failed to get derived key");
    assert_eq!(key.len(), 32);
    
    // Query seeded config table
    let mut config_stmt = conn.prepare("SELECT value FROM config WHERE key = 'currentMonth'").expect("Failed to query config");
    let mut config_rows = config_stmt.query([]).expect("Failed to execute query");
    let first_row = config_rows.next().expect("No rows returned").expect("Expected at least one row");
    let current_month: String = first_row.get(0).expect("Failed to read column");
    assert_eq!(current_month, "06");
    
    // Query seeded banks table (should have 4 banks)
    let bank_count: i64 = conn.query_row("SELECT count(*) FROM banks", [], |row| row.get(0)).expect("Failed to count banks");
    assert_eq!(bank_count, 4);
    
    // Query seeded categories (should have 12 categories)
    let category_count: i64 = conn.query_row("SELECT count(*) FROM categories", [], |row| row.get(0)).expect("Failed to count categories");
    assert_eq!(category_count, 12);
}

#[test]
fn test_db_unlock_incorrect_vs_correct_pin() {
    let db_path = get_temp_db_path();
    let _guard = TestDbGuard { path: db_path.clone() };
    
    let state_init = DbState::new();
    state_init.unlock("correct-secret-pin", db_path.clone()).expect("Failed first unlock");
    
    // Write an encrypted state to the secure_store to enable fallback decryption validation
    {
        let conn = state_init.get_conn().expect("Failed to get connection");
        let key = state_init.get_key().expect("Failed to get key");
        
        let encrypted_state = encrypt_data("{\"user_data\": \"budget_123\"}", &key)
            .expect("Failed to encrypt test state");
            
        conn.execute(
            "INSERT OR REPLACE INTO secure_store (key, value) VALUES ('state', ?1)",
            [&encrypted_state],
        ).expect("Failed to insert test secure_store state");
    }
    
    // Create a new locked DbState and attempt to unlock with incorrect PIN
    let state_test = DbState::new();
    let unlock_wrong = state_test.unlock("wrong-pin", db_path.clone());
    
    // Should fail because decryption of 'state' key in secure_store fails
    assert!(unlock_wrong.is_err(), "Expected unlock with wrong PIN to fail");
    assert!(state_test.get_conn().is_err(), "DbState should remain locked after failed unlock");
    
    // Now unlock with correct PIN
    let unlock_correct = state_test.unlock("correct-secret-pin", db_path.clone());
    assert!(unlock_correct.is_ok(), "Expected unlock with correct PIN to succeed");
    assert!(unlock_correct.unwrap());
    
    // Verify we can access the connection and decrypt the state successfully
    let conn = state_test.get_conn().expect("Failed to get connection after correct unlock");
    let key = state_test.get_key().expect("Failed to get key after correct unlock");
    
    let encrypted_val: String = conn.query_row(
        "SELECT value FROM secure_store WHERE key = 'state'",
        [],
        |row| row.get(0)
    ).expect("Failed to retrieve encrypted state");
    
    let decrypted_val = decrypt_data(&encrypted_val, &key).expect("Failed to decrypt state");
    assert_eq!(decrypted_val, "{\"user_data\": \"budget_123\"}");
}
