import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'
import { useSecurityStore } from './security'

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

async function safeInvoke<T>(cmd: string, args?: any): Promise<T | null> {
  if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      return await invoke<T>(cmd, args)
    } catch (e) {
      console.error(`Tauri invoke error for ${cmd}:`, e)
      throw e
    }
  }
  return null
}

export interface AppState {
  banks: Bank[]
  accounts: Account[]
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
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
      transactions: []
    }
  },

  getters: {
    activePeriod() {
      const settingsStore = useSettingsStore()
      return settingsStore.activePeriod
    },

    // Total income including shifted late income from the previous month
    totalReadyToAssign(state): number {
      const settingsStore = useSettingsStore()
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      
      // 1. Sum planned income for this month/year
      const currentPeriodPlannedIncome = state.budgets
        .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr)
        .filter(b => {
          const cat = state.categories.find(c => c.id === b.categoryId)
          return cat?.parentId === 'income'
        })
        .reduce((sum, b) => sum + b.planned, 0)

      // 2. Sum late income shifted from previous month (Only for monthly view)
      let shiftedIncome = 0
      if (settingsStore.filterType !== 'yearly') {
        // Previous month calculation
        let prevMonth = parseInt(settingsStore.currentMonth) - 1
        let prevYear = parseInt(settingsStore.currentYear)
        if (prevMonth === 0) {
          prevMonth = 12
          prevYear -= 1
        }
        const prevMonthStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`

        shiftedIncome = state.transactions
          .filter(t => t.date.startsWith(prevMonthStr))
          .filter(t => {
            const cat = state.categories.find(c => c.id === t.categoryId)
            return cat?.parentId === 'income' && t.shiftToNextMonth
          })
          .reduce((sum, t) => sum + t.amount, 0)
      }

      return currentPeriodPlannedIncome + shiftedIncome
    },

    // Total assigned (planned allocations for Expenses, Savings, Debt)
    totalAssigned(state): number {
      const settingsStore = useSettingsStore()
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      return state.budgets
        .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr)
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
      const settingsStore = useSettingsStore()
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      const filterPrefix = settingsStore.filterType === 'yearly' ? settingsStore.currentYear : activeMonthStr
      return state.transactions.filter(t => t.date.startsWith(filterPrefix))
    },

    // Total planned spending limit
    totalPlannedSpending(state): number {
      const settingsStore = useSettingsStore()
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      return state.budgets
        .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr)
        .filter(b => {
          const cat = state.categories.find(c => c.id === b.categoryId)
          return cat && cat.parentId === 'expenses'
        })
        .reduce((sum, b) => sum + b.planned, 0)
    },

    // Total actual spending
    totalActualSpending(): number {
      return this.periodTransactions
        .filter(t => {
          const cat = this.categories.find(c => c.id === t.categoryId)
          return cat && cat.parentId === 'expenses'
        })
        .reduce((sum, t) => sum - t.amount, 0) // absolute spent
    },

    // Percentage of planned budget spent
    budgetSpentPercent(): number {
      if (this.totalPlannedSpending === 0) return 0
      return Math.round((this.totalActualSpending / this.totalPlannedSpending) * 100)
    },

    // Total savings actual spent
    totalSavings(): number {
      return this.periodTransactions
        .filter(t => {
          const cat = this.categories.find(c => c.id === t.categoryId)
          return cat && cat.parentId === 'savings'
        })
        .reduce((sum, t) => sum - t.amount, 0)
    },

    // Savings rate calculation
    savingsRate(): number {
      const actualInflow = this.periodTransactions
        .filter(t => {
          const cat = this.categories.find(c => c.id === t.categoryId)
          return cat && cat.parentId === 'income'
        })
        .reduce((sum, t) => sum + t.amount, 0)

      if (actualInflow === 0) return 0
      const actualSavings = this.periodTransactions
        .filter(t => {
          const cat = this.categories.find(c => c.id === t.categoryId)
          return cat && (cat.parentId === 'savings' || cat.parentId === 'debt')
        })
        .reduce((sum, t) => sum - t.amount, 0)

      return Math.round((actualSavings / actualInflow) * 100)
    },

    // Dynamic SVG Slices for Spending Breakdown
    spendingSlices(): any[] {
      let housing = 0
      let food = 0
      let utils = 0
      let ent = 0
      let savings = 0
      let debt = 0

      this.periodTransactions.forEach(t => {
        const cat = this.categories.find(c => c.id === t.categoryId)
        if (!cat) return
        const amt = -t.amount
        if (cat.id === 'cat-exp-housing') housing += amt
        else if (cat.id === 'cat-exp-food') food += amt
        else if (cat.id === 'cat-exp-utils') utils += amt
        else if (cat.id === 'cat-exp-ent') ent += amt
        else if (cat.parentId === 'savings') savings += amt
        else if (cat.parentId === 'debt' || cat.id === 'cat-debt-cc') debt += amt
      })

      const rawSlices = [
        { category: 'Housing', amount: housing, color: '#c0c1ff' },
        { category: 'Food', amount: food, color: '#4edea3' },
        { category: 'Utilities', amount: utils, color: '#ffb95f' },
        { category: 'Savings', amount: savings, color: '#8083ff' },
        { category: 'Debt', amount: debt, color: '#ffb4ab' },
        { category: 'Entertainment', amount: ent, color: '#908fa0' }
      ]

      const total = rawSlices.reduce((sum, s) => sum + s.amount, 0) || 1

      let currentOffset = 0
      return rawSlices.map(slice => {
        const percentage = Math.round((slice.amount / total) * 100)
        const dash = (slice.amount / total) * 251.2
        const offset = currentOffset
        currentOffset += dash
        return {
          ...slice,
          percentage,
          dash: parseFloat(dash.toFixed(1)),
          offset: parseFloat(offset.toFixed(1))
        }
      })
    },

    // Dynamic SVG Slices for Savings Breakdown
    savingsSlices(): any[] {
      let emergency = 0
      let retirement = 0
      let vacation = 0
      let car = 0

      this.periodTransactions.forEach(t => {
        const cat = this.categories.find(c => c.id === t.categoryId)
        if (!cat || cat.parentId !== 'savings') return
        const amt = -t.amount
        if (cat.id === 'cat-sav-emg') emergency += amt
        else if (cat.id === 'cat-sav-ret') retirement += amt
        else if (cat.id === 'cat-sav-vac') vacation += amt
        else if (cat.id === 'cat-sav-car') car += amt
      })

      const rawSlices = [
        { category: 'Emergency Fund', amount: emergency || 1, color: '#4edea3' },
        { category: 'Retirement', amount: retirement || 0, color: '#c0c1ff' },
        { category: 'Vacation', amount: vacation || 0, color: '#ffb95f' },
        { category: 'New Car', amount: car || 0, color: '#ca8100' }
      ]

      const total = rawSlices.reduce((sum, s) => sum + s.amount, 0) || 1
      let currentOffset = 0
      return rawSlices.map(slice => {
        const percentage = Math.round((slice.amount / total) * 100)
        const dash = (slice.amount / total) * 251.2
        const offset = currentOffset
        currentOffset += dash
        return {
          ...slice,
          percentage,
          dash: parseFloat(dash.toFixed(1)),
          offset: parseFloat(offset.toFixed(1))
        }
      })
    },

    // Income Overview Progress bars
    incomeSources(state): any[] {
      const settingsStore = useSettingsStore()
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      
      return state.categories
        .filter(c => c.parentId === 'income')
        .map(c => {
          const plannedBudget = state.budgets
            .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr)
            .filter(b => b.categoryId === c.id)
            .reduce((sum, b) => sum + b.planned, 0)
          const actualIncome = this.periodTransactions
            .filter(t => t.categoryId === c.id)
            .reduce((sum, t) => sum + t.amount, 0)

          return {
            id: c.id,
            name: c.name,
            planned: plannedBudget,
            actual: actualIncome
          }
        })
    },

    // Bar Chart Data mapping for 6 Months
    barData(): any[] {
      return [
        { label: 'May', expInc: 70, actInc: 75, actIncVal: 15000000, expExp: 60, actExp: 58, actExpVal: 10000000, expSav: 10, actSav: 17, actSavVal: 2000000 },
        { label: 'Jun', expInc: 70, actInc: 70, actIncVal: 13375000, expExp: 60, actExp: 42, actExpVal: 4662000, expSav: 10, actSav: 33, actSavVal: 1638000 },
        { label: 'Jul', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
        { label: 'Aug', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
        { label: 'Sep', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
        { label: 'Oct', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
        { label: 'Nov', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
        { label: 'Dec', expInc: 90, actInc: 0, actIncVal: 0, expExp: 70, actExp: 0, actExpVal: 0, expSav: 20, actSav: 0, actSavVal: 0 }
      ]
    },

    // Accounts grouped by Bank
    bankSummaries(state): any[] {
      return state.banks.map(bank => {
        const accs = state.accounts.filter(a => a.bankId === bank.id)
        const net = accs.reduce((sum, a) => sum + a.balance, 0)
        return {
          ...bank,
          accounts: accs,
          totalBalance: net
        }
      })
    },

    // Dynamic bank node coordinates
    bankNodes(state): any[] {
      const totalBanks = state.banks.length
      return state.banks.map((bank, index) => {
        const balance = state.accounts
          .filter(a => a.bankId === bank.id)
          .reduce((sum, a) => sum + a.balance, 0)
        
        // Evenly space x between 15% and 85%
        const x = totalBanks > 1 
          ? 15 + (index * (70 / (totalBanks - 1))) 
          : 50
        
        return {
          ...bank,
          balance,
          x: Math.round(x),
          y: 50
        }
      })
    },

    // Bank flow lines for money transfers
    activeFlows(): any[] {
      const transfers = this.periodTransactions.filter(t => t.transferId && t.amount < 0)
      
      return transfers.map(tx => {
        const matchTx = this.periodTransactions.find(t => t.transferId === tx.transferId && t.amount > 0)
        if (!matchTx) return null

        const sourceAcc = this.accounts.find(a => a.id === tx.accountId)
        const destAcc = this.accounts.find(a => a.id === matchTx.accountId)
        if (!sourceAcc || !destAcc) return null

        if (sourceAcc.bankId === destAcc.bankId) return null

        const sourceNode = this.bankNodes.find(n => n.id === sourceAcc.bankId)
        const destNode = this.bankNodes.find(n => n.id === destAcc.bankId)
        if (!sourceNode || !destNode) return null

        return {
          id: tx.transferId,
          fromX: `${sourceNode.x}%`,
          fromY: `${sourceNode.y}%`,
          toX: `${destNode.x}%`,
          toY: `${destNode.y}%`,
          amount: Math.abs(tx.amount)
        }
      }).filter(Boolean)
    },

    // Filtered ledger transactions list
    filteredLedger(state) {
      return (bankId: string, accountId: string) => {
        return state.transactions.filter(t => {
          const acc = state.accounts.find(a => a.id === t.accountId)
          if (!acc) return false
          
          const matchesBank = acc.bankId === bankId
          const matchesAccount = accountId === 'all' || t.accountId === accountId

          return matchesBank && matchesAccount
        }).sort((a, b) => {
          const dateComp = b.date.localeCompare(a.date)
          if (dateComp !== 0) return dateComp
          
          const idxA = state.transactions.indexOf(a)
          const idxB = state.transactions.indexOf(b)
          return idxB - idxA
        })
      }
    },

    // Filtered ledger title
    ledgerTitle(state) {
      return (bankId: string, accountId: string) => {
        const bank = state.banks.find(b => b.id === bankId)
        const bankName = bank ? bank.name : 'Bank'
        
        if (accountId === 'all') {
          return `${bankName} Consolidated Ledger`
        } else {
          const acc = state.accounts.find(a => a.id === accountId)
          return `${acc ? acc.name : 'Account'} Ledger`
        }
      }
    },

    // Dynamic budget alerts
    activeAlerts(): any[] {
      const alerts = []
      const settingsStore = useSettingsStore()
      const formatIndonesianHuman = settingsStore.formatIndonesianHuman
      const warningThreshold = settingsStore.warningThreshold
      
      // 1. Total Spending Exceeded Limit
      if (this.totalActualSpending > this.totalPlannedSpending && this.totalPlannedSpending > 0) {
        alerts.push({
          id: 'total-exceeded',
          type: 'error',
          title: 'Total Budget Exceeded',
          description: `You have spent ${formatIndonesianHuman(this.totalActualSpending)} which exceeds your planned limit of ${formatIndonesianHuman(this.totalPlannedSpending)}.`
        })
      }

      // 2. Individual Category Over-limit or Near-limit
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      this.categories.forEach(cat => {
        if (cat.parentId !== 'expenses') return
        const planned = this.budgets
          .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr)
          .filter(b => b.categoryId === cat.id)
          .reduce((sum, b) => sum + b.planned, 0)
        if (planned === 0) return
        
        const actual = this.periodTransactions
          .filter(t => t.categoryId === cat.id)
          .reduce((sum, t) => sum - t.amount, 0)
        
        if (actual > planned) {
          alerts.push({
            id: `cat-exceeded-${cat.id}`,
            type: 'error',
            title: `${cat.name} Budget Exceeded`,
            description: `You have spent ${formatIndonesianHuman(actual)}, exceeding your planned budget of ${formatIndonesianHuman(planned)}.`
          })
        } else if (actual >= planned * warningThreshold) {
          const percent = Math.round((actual / planned) * 100)
          alerts.push({
            id: `cat-near-${cat.id}`,
            type: 'warning',
            title: `${cat.name} Near Limit`,
            description: `You have spent ${percent}% of your planned ${cat.name} budget.`
          })
        }
      })

      // 3. ZBB Status Alert
      if (this.toAssign > 0) {
        alerts.push({
          id: 'zbb-ready',
          type: 'warning',
          title: 'Ready to Allocate',
          description: `You have ${formatIndonesianHuman(this.toAssign)} remaining to assign. Every rupiah needs a job!`
        })
      } else if (this.toAssign < 0) {
        alerts.push({
          id: 'zbb-over',
          type: 'error',
          title: 'Over Allocated',
          description: `You have allocated ${formatIndonesianHuman(Math.abs(this.toAssign))} more than your ready-to-assign income.`
        })
      }

      // 4. Checking Account Balance Check
      this.accounts.forEach(acc => {
        if (acc.type === 'checking') {
          if (acc.balance < 0) {
            alerts.push({
              id: `checking-overdrawn-${acc.id}`,
              type: 'error',
              title: 'Checking Account Overdrawn',
              description: `Your checking account "${acc.name}" is overdrawn. Current balance: ${formatIndonesianHuman(acc.balance)}.`
            })
          } else if (acc.balance < 1000000) {
            alerts.push({
              id: `checking-low-${acc.id}`,
              type: 'warning',
              title: 'Low Checking Balance',
              description: `Your checking account "${acc.name}" has a low balance of ${formatIndonesianHuman(acc.balance)}. Consider transferring funds.`
            })
          }
        }
      })

      // 5. Wallet Cash Alert
      this.accounts.forEach(acc => {
        if (acc.type === 'cash') {
          if (acc.balance < settingsStore.lowCashThreshold) {
            alerts.push({
              id: `cash-low-${acc.id}`,
              type: 'warning',
              title: 'Low Wallet Cash',
              description: `Your cash wallet "${acc.name}" is running low: ${formatIndonesianHuman(acc.balance)}. Consider withdrawing some cash.`
            })
          }
        }
      })

      // 6. Credit Card High Debt Alert
      this.accounts.forEach(acc => {
        if (acc.type === 'credit_card') {
          if (acc.balance < -settingsStore.maxDebtLimit) {
            alerts.push({
              id: `cc-debt-high-${acc.id}`,
              type: 'warning',
              title: 'High Credit Card Debt',
              description: `Your credit card "${acc.name}" has high debt of ${formatIndonesianHuman(Math.abs(acc.balance))}, exceeding your limit of ${formatIndonesianHuman(settingsStore.maxDebtLimit)}.`
            })
          }
        }
      })

      // 7. Emergency Fund Missing Alert
      const emergencyCat = this.categories.find(c => c.id === 'cat-sav-emg' || c.name.toLowerCase().includes('emergency fund'))
      let emergencyPlanned = 0
      if (emergencyCat) {
        emergencyPlanned = this.budgets
          .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr)
          .filter(b => b.categoryId === emergencyCat.id)
          .reduce((sum, b) => sum + b.planned, 0)
      }
      if (this.totalPlannedSpending > 0 && emergencyPlanned === 0) {
        alerts.push({
          id: 'emergency-fund-missing',
          type: 'warning',
          title: 'Emergency Fund Missing',
          description: 'You have planned expenses but have not allocated any funds to your Emergency Fund this period.'
        })
      }

      // 8. Savings Rate Alarm
      const actualInflow = this.periodTransactions
        .filter(t => {
          const cat = this.categories.find(c => c.id === t.categoryId)
          return cat && cat.parentId === 'income'
        })
        .reduce((sum, t) => sum + t.amount, 0)

      if (actualInflow > 0 && this.savingsRate < settingsStore.minSavingsRate) {
        alerts.push({
          id: 'low-savings-rate',
          type: 'warning',
          title: 'Low Savings Rate',
          description: `Your actual savings rate is ${this.savingsRate}%, which is below your target of ${settingsStore.minSavingsRate}%.`
        })
      }

      // Default success alert if completely balanced and no warnings
      if (alerts.length === 0) {
        alerts.push({
          id: 'zbb-perfect',
          type: 'success',
          title: 'Budget Balanced!',
          description: 'Excellent job! Every Rupiah has a job assigned. Keep tracking transactions.'
        })
      }

      return alerts
    }
  },

  actions: {
    // Load defaults seeds
    loadDefaults() {
      this.banks = JSON.parse(JSON.stringify(DEFAULT_BANKS))
      this.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS))
      this.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES))
      this.budgets = JSON.parse(JSON.stringify(DEFAULT_BUDGETS))
      this.transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS))
      
      const settingsStore = useSettingsStore()
      settingsStore.currencySymbol = 'Rp'
      settingsStore.warningThreshold = 0.8
      settingsStore.glowEffects = true
      
      const securityStore = useSecurityStore()
      securityStore.isLocked = false
      securityStore.isPinSetupRequired = false
      securityStore.security = {
        passwordEnabled: false,
        pinEnabled: false,
        patternEnabled: false,
        fingerprintEnabled: false,
        faceEnabled: false,
        passwordVal: '',
        pinVal: '',
        patternVal: ''
      }
      this.recalculateAccountBalances()
    },

    // Load full state from Tauri SQLite
    async loadTauriState() {
      try {
        const data = await safeInvoke<any>('db_get_initial_data')
        if (data) {
          this.banks = data.banks || []
          this.accounts = data.accounts || []
          this.categories = data.categories || []
          this.budgets = data.budgets || []
          this.transactions = data.transactions || []
          
          const settingsStore = useSettingsStore()
          if (data.kMode !== undefined) settingsStore.kMode = data.kMode
          if (data.currentMonth !== undefined) settingsStore.currentMonth = data.currentMonth
          if (data.currentYear !== undefined) settingsStore.currentYear = data.currentYear
          if (data.currencySymbol !== undefined) settingsStore.currencySymbol = data.currencySymbol
          if (data.warningThreshold !== undefined) settingsStore.warningThreshold = data.warningThreshold
          if (data.glowEffects !== undefined) settingsStore.glowEffects = data.glowEffects
          if (data.isSidebarCollapsed !== undefined) settingsStore.isSidebarCollapsed = data.isSidebarCollapsed
          if (data.filterType !== undefined) settingsStore.filterType = data.filterType
          if (data.plannerView !== undefined) settingsStore.plannerView = data.plannerView
          if (data.maxDebtLimit !== undefined) settingsStore.maxDebtLimit = data.maxDebtLimit
          if (data.minSavingsRate !== undefined) settingsStore.minSavingsRate = data.minSavingsRate
          if (data.lowCashThreshold !== undefined) settingsStore.lowCashThreshold = data.lowCashThreshold
          
          const securityStore = useSecurityStore()
          if (data.security !== undefined) {
            securityStore.security = data.security
          }
          this.recalculateAccountBalances()
        } else {
          // If no state exists in database yet, seed defaults and save
          this.loadDefaults()
          await this.saveState()
        }
      } catch (e) {
        console.error('Failed to load Tauri DB state:', e)
      }
    },

    // Load web state fallback
    loadWebState(parsed: any) {
      this.banks = parsed.banks || []
      this.accounts = parsed.accounts || []
      this.categories = parsed.categories || []
      this.budgets = parsed.budgets || []
      this.transactions = parsed.transactions || []
    },

    // Save state to localStorage / Tauri SQLite
    async saveState() {
      if (typeof window !== 'undefined') {
        const settingsStore = useSettingsStore()
        const securityStore = useSecurityStore()

        const payload = JSON.parse(JSON.stringify({
          banks: this.banks,
          accounts: this.accounts,
          categories: this.categories,
          budgets: this.budgets,
          transactions: this.transactions,
          kMode: settingsStore.kMode,
          currentMonth: settingsStore.currentMonth,
          currentYear: settingsStore.currentYear,
          currencySymbol: settingsStore.currencySymbol,
          warningThreshold: settingsStore.warningThreshold,
          glowEffects: settingsStore.glowEffects,
          isSidebarCollapsed: settingsStore.isSidebarCollapsed,
          filterType: settingsStore.filterType,
          plannerView: settingsStore.plannerView,
          maxDebtLimit: settingsStore.maxDebtLimit,
          minSavingsRate: settingsStore.minSavingsRate,
          lowCashThreshold: settingsStore.lowCashThreshold,
          security: securityStore.security
        }))

        if (settingsStore.isTauri) {
          // Never store plain PIN in localStorage for security
          payload.security.pinVal = ''
          
          if (!securityStore.isLocked) {
            try {
              // Save standard settings configuration to config SQLite table
              await safeInvoke('db_save_config', { key: 'kMode', value: settingsStore.kMode.toString() })
              await safeInvoke('db_save_config', { key: 'currentMonth', value: settingsStore.currentMonth })
              await safeInvoke('db_save_config', { key: 'currentYear', value: settingsStore.currentYear })
              await safeInvoke('db_save_config', { key: 'currencySymbol', value: settingsStore.currencySymbol })
              await safeInvoke('db_save_config', { key: 'warningThreshold', value: settingsStore.warningThreshold.toString() })
              await safeInvoke('db_save_config', { key: 'glowEffects', value: settingsStore.glowEffects.toString() })
              await safeInvoke('db_save_config', { key: 'isSidebarCollapsed', value: settingsStore.isSidebarCollapsed.toString() })
              await safeInvoke('db_save_config', { key: 'filterType', value: settingsStore.filterType })
              await safeInvoke('db_save_config', { key: 'plannerView', value: settingsStore.plannerView })
              await safeInvoke('db_save_config', { key: 'maxDebtLimit', value: settingsStore.maxDebtLimit.toString() })
              await safeInvoke('db_save_config', { key: 'minSavingsRate', value: settingsStore.minSavingsRate.toString() })
              await safeInvoke('db_save_config', { key: 'lowCashThreshold', value: settingsStore.lowCashThreshold.toString() })
              
              // Automatically sync the OS keyring credentials
              await securityStore.syncKeyring()
            } catch (e) {
              console.error('Failed to save config to Tauri SQLite:', e)
            }
          }
        }
        
        // Also save settings to localStorage for quick biometrics reference on startup
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

      // Sync updated account balances to SQLite asynchronously
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      if (settingsStore.isTauri && !securityStore.isLocked) {
        this.accounts.forEach(acc => {
          safeInvoke('db_update_account', { account: acc }).catch(e => {
            console.error('Failed to sync account balance to SQLite:', e)
          })
        })
      }
    },

    // Add/Update category planned budget
    async setBudgetPlanned(categoryId: string, plannedAmount: number, targetMonth?: string) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      const activeMonthStr = targetMonth || `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      const budget = { month: activeMonthStr, categoryId, planned: plannedAmount }

      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_set_budget_planned', { budget })
        } catch (e) {
          console.error('Failed to set budget in SQLite:', e)
          return
        }
      }

      const index = this.budgets.findIndex(b => b.month === activeMonthStr && b.categoryId === categoryId)
      if (index > -1) {
        this.budgets[index].planned = plannedAmount
      } else {
        this.budgets.push(budget)
      }
      this.saveState()
    },

    // Add Transaction
    async addTransaction(tx: Omit<Transaction, 'id'>) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      const id = 'tx-' + Math.random().toString(36).substring(2, 9)
      const newTx = { id, ...tx }

      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_add_transaction', { transaction: newTx })
        } catch (e) {
          console.error('Failed to insert transaction in SQLite:', e)
          return
        }
      }

      this.transactions.push(newTx)
      this.recalculateAccountBalances()
      this.saveState()
    },

    // Edit Transaction
    async editTransaction(tx: Transaction) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_update_transaction', { transaction: tx })
        } catch (e) {
          console.error('Failed to update transaction in SQLite:', e)
          return
        }
      }

      const idx = this.transactions.findIndex(t => t.id === tx.id)
      if (idx > -1) {
        this.transactions[idx] = tx
        this.recalculateAccountBalances()
        this.saveState()
      }
    },

    // Delete Transaction
    async deleteTransaction(id: string) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_delete_transaction', { id })
        } catch (e) {
          console.error('Failed to delete transaction in SQLite:', e)
          return
        }
      }

      this.transactions = this.transactions.filter(t => t.id !== id)
      this.recalculateAccountBalances()
      this.saveState()
    },

    // Transfer Funds between accounts
    async transferFunds(fromAccountId: string, toAccountId: string, amount: number, description: string = 'Transfer Funds') {
      const date = new Date().toISOString().split('T')[0]
      const transferId = 'xfer-' + Math.random().toString(36).substring(2, 9)

      // Add debit to source account
      await this.addTransaction({
        date,
        description: `${description} to ${this.accounts.find(a => a.id === toAccountId)?.name}`,
        amount: -amount,
        accountId: fromAccountId,
        categoryId: 'cat-debt-cc', // Use a default category or empty
        shiftToNextMonth: false,
        transferId
      })

      // Add credit to destination account
      await this.addTransaction({
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
      const settingsStore = useSettingsStore()
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      
      let prevMonth = parseInt(settingsStore.currentMonth) - 1
      let prevYear = parseInt(settingsStore.currentYear)
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
    async resetCurrentPlan() {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
      
      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_reset_current_plan', { month: activeMonthStr })
        } catch (e) {
          console.error('Failed to reset plan in SQLite:', e)
          return
        }
      }

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

    // Add Account
    async addAccount(account: Omit<Account, 'balance'>) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      const fullAccount: Account = {
        ...account,
        balance: account.startingBalance
      }

      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_add_account', { account: fullAccount })
        } catch (e) {
          console.error('Failed to add account in SQLite:', e)
          return
        }
      }

      this.accounts.push(fullAccount)
      this.recalculateAccountBalances()
      this.saveState()
    },

    // Update Account
    async updateAccount(account: Account) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_update_account', { account })
        } catch (e) {
          console.error('Failed to update account in SQLite:', e)
          return
        }
      }

      const idx = this.accounts.findIndex(a => a.id === account.id)
      if (idx > -1) {
        this.accounts[idx] = account
        this.recalculateAccountBalances()
        this.saveState()
      }
    },

    // Delete Account
    async deleteAccount(id: string) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_delete_account', { id })
        } catch (e) {
          console.error('Failed to delete account in SQLite:', e)
          return
        }
      }

      this.accounts = this.accounts.filter(a => a.id !== id)
      this.recalculateAccountBalances()
      this.saveState()
    },

    // Add custom subcategory
    async addCategory(name: string, parentId: 'income' | 'expenses' | 'savings' | 'debt') {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      const id = 'cat-' + parentId.substring(0, 3) + '-' + Math.random().toString(36).substring(2, 9)
      const category = { id, name, parentId }

      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_add_category', { category })
        } catch (e) {
          console.error('Failed to add category in SQLite:', e)
          return
        }
      }

      this.categories.push(category)
      this.saveState()
    },

    // Delete custom subcategory
    async deleteCategory(id: string) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_delete_category', { id })
        } catch (e) {
          console.error('Failed to delete category in SQLite:', e)
          return
        }
      }

      this.categories = this.categories.filter(c => c.id !== id)
      this.budgets = this.budgets.filter(b => b.categoryId !== id)
      this.saveState()
    },

    // Add custom bank
    async addBank(name: string, code: string, color: string) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      const id = 'bank-' + Math.random().toString(36).substring(2, 9)
      const bank = { id, name, code, color }

      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_add_bank', { bank })
        } catch (e) {
          console.error('Failed to add bank in SQLite:', e)
          return
        }
      }

      this.banks.push(bank)
      this.saveState()
    },

    // Delete custom bank
    async deleteBank(id: string) {
      const settingsStore = useSettingsStore()
      const securityStore = useSecurityStore()
      const hasAccounts = this.accounts.some(a => a.bankId === id)
      if (hasAccounts) {
        return false
      }

      if (settingsStore.isTauri && !securityStore.isLocked) {
        try {
          await safeInvoke('db_delete_bank', { id })
        } catch (e) {
          console.error('Failed to delete bank in SQLite:', e)
          return false
        }
      }

      this.banks = this.banks.filter(b => b.id !== id)
      this.saveState()
      return true
    },

    // Reset Database
    resetDatabase() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zbb_data')
        this.loadDefaults()
        this.saveState()
      }
    },

    // Import State
    importState(importedState: any) {
      try {
        if (!importedState || typeof importedState !== 'object') throw new Error('Invalid backup data.')
        if (!Array.isArray(importedState.banks) || !Array.isArray(importedState.accounts) || !Array.isArray(importedState.categories)) {
          throw new Error('Backup file is missing core Capital Flow database arrays.')
        }

        this.banks = importedState.banks
        this.accounts = importedState.accounts
        this.categories = importedState.categories
        this.budgets = importedState.budgets || []
        this.transactions = importedState.transactions || []
        
        const settingsStore = useSettingsStore()
        if (importedState.kMode !== undefined) settingsStore.kMode = importedState.kMode
        if (importedState.currencySymbol !== undefined) settingsStore.currencySymbol = importedState.currencySymbol
        if (importedState.warningThreshold !== undefined) settingsStore.warningThreshold = importedState.warningThreshold
        if (importedState.glowEffects !== undefined) settingsStore.glowEffects = importedState.glowEffects
        if (importedState.currentMonth !== undefined) settingsStore.currentMonth = importedState.currentMonth
        if (importedState.currentYear !== undefined) settingsStore.currentYear = importedState.currentYear
        if (importedState.maxDebtLimit !== undefined) settingsStore.maxDebtLimit = importedState.maxDebtLimit
        if (importedState.minSavingsRate !== undefined) settingsStore.minSavingsRate = importedState.minSavingsRate
        if (importedState.lowCashThreshold !== undefined) settingsStore.lowCashThreshold = importedState.lowCashThreshold
        
        const securityStore = useSecurityStore()
        if (importedState.security !== undefined) {
          securityStore.security = {
            passwordEnabled: importedState.security.passwordEnabled || false,
            pinEnabled: importedState.security.pinEnabled || false,
            patternEnabled: importedState.security.patternEnabled || false,
            fingerprintEnabled: importedState.security.fingerprintEnabled || false,
            faceEnabled: importedState.security.faceEnabled || false,
            passwordVal: importedState.security.passwordVal || '',
            pinVal: importedState.security.pinVal || '',
            patternVal: importedState.security.patternVal || ''
          }
        }

        this.recalculateAccountBalances()
        this.saveState()
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e.message || 'Import failed.' }
      }
    }
  }
})
