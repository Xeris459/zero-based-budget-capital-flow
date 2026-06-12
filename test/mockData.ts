import type { Bank, Account, Category, Budget, Transaction } from '~/types'

export const DEFAULT_BANKS: Bank[] = [
  { id: 'bank-bca', name: 'Bank BCA', code: 'BCA', color: '#6366f1' }, // Indigo
  { id: 'bank-jago', name: 'Bank Jago', code: 'Jago', color: '#4edea3' }, // Emerald
  { id: 'bank-mandiri', name: 'Bank Mandiri', code: 'Mandiri', color: '#ffb95f' }, // Amber
  { id: 'bank-cash', name: 'Pocket Cash', code: 'CASH', color: '#908fa0' } // Slate
]

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-checking', name: 'Checking Account', type: 'checking', bankId: 'bank-bca', startingBalance: 12500000, balance: 12500000 },
  { id: 'acc-savings', name: 'High-Yield Savings', type: 'savings', bankId: 'bank-jago', startingBalance: 30000000, balance: 30000000 },
  { id: 'acc-credit', name: 'Reward Credit Card', type: 'credit_card', bankId: 'bank-mandiri', startingBalance: -2700000, balance: -2700000 },
  { id: 'acc-cash', name: 'Wallet Cash', type: 'cash', bankId: 'bank-cash', startingBalance: 5400000, balance: 5400000 }
]

export const DEFAULT_CATEGORIES: Category[] = [
  // Income Sources
  { id: 'cat-inc-salary', name: 'Primary Salary', parentId: 'income' },
  { id: 'cat-inc-side', name: 'Side Hustle', parentId: 'income' },
  { id: 'cat-inc-div', name: 'Dividends', parentId: 'income' },

  // Expenses
  { id: 'cat-exp-housing', name: 'Housing', parentId: 'expenses' },
  { id: 'cat-exp-food', name: 'Food', parentId: 'expenses' },
  { id: 'cat-exp-utils', name: 'Utilities', parentId: 'expenses' },
  { id: 'cat-exp-ent', name: 'Entertainment', parentId: 'expenses' },

  // Savings Goals
  { id: 'cat-sav-emg', name: 'Emergency Fund', parentId: 'savings' },
  { id: 'cat-sav-ret', name: 'Retirement', parentId: 'savings' },
  { id: 'cat-sav-vac', name: 'Vacation', parentId: 'savings' },
  { id: 'cat-sav-car', name: 'New Car', parentId: 'savings' },

  // Debt Payments
  { id: 'cat-debt-cc', name: 'Credit Card Payment', parentId: 'debt' }
]

// Budget allocations for 2026-06 (Total Planned Income = Rp 15.000.000, Total Assigned = Rp 15.000.000)
export const DEFAULT_BUDGETS: Budget[] = [
  // Income Plans
  { month: '2026-06', categoryId: 'cat-inc-salary', planned: 10000000 },
  { month: '2026-06', categoryId: 'cat-inc-side', planned: 3500000 },
  { month: '2026-06', categoryId: 'cat-inc-div', planned: 1500000 },

  // Expense Plans
  { month: '2026-06', categoryId: 'cat-exp-housing', planned: 5000000 },
  { month: '2026-06', categoryId: 'cat-exp-food', planned: 2500000 },
  { month: '2026-06', categoryId: 'cat-exp-utils', planned: 1500000 },
  { month: '2026-06', categoryId: 'cat-exp-ent', planned: 1000000 },

  // Savings Plans
  { month: '2026-06', categoryId: 'cat-sav-emg', planned: 1000000 },
  { month: '2026-06', categoryId: 'cat-sav-ret', planned: 1000000 },
  { month: '2026-06', categoryId: 'cat-sav-vac', planned: 300000 },
  { month: '2026-06', categoryId: 'cat-sav-car', planned: 200000 },

  // Debt Payoff Plans
  { month: '2026-06', categoryId: 'cat-debt-cc', planned: 2500000 }
]

// Transactions for 2026-06 (Total spent: Rp 6.300K)
export const DEFAULT_TRANSACTIONS: Transaction[] = [
  // June Incomes (Actual)
  { id: 'tx-inc-1', date: '2026-06-01', description: 'Monthly Salary Paycheck', amount: 10000000, accountId: 'acc-checking', categoryId: 'cat-inc-salary', shiftToNextMonth: false },
  { id: 'tx-inc-2', date: '2026-06-03', description: 'Side Hustle Coding Project', amount: 2625000, accountId: 'acc-checking', categoryId: 'cat-inc-side', shiftToNextMonth: false },
  { id: 'tx-inc-3', date: '2026-06-05', description: 'Dividends Pay', amount: 750000, accountId: 'acc-savings', categoryId: 'cat-inc-div', shiftToNextMonth: false },

  // June Spent
  { id: 'tx-exp-1', date: '2026-06-02', description: 'Apartment Rental Payment', amount: -2205000, accountId: 'acc-checking', categoryId: 'cat-exp-housing', shiftToNextMonth: false },
  { id: 'tx-exp-2', date: '2026-06-04', description: 'Supermarket Groceries', amount: -650000, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false },
  { id: 'tx-exp-3', date: '2026-06-07', description: 'Weekend Restaurant Outing', amount: -610000, accountId: 'acc-cash', categoryId: 'cat-exp-food', shiftToNextMonth: false },
  { id: 'tx-exp-4', date: '2026-06-05', description: 'Electricity & Wifi Bill', amount: -756000, accountId: 'acc-checking', categoryId: 'cat-exp-utils', shiftToNextMonth: false },
  { id: 'tx-exp-5', date: '2026-06-06', description: 'Emergency Fund Transfer', amount: -1008000, accountId: 'acc-savings', categoryId: 'cat-sav-emg', shiftToNextMonth: false },
  { id: 'tx-exp-6', date: '2026-06-08', description: 'Minimum Credit Card Pay', amount: -630000, accountId: 'acc-checking', categoryId: 'cat-debt-cc', shiftToNextMonth: false },
  { id: 'tx-exp-7', date: '2026-06-09', description: 'Cinema Tickets & Snacks', amount: -441000, accountId: 'acc-cash', categoryId: 'cat-exp-ent', shiftToNextMonth: false },

  // Historic transactions (May 2026)
  { id: 'tx-may-inc-1', date: '2026-05-01', description: 'Salary May', amount: 10000000, accountId: 'acc-checking', categoryId: 'cat-inc-salary', shiftToNextMonth: false },
  { id: 'tx-may-inc-2', date: '2026-05-04', description: 'Freelance May', amount: 3000000, accountId: 'acc-checking', categoryId: 'cat-inc-side', shiftToNextMonth: false },
  { id: 'tx-may-exp-1', date: '2026-05-02', description: 'Rent May', amount: -5000000, accountId: 'acc-checking', categoryId: 'cat-exp-housing', shiftToNextMonth: false },
  { id: 'tx-may-exp-2', date: '2026-05-05', description: 'Food May', amount: -2200000, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false },
  { id: 'tx-may-exp-3', date: '2026-05-06', description: 'Internet May', amount: -800000, accountId: 'acc-checking', categoryId: 'cat-exp-utils', shiftToNextMonth: false },
  { id: 'tx-may-exp-4', date: '2026-05-10', description: 'Saving May', amount: -1500000, accountId: 'acc-savings', categoryId: 'cat-sav-emg', shiftToNextMonth: false }
]

export function populateMockData(store: any) {
  store.banks = JSON.parse(JSON.stringify(DEFAULT_BANKS))
  store.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS))
  store.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES))
  store.budgets = JSON.parse(JSON.stringify(DEFAULT_BUDGETS))
  store.transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS))
  store.recalculateAccountBalances()
}
