use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use app_lib::db::manager::DbState;
use app_lib::db::models::{Bank, Account, Category, Budget, Transaction};
use app_lib::commands::db::banks::*;
use app_lib::commands::db::accounts::*;
use app_lib::commands::db::categories::*;
use app_lib::commands::db::budgets::*;
use app_lib::commands::db::transactions::*;
use app_lib::auth::crypto::decrypt_data;

// Helper to generate a unique temporary database path for each test run
fn get_temp_db_path() -> PathBuf {
    let mut path = env::temp_dir();
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_nanos();
    path.push(format!("integration_test_{}.db", now));
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
fn test_comprehensive_database_commands() {
    let db_path = get_temp_db_path();
    let _guard = TestDbGuard { path: db_path.clone() };

    let state = DbState::new();
    state.unlock("test-pin", db_path).expect("Failed to unlock");
    
    let key = state.get_key().expect("Failed to get key");

    // 1. Test Banks
    let bank = Bank {
        id: "b1".to_string(),
        name: "Test Bank".to_string(),
        code: "TB".to_string(),
        color: "#fff".to_string(),
    };
    db_add_bank_inner(&state, bank.clone()).expect("Add bank failed");
    
    let conn = state.get_conn().unwrap();
    let bank_name_enc: String = conn.query_row("SELECT name FROM banks WHERE id = 'b1'", [], |r| r.get(0)).unwrap();
    let bank_name = decrypt_data(&bank_name_enc, &key).unwrap();
    assert_eq!(bank_name, "Test Bank");

    // 2. Test Accounts
    let account = Account {
        id: "a1".to_string(),
        name: "Test Acc".to_string(),
        acc_type: "checking".to_string(),
        bank_id: "b1".to_string(),
        starting_balance: 5000.0,
        balance: 5000.0,
        active: Some(true),
    };
    db_add_account_inner(&state, account.clone()).expect("Add account failed");
    
    let acc_name_enc: String = conn.query_row("SELECT name FROM accounts WHERE id = 'a1'", [], |r| r.get(0)).unwrap();
    let acc_name = decrypt_data(&acc_name_enc, &key).unwrap();
    assert_eq!(acc_name, "Test Acc");

    // 3. Test Categories
    let category = Category {
        id: "c1".to_string(),
        name: "Cat 1".to_string(),
        parent_id: "expenses".to_string(),
    };
    db_add_category_inner(&state, category.clone()).expect("Add category failed");
    
    let mut updated_cat = category.clone();
    updated_cat.name = "Cat 1 Updated".to_string();
    db_update_category_inner(&state, updated_cat).expect("Update category failed");
    
    let cat_name_enc: String = conn.query_row("SELECT name FROM categories WHERE id = 'c1'", [], |r| r.get(0)).unwrap();
    let cat_name = decrypt_data(&cat_name_enc, &key).unwrap();
    assert_eq!(cat_name, "Cat 1 Updated");

    // 4. Test Budgets
    let budget = Budget {
        month: "2026-06".to_string(),
        category_id: "c1".to_string(),
        planned: 1000.0,
    };
    db_set_budget_planned_inner(&state, budget).expect("Set budget failed");
    
    let planned_enc: String = conn.query_row("SELECT planned FROM budgets WHERE month = '2026-06' AND category_id = 'c1'", [], |r| r.get(0)).unwrap();
    let planned_str = decrypt_data(&planned_enc, &key).expect("Failed to decrypt planned");
    let planned: f64 = planned_str.parse().unwrap();
    assert_eq!(planned, 1000.0);

    // 5. Test Transactions
    let transaction = Transaction {
        id: "t1".to_string(),
        date: "2026-06-15".to_string(),
        description: "Test Trans".to_string(),
        amount: -50.0,
        account_id: "a1".to_string(),
        category_id: "c1".to_string(),
        shift_to_next_month: false,
        transfer_id: None,
    };
    db_add_transaction_inner(&state, transaction.clone()).expect("Add transaction failed");
    
    let mut updated_tx = transaction.clone();
    updated_tx.description = "Test Trans Updated".to_string();
    db_update_transaction_inner(&state, updated_tx).expect("Update transaction failed");
    
    let tx_desc_enc: String = conn.query_row("SELECT description FROM transactions WHERE id = 't1'", [], |r| r.get(0)).unwrap();
    let tx_desc = decrypt_data(&tx_desc_enc, &key).expect("Failed to decrypt description");
    assert_eq!(tx_desc, "Test Trans Updated");

    // 6. Test Deletion and Cascades
    db_delete_bank_inner(&state, "b1".to_string()).expect("Delete bank failed");
    let bank_count: i64 = conn.query_row("SELECT count(*) FROM banks WHERE id = 'b1'", [], |r| r.get(0)).unwrap();
    assert_eq!(bank_count, 0);
    // Account should be deleted via cascade
    let acc_count: i64 = conn.query_row("SELECT count(*) FROM accounts WHERE id = 'a1'", [], |r| r.get(0)).unwrap();
    assert_eq!(acc_count, 0);
}
