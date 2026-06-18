use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Budget;
use crate::auth::crypto::encrypt_data;

#[tauri::command]
pub fn db_set_budget_planned(state: tauri::State<'_, DbState>, budget: Budget) -> Result<(), AppError> {
    db_set_budget_planned_inner(&state, budget)
}

pub fn db_set_budget_planned_inner(state: &DbState, budget: Budget) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    let key = state.get_key()?;

    // Encrypt sensitive fields
    let enc_planned = encrypt_data(&budget.planned.to_string(), &key)?;

    conn.execute(
        "INSERT OR REPLACE INTO budgets (month, category_id, planned) VALUES (?1, ?2, ?3)",
        (&budget.month, &budget.category_id, &enc_planned),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_reset_current_plan(state: tauri::State<'_, DbState>, month: String) -> Result<(), AppError> {
    db_reset_current_plan_inner(&state, month)
}

pub fn db_reset_current_plan_inner(state: &DbState, month: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM budgets WHERE month = ?1", [&month])?;
    Ok(())
}
