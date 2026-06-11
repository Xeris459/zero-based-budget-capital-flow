import { defineStore } from 'pinia'

// Types
export interface Bank {
  id: string
  name: string
  code: string
  color: string // Tailwind color class or hex
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit_card' | 'cash'
  bankId: string
  startingBalance: number
  balance: number
}

export interface Category {
  id: string
  name: string
  parentId: 'income' | 'expenses' | 'savings' | 'debt'
}

export interface Budget {
  month: string // YYYY-MM
  categoryId: string
  planned: number
}

export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  description: string
  amount: number // positive for inflow, negative for outflow
  accountId: string
  categoryId: string // references Category.id
  shiftToNextMonth: boolean
  transferId?: string // linked transaction ID for transfers
}

export interface AppState {
  banks: Bank[]
  accounts: Account[]
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
  kMode: boolean
  currentMonth: string // YYYY-MM
  currentYear: string // YYYY
}

// Default Seed Data
const DEFAULT_BANKS: Bank[] = [
  { id: 'bank-bca', name: 'Bank BCA', code: 'BCA', color: '#6366f1' }, // Indigo
  { id: 'bank-jago', name: 'Bank Jago', code: 'Jago', color: '#4edea3' }, // Emerald
  { id: 'bank-mandiri', name: 'Bank Mandiri', code: 'Mandiri', color: '#ffb95f' }, // Amber
  { id: 'bank-cash', name: 'Pocket Cash', code: 'CASH', color: '#908fa0' } // Slate
]

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-checking', name: 'Checking Account', type: 'checking', bankId: 'bank-bca', startingBalance: 12500000, balance: 12500000 },
  { id: 'acc-savings', name: 'High-Yield Savings', type: 'savings', bankId: 'bank-jago', startingBalance: 30000000, balance: 30000000 },
  { id: 'acc-credit', name: 'Reward Credit Card', type: 'credit_card', bankId: 'bank-mandiri', startingBalance: -2700000, balance: -2700000 },
  { id: 'acc-cash', name: 'Wallet Cash', type: 'cash', bankId: 'bank-cash', startingBalance: 5400000, balance: 5400000 }
]

const DEFAULT_CATEGORIES: Category[] = [
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
const DEFAULT_BUDGETS: Budget[] = [
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
// Sum of spent: Housing (Rp 2.205K), Food (Rp 1.260K), Utilities (Rp 756K), Savings (Rp 1.008K), Debt (Rp 630K), Entertainment (Rp 441K)
const DEFAULT_TRANSACTIONS: Transaction[] = [
  // June Incomes (Actual)
  { id: 'tx-inc-1', date: '2026-06-01', description: 'Monthly Salary Paycheck', amount: 10000000, accountId: 'acc-checking', categoryId: 'cat-inc-salary', shiftToNextMonth: false },
  { id: 'tx-inc-2', date: '2026-06-03', description: 'Side Hustle Coding Project', amount: 2625000, accountId: 'acc-checking', categoryId: 'cat-inc-side', shiftToNextMonth: false }, // 75% of planned 3.5M
  { id: 'tx-inc-3', date: '2026-06-05', description: 'Dividends Pay', amount: 750000, accountId: 'acc-savings', categoryId: 'cat-inc-div', shiftToNextMonth: false }, // 50% of planned 1.5M

  // June Spent
  // Housing (Rp 2.205K spent)
  { id: 'tx-exp-1', date: '2026-06-02', description: 'Apartment Rental Payment', amount: -2205000, accountId: 'acc-checking', categoryId: 'cat-exp-housing', shiftToNextMonth: false },

  // Food (Rp 1.260K spent)
  { id: 'tx-exp-2', date: '2026-06-04', description: 'Supermarket Groceries', amount: -650000, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false },
  { id: 'tx-exp-3', date: '2026-06-07', description: 'Weekend Restaurant Outing', amount: -610000, accountId: 'acc-cash', categoryId: 'cat-exp-food', shiftToNextMonth: false },

  // Utilities (Rp 756K spent)
  { id: 'tx-exp-4', date: '2026-06-05', description: 'Electricity & Wifi Bill', amount: -756000, accountId: 'acc-checking', categoryId: 'cat-exp-utils', shiftToNextMonth: false },

  // Savings (Rp 1.008K spent)
  { id: 'tx-exp-5', date: '2026-06-06', description: 'Emergency Fund Transfer', amount: -1008000, accountId: 'acc-savings', categoryId: 'cat-sav-emg', shiftToNextMonth: false },

  // Debt Payment (Rp 630K spent)
  { id: 'tx-exp-6', date: '2026-06-08', description: 'Minimum Credit Card Pay', amount: -630000, accountId: 'acc-checking', categoryId: 'cat-debt-cc', shiftToNextMonth: false },

  // Entertainment (Rp 441K spent)
  { id: 'tx-exp-7', date: '2026-06-09', description: 'Cinema Tickets & Snacks', amount: -441000, accountId: 'acc-cash', categoryId: 'cat-exp-ent', shiftToNextMonth: false },

  // Seed some historic transactions (May 2026) for Trend Charts
  // May Inflows
  { id: 'tx-may-inc-1', date: '2026-05-01', description: 'Salary May', amount: 10000000, accountId: 'acc-checking', categoryId: 'cat-inc-salary', shiftToNextMonth: false },
  { id: 'tx-may-inc-2', date: '2026-05-04', description: 'Freelance May', amount: 3000000, accountId: 'acc-checking', categoryId: 'cat-inc-side', shiftToNextMonth: false },
  // May Outflows
  { id: 'tx-may-exp-1', date: '2026-05-02', description: 'Rent May', amount: -5000000, accountId: 'acc-checking', categoryId: 'cat-exp-housing', shiftToNextMonth: false },
  { id: 'tx-may-exp-2', date: '2026-05-05', description: 'Food May', amount: -2200000, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false },
  { id: 'tx-may-exp-3', date: '2026-05-06', description: 'Internet May', amount: -800000, accountId: 'acc-checking', categoryId: 'cat-exp-utils', shiftToNextMonth: false },
  { id: 'tx-may-exp-4', date: '2026-05-10', description: 'Saving May', amount: -1500000, accountId: 'acc-savings', categoryId: 'cat-sav-emg', shiftToNextMonth: false }
]

export const useBudgetStore = defineStore('budget', {
  state: (): AppState => {
    return {
      banks: [],
      accounts: [],
      categories: [],
      budgets: [],
      transactions: [],
      kMode: true, // Default to Redenomination Mode ON
      currentMonth: '06',
      currentYear: '2026'
    }
  },

  getters: {
    activePeriod(state) {
      return `${state.currentYear}-${state.currentMonth}`
    },

    // Total income including shifted late income from the previous month
    totalReadyToAssign(state): number {
      const activeMonthStr = `${state.currentYear}-${state.currentMonth}`
      
      // 1. Sum planned income for this month
      const currentPeriodPlannedIncome = state.budgets
        .filter(b => b.month === activeMonthStr)
        .filter(b => {
          const cat = state.categories.find(c => c.id === b.categoryId)
          return cat?.parentId === 'income'
        })
        .reduce((sum, b) => sum + b.planned, 0)

      // 2. Sum late income shifted from previous month
      // Previous month calculation
      let prevMonth = parseInt(state.currentMonth) - 1
      let prevYear = parseInt(state.currentYear)
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear -= 1
      }
      const prevMonthStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`

      const shiftedIncome = state.transactions
        .filter(t => t.date.startsWith(prevMonthStr))
        .filter(t => {
          const cat = state.categories.find(c => c.id === t.categoryId)
          return cat?.parentId === 'income' && t.shiftToNextMonth
        })
        .reduce((sum, t) => sum + t.amount, 0)

      return currentPeriodPlannedIncome + shiftedIncome
    },

    // Total assigned (planned allocations for Expenses, Savings, Debt)
    totalAssigned(state): number {
      const activeMonthStr = `${state.currentYear}-${state.currentMonth}`
      return state.budgets
        .filter(b => b.month === activeMonthStr)
        .filter(b => {
          const cat = state.categories.find(c => c.id === b.categoryId)
          return cat && cat.parentId !== 'income'
        })
        .reduce((sum, b) => sum + b.planned, 0)
    },

    // Remaining money to assign (zero-based targets)
    toAssign(): number {
      return this.totalReadyToAssign - this.totalAssigned
    },

    // Net Worth = Liquid assets - Liabilities
    netWorth(state): number {
      return state.accounts.reduce((sum, acc) => sum + acc.balance, 0)
    },

    // Filter transactions for current active period (excludes late income shifted to next month from this month's planning)
    periodTransactions(state): Transaction[] {
      const activeMonthStr = `${state.currentYear}-${state.currentMonth}`
      return state.transactions.filter(t => t.date.startsWith(activeMonthStr))
    }
  },

  actions: {
    // Load state from localStorage
    loadState() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zbb_data')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            this.banks = parsed.banks || []
            this.accounts = parsed.accounts || []
            this.categories = parsed.categories || []
            this.budgets = parsed.budgets || []
            this.transactions = parsed.transactions || []
            if (parsed.kMode !== undefined) this.kMode = parsed.kMode
            if (parsed.currentMonth !== undefined) this.currentMonth = parsed.currentMonth
            if (parsed.currentYear !== undefined) this.currentYear = parsed.currentYear
            
            // Recalculate account balances based on transactions to ensure integrity
            this.recalculateAccountBalances()
            return
          } catch (e) {
            console.error('Failed to parse local storage, loading defaults...', e)
          }
        }

        // Seed Defaults
        this.banks = JSON.parse(JSON.stringify(DEFAULT_BANKS))
        this.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS))
        this.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES))
        this.budgets = JSON.parse(JSON.stringify(DEFAULT_BUDGETS))
        this.transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS))
        this.recalculateAccountBalances()
        this.saveState()
      }
    },

    // Save state to localStorage
    saveState() {
      if (typeof window !== 'undefined') {
        const payload = {
          banks: this.banks,
          accounts: this.accounts,
          categories: this.categories,
          budgets: this.budgets,
          transactions: this.transactions,
          kMode: this.kMode,
          currentMonth: this.currentMonth,
          currentYear: this.currentYear
        }
        localStorage.setItem('zbb_data', JSON.stringify(payload))
      }
    },

    // Recalculate account balances
    recalculateAccountBalances() {
      // Reset to starting balances
      const startingBalances: Record<string, number> = {
        'acc-checking': 12500000,
        'acc-savings': 30000000,
        'acc-credit': -2700000,
        'acc-cash': 5400000
      }

      this.accounts.forEach(acc => {
        acc.balance = startingBalances[acc.id] !== undefined ? startingBalances[acc.id] : acc.startingBalance
      })

      // Apply all transactions chronologically
      const sortedTransactions = [...this.transactions].sort((a, b) => a.date.localeCompare(b.date))
      
      sortedTransactions.forEach(t => {
        const acc = this.accounts.find(a => a.id === t.accountId)
        if (acc) {
          acc.balance += t.amount
        }
      })
    },

    // Redenomination display helper
    formatValue(value: number): string {
      if (this.kMode) {
        const simplified = value / 1000
        // Format with Indonesian locale dot thousands separator
        return `Rp ${simplified.toLocaleString('id-ID')}K`
      }
      return `Rp ${value.toLocaleString('id-ID')}`
    },

    // Redenomination display helper without "Rp" prefix
    formatValueRaw(value: number): string {
      if (this.kMode) {
        return (value / 1000).toLocaleString('id-ID') + 'K'
      }
      return value.toLocaleString('id-ID')
    },

    // Input parsing helper
    parseInput(value: number): number {
      if (this.kMode) {
        return value * 1000
      }
      return value
    },

    // Add/Update category planned budget
    setBudgetPlanned(categoryId: string, plannedAmount: number) {
      const activeMonthStr = `${this.currentYear}-${this.currentMonth}`
      const index = this.budgets.findIndex(b => b.month === activeMonthStr && b.categoryId === categoryId)

      if (index > -1) {
        this.budgets[index].planned = plannedAmount
      } else {
        this.budgets.push({
          month: activeMonthStr,
          categoryId,
          planned: plannedAmount
        })
      }
      this.saveState()
    },

    // Add Transaction
    addTransaction(tx: Omit<Transaction, 'id'>) {
      const id = 'tx-' + Math.random().toString(36).substring(2, 9)
      this.transactions.push({ id, ...tx })
      this.recalculateAccountBalances()
      this.saveState()
    },

    // Edit Transaction
    editTransaction(tx: Transaction) {
      const idx = this.transactions.findIndex(t => t.id === tx.id)
      if (idx > -1) {
        this.transactions[idx] = tx
        this.recalculateAccountBalances()
        this.saveState()
      }
    },

    // Delete Transaction
    deleteTransaction(id: string) {
      this.transactions = this.transactions.filter(t => t.id !== id)
      this.recalculateAccountBalances()
      this.saveState()
    },

    // Transfer Funds between accounts
    transferFunds(fromAccountId: string, toAccountId: string, amount: number, description: string = 'Transfer Funds') {
      const date = new Date().toISOString().split('T')[0]
      const transferId = 'xfer-' + Math.random().toString(36).substring(2, 9)

      // Add debit to source account
      this.addTransaction({
        date,
        description: `${description} to ${this.accounts.find(a => a.id === toAccountId)?.name}`,
        amount: -amount,
        accountId: fromAccountId,
        categoryId: 'cat-debt-cc', // Use a default category or empty
        shiftToNextMonth: false,
        transferId
      })

      // Add credit to destination account
      this.addTransaction({
        date,
        description: `${description} from ${this.accounts.find(a => a.id === fromAccountId)?.name}`,
        amount: amount,
        accountId: toAccountId,
        categoryId: 'cat-debt-cc',
        shiftToNextMonth: false,
        transferId
      })
    },

    // Copy Previous Month's Plan
    copyPreviousMonthPlan() {
      const activeMonthStr = `${this.currentYear}-${this.currentMonth}`
      
      let prevMonth = parseInt(this.currentMonth) - 1
      let prevYear = parseInt(this.currentYear)
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear -= 1
      }
      const prevMonthStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`

      // Get previous month budgets
      const prevBudgets = this.budgets.filter(b => b.month === prevMonthStr)

      prevBudgets.forEach(pb => {
        // If current month doesn't have a plan for this category or it is 0
        const currentBudget = this.budgets.find(b => b.month === activeMonthStr && b.categoryId === pb.categoryId)
        if (!currentBudget || currentBudget.planned === 0) {
          this.setBudgetPlanned(pb.categoryId, pb.planned)
        }
      })
    },

    // Reset Current Plan
    resetCurrentPlan() {
      const activeMonthStr = `${this.currentYear}-${this.currentMonth}`
      this.budgets = this.budgets.filter(b => b.month !== activeMonthStr)
      // Re-add empty budgets for categories
      this.categories.forEach(cat => {
        this.budgets.push({
          month: activeMonthStr,
          categoryId: cat.id,
          planned: 0
        })
      })
      this.saveState()
    },

    // Toggle K Mode Redenomination
    toggleKMode() {
      this.kMode = !this.kMode
      this.saveState()
    },

    // Change Month
    changeMonth(month: string) {
      this.currentMonth = month
      this.saveState()
    },

    // Change Year
    changeYear(year: string) {
      this.currentYear = year
      this.saveState()
    },

    // Add custom subcategory
    addCategory(name: string, parentId: 'income' | 'expenses' | 'savings' | 'debt') {
      const id = 'cat-' + parentId.substring(0, 3) + '-' + Math.random().toString(36).substring(2, 9)
      this.categories.push({ id, name, parentId })
      this.saveState()
    },

    // Delete custom subcategory
    deleteCategory(id: string) {
      this.categories = this.categories.filter(c => c.id !== id)
      // Clean budgets associated with it
      this.budgets = this.budgets.filter(b => b.categoryId !== id)
      this.saveState()
    }
  }
})
