use tauri::State;
use crate::db::manager::DbState;
use crate::db::models::{Bank, Account, Category, Budget, Transaction};
use crate::errors::AppError;
use crate::auth::crypto::encrypt_data;
use serde::Deserialize;

#[derive(Deserialize, Clone)]
pub struct ImportPayload {
    pub banks: Vec<Bank>,
    pub accounts: Vec<Account>,
    pub categories: Vec<Category>,
    pub budgets: Vec<Budget>,
    pub transactions: Vec<Transaction>,
}

/// Atomically replaces ALL user data with the imported payload.
/// Runs inside a single SQLite transaction so the database is never
/// left in a partial state if something fails mid-import.
#[tauri::command]
pub fn db_import_all_data(
    state: State<DbState>,
    payload: ImportPayload,
) -> Result<(), AppError> {
    db_import_all_data_inner(&state, payload)
}

pub fn db_import_all_data_inner(
    state: &DbState,
    payload: ImportPayload,
) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let key = state.get_key()?;

    // Use a single atomic transaction for the whole import
    conn.execute_batch("BEGIN;")?;

    let result = (|| -> Result<(), AppError> {
        // 1. Wipe existing data (order matters due to foreign keys)
        conn.execute_batch(
            "DELETE FROM transactions;
             DELETE FROM budgets;
             DELETE FROM accounts;
             DELETE FROM categories;
             DELETE FROM banks;",
        )?;

        // 2. Insert banks
        for bank in &payload.banks {
            let enc_name = encrypt_data(&bank.name, &key)?;
            let enc_code = encrypt_data(&bank.code, &key)?;
            conn.execute(
                "INSERT INTO banks (id, name, code, color) VALUES (?1, ?2, ?3, ?4);",
                (&bank.id, &enc_name, &enc_code, &bank.color),
            )?;
        }

        // 3. Insert accounts
        for acc in &payload.accounts {
            let enc_name = encrypt_data(&acc.name, &key)?;
            let enc_starting = encrypt_data(&acc.starting_balance.to_string(), &key)?;
            let enc_balance = encrypt_data(&acc.balance.to_string(), &key)?;
            conn.execute(
                "INSERT INTO accounts (id, name, type, bank_id, starting_balance, balance) VALUES (?1, ?2, ?3, ?4, ?5, ?6);",
                (&acc.id, &enc_name, &acc.acc_type, &acc.bank_id, &enc_starting, &enc_balance),
            )?;
        }

        // 4. Insert categories
        for cat in &payload.categories {
            let enc_name = encrypt_data(&cat.name, &key)?;
            conn.execute(
                "INSERT INTO categories (id, name, parent_id) VALUES (?1, ?2, ?3);",
                (&cat.id, &enc_name, &cat.parent_id),
            )?;
        }

        // 5. Insert budgets
        for budget in &payload.budgets {
            let enc_planned = encrypt_data(&budget.planned.to_string(), &key)?;
            conn.execute(
                "INSERT INTO budgets (month, category_id, planned) VALUES (?1, ?2, ?3);",
                (&budget.month, &budget.category_id, &enc_planned),
            )?;
        }

        // 6. Insert transactions
        for tx in &payload.transactions {
            let enc_date = encrypt_data(&tx.date, &key)?;
            let enc_desc = encrypt_data(&tx.description, &key)?;
            let enc_amount = encrypt_data(&tx.amount.to_string(), &key)?;
            conn.execute(
                "INSERT INTO transactions (id, date, description, amount, account_id, category_id, shift_to_next_month, transfer_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);",
                (
                    &tx.id,
                    &enc_date,
                    &enc_desc,
                    &enc_amount,
                    &tx.account_id,
                    &tx.category_id,
                    tx.shift_to_next_month as i32,
                    &tx.transfer_id,
                ),
            )?;
        }

        Ok(())
    })();

    match result {
        Ok(_) => {
            conn.execute_batch("COMMIT;")?;
            Ok(())
        }
        Err(e) => {
            let _ = conn.execute_batch("ROLLBACK;");
            Err(e)
        }
    }
}
