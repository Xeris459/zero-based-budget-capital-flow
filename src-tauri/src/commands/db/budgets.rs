use crate::errors::AppError;
use crate::db::manager::DbState;
use crate::db::models::Budget;

#[tauri::command]
pub fn db_set_budget_planned(state: tauri::State<'_, DbState>, budget: Budget) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute(
        "INSERT OR REPLACE INTO budgets (month, category_id, planned) VALUES (?1, ?2, ?3)",
        (&budget.month, &budget.category_id, budget.planned),
    )?;
    Ok(())
}

#[tauri::command]
pub fn db_reset_current_plan(state: tauri::State<'_, DbState>, month: String) -> Result<(), AppError> {
    let conn = state.get_conn()?;
    conn.execute("DELETE FROM budgets WHERE month = ?1", [&month])?;
    Ok(())
}
