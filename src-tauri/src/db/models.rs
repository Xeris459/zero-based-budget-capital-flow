use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Bank {
    pub id: String,
    pub name: String,
    pub code: String,
    pub color: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Account {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub acc_type: String,
    #[serde(rename = "bankId")]
    pub bank_id: String,
    #[serde(rename = "startingBalance")]
    pub starting_balance: f64,
    pub balance: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Category {
    pub id: String,
    pub name: String,
    #[serde(rename = "parentId")]
    pub parent_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Budget {
    pub month: String,
    #[serde(rename = "categoryId")]
    pub category_id: String,
    pub planned: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Transaction {
    pub id: String,
    pub date: String,
    pub description: String,
    pub amount: f64,
    #[serde(rename = "accountId")]
    pub account_id: String,
    #[serde(rename = "categoryId")]
    pub category_id: String,
    #[serde(rename = "shiftToNextMonth")]
    pub shift_to_next_month: bool,
    #[serde(rename = "transferId")]
    pub transfer_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InitialData {
    pub banks: Vec<Bank>,
    pub accounts: Vec<Account>,
    pub categories: Vec<Category>,
    pub budgets: Vec<Budget>,
    pub transactions: Vec<Transaction>,
    #[serde(rename = "kMode")]
    pub k_mode: bool,
    #[serde(rename = "currentMonth")]
    pub current_month: String,
    #[serde(rename = "currentYear")]
    pub current_year: String,
    #[serde(rename = "currencySymbol")]
    pub currency_symbol: String,
    #[serde(rename = "warningThreshold")]
    pub warning_threshold: f64,
    #[serde(rename = "glowEffects")]
    pub glow_effects: bool,
    #[serde(rename = "isSidebarCollapsed")]
    pub is_sidebar_collapsed: bool,
    #[serde(rename = "filterType")]
    pub filter_type: String,
    #[serde(rename = "plannerView")]
    pub planner_view: String,
}
