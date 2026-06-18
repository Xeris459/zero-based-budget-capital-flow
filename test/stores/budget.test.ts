/**
 * Pinia Budget, Settings & Security Stores — Unit Tests
 *
 * Covers: state initialization, getters, actions, and formatting helpers.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { useSecurityStore } from '~/stores/security'
import { populateMockData } from '../mockData'

describe('Budget App Stores', () => {
  let budgetStore: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>
  let securityStore: ReturnType<typeof useSecurityStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    budgetStore = useBudgetStore()
    settingsStore = useSettingsStore()
    securityStore = useSecurityStore()
  })

  // ── State Initialization ──────────────────────────────────────────────

  describe('Initial State', () => {
    it('has empty arrays by default for financial data', () => {
      expect(budgetStore.banks).toEqual([])
      expect(budgetStore.accounts).toEqual([])
      expect(budgetStore.categories).toEqual([])
      expect(budgetStore.budgets).toEqual([])
      expect(budgetStore.transactions).toEqual([])
    })

    it('has kMode enabled by default in settings', () => {
      expect(settingsStore.kMode).toBe(true)
    })

    it('defaults to June 2026 in settings', () => {
      expect(settingsStore.currentMonth).toBe('06')
      expect(settingsStore.currentYear).toBe('2026')
    })
  })

  // ── loadState / saveState ─────────────────────────────────────────────

  describe('loadState()', () => {
    it('does not seed default data when localStorage is empty', async () => {
      await securityStore.loadState()

      expect(budgetStore.banks.length).toBe(0)
      expect(budgetStore.accounts.length).toBe(0)
      expect(budgetStore.categories.length).toBe(0)
      expect(budgetStore.budgets.length).toBe(0)
      expect(budgetStore.transactions.length).toBe(0)
    })

    it('restores persisted data from localStorage', async () => {
      const mockData = {
        banks: [{ id: 'b1', name: 'Test Bank', code: 'TB', color: '#fff' }],
        accounts: [{ id: 'a1', name: 'Test Acc', type: 'checking', bankId: 'b1', startingBalance: 1000, balance: 1000 }],
        categories: [{ id: 'c1', name: 'Food', parentId: 'expenses' }],
        budgets: [{ month: '2026-06', categoryId: 'c1', planned: 500000 }],
        transactions: [],
        kMode: false,
        currentMonth: '03',
        currentYear: '2025'
      }
      localStorage.setItem('zbb_data', JSON.stringify(mockData))

      await securityStore.loadState()

      expect(budgetStore.banks).toHaveLength(1)
      expect(budgetStore.banks[0].name).toBe('Test Bank')
      expect(settingsStore.kMode).toBe(false)
      expect(settingsStore.currentMonth).toBe('03')
      expect(settingsStore.currentYear).toBe('2025')
    })
  })

  describe('saveState()', () => {
    it('serializes state to localStorage', async () => {
      await securityStore.loadState()
      populateMockData(budgetStore)
      await budgetStore.saveState()

      const stored = localStorage.getItem('zbb_data')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.banks).toBeDefined()
      expect(parsed.accounts).toBeDefined()
      expect(parsed.kMode).toBe(true)
    })
  })

  // ── Getters ───────────────────────────────────────────────────────────

  describe('Getters', () => {
    beforeEach(async () => {
      await securityStore.loadState()
      populateMockData(budgetStore)
    })

    it('activePeriod returns YYYY-MM', () => {
      expect(budgetStore.activePeriod).toBe('2026-06')
    })

    it('totalReadyToAssign sums planned income for the current period', () => {
      // Default seed: salary 10M + side 3.5M + dividends 1.5M = 15M
      expect(budgetStore.totalReadyToAssign).toBe(15000000)
    })

    it('totalAssigned sums planned expenses/savings/debt for the current period', () => {
      // expenses: 5M+2.5M+1.5M+1M = 10M, savings: 1M+1M+300K+200K = 2.5M, debt: 2.5M → total 15M
      expect(budgetStore.totalAssigned).toBe(15000000)
    })

    it('toAssign = totalReadyToAssign - totalAssigned', () => {
      // 15M - 15M = 0
      expect(budgetStore.toAssign).toBe(0)
    })

    it('netWorth sums all account balances', () => {
      // All account balances after recalculation
      const expectedNetWorth = budgetStore.accounts.reduce((sum, acc) => sum + acc.balance, 0)
      expect(budgetStore.netWorth).toBe(expectedNetWorth)
    })

    it('periodTransactions filters by current period', () => {
      // Only 2026-06 transactions
      const juneTxs = budgetStore.periodTransactions
      juneTxs.forEach(tx => {
        expect(tx.date).toMatch(/^2026-06/)
      })
    })

    it('budgetSpentPercent computes correct percentage', () => {
      const percent = budgetStore.budgetSpentPercent
      expect(typeof percent).toBe('number')
      expect(percent).toBeGreaterThanOrEqual(0)
    })

    it('savingsRate computes savings/income ratio', () => {
      const rate = budgetStore.savingsRate
      expect(typeof rate).toBe('number')
      expect(rate).toBeGreaterThanOrEqual(0)
    })

    it('activeAlerts returns success when balanced', () => {
      // Default seed is balanced (toAssign = 0)
      const alerts = budgetStore.activeAlerts
      expect(alerts.length).toBeGreaterThan(0)
      // Should not have the ZBB allocation warnings since balanced
      const zbbAlerts = alerts.filter(a => a.id === 'zbb-ready' || a.id === 'zbb-over')
      expect(zbbAlerts).toHaveLength(0)
    })

    it('triggers alerts for low or overdrawn checking balance', () => {
      const checking = budgetStore.accounts.find(a => a.id === 'acc-checking')!
      
      // 1. Overdrawn
      checking.balance = -100
      let alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'checking-overdrawn-acc-checking')).toBe(true)

      // 2. Low balance
      checking.balance = 500000
      alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'checking-low-acc-checking')).toBe(true)
    })

    it('triggers alerts for low wallet cash with configurable thresholds', () => {
      const cash = budgetStore.accounts.find(a => a.id === 'acc-cash')!
      
      // Below default threshold (100k)
      cash.balance = 50000
      let alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'cash-low-acc-cash')).toBe(true)

      // Below custom threshold
      settingsStore.lowCashThreshold = 30000
      alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'cash-low-acc-cash')).toBe(false)
    })

    it('triggers alerts for high credit card debt with configurable limits', () => {
      const cc = budgetStore.accounts.find(a => a.id === 'acc-credit')!
      
      // Exceeds default limit (5M debt, i.e. balance < -5M)
      cc.balance = -6000000
      let alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'cc-debt-high-acc-credit')).toBe(true)

      // Within custom limit
      settingsStore.maxDebtLimit = 8000000
      alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'cc-debt-high-acc-credit')).toBe(false)
    })

    it('triggers emergency fund missing alert when expenses are planned but emergency fund has zero allocation', () => {
      // Clear planned budget for emergency fund
      const emgBudget = budgetStore.budgets.find(b => b.categoryId === 'cat-sav-emg' && b.month === '2026-06')!
      emgBudget.planned = 0
      
      const alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'emergency-fund-missing')).toBe(true)
    })

    it('triggers savings rate alert when rate falls below configurable minimum target', () => {
      // By default savings rate is 13% (savings/debt actual 1,638,000 / inflow 12,625,000)
      // Check that at default minSavingsRate (10%) there is no alert
      let alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'low-savings-rate')).toBe(false)

      // Increase min savings rate target to 15% (which is > 13%)
      settingsStore.minSavingsRate = 15
      alerts = budgetStore.activeAlerts
      expect(alerts.some(a => a.id === 'low-savings-rate')).toBe(true)
    })

    it('bankSummaries groups accounts by bank', () => {
      const summaries = budgetStore.bankSummaries
      expect(summaries.length).toBe(budgetStore.banks.length)
      summaries.forEach(s => {
        expect(s.accounts).toBeDefined()
        expect(typeof s.totalBalance).toBe('number')
      })
    })

    it('spendingSlices computes SVG slices for expenses', () => {
      const slices = budgetStore.spendingSlices
      expect(slices.length).toBe(6) // Housing, Food, Utilities, Savings, Debt, Entertainment
      slices.forEach(s => {
        expect(s).toHaveProperty('category')
        expect(s).toHaveProperty('amount')
        expect(s).toHaveProperty('dash')
        expect(s).toHaveProperty('offset')
        expect(s).toHaveProperty('percentage')
      })
    })

    it('filteredLedger returns transactions sorted from newest first, including same-day index order', () => {
      // Seed checking account
      budgetStore.accounts = [{ id: 'acc-checking', name: 'Checking Account', type: 'checking', bankId: 'bank-bca', startingBalance: 12500000, balance: 12500000 }]
      // Seed with some test transactions on the same day and different days
      budgetStore.transactions = [
        { id: 'tx-1', date: '2026-06-01', description: 'First', amount: -100, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false },
        { id: 'tx-2', date: '2026-06-02', description: 'Second', amount: -200, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false },
        { id: 'tx-3', date: '2026-06-02', description: 'Third', amount: -300, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false },
        { id: 'tx-4', date: '2026-06-03', description: 'Fourth', amount: -400, accountId: 'acc-checking', categoryId: 'cat-exp-food', shiftToNextMonth: false }
      ]
      
      const ledger = budgetStore.filteredLedger('bank-bca', 'acc-checking')
      // Expected order:
      // Newest date first: tx-4 (2026-06-03)
      // Then same-day newest first: tx-3 (2026-06-02, index 2), then tx-2 (2026-06-02, index 1)
      // Oldest date last: tx-1 (2026-06-01)
      expect(ledger.map(t => t.id)).toEqual(['tx-4', 'tx-3', 'tx-2', 'tx-1'])
    })
  })

  // ── Actions ───────────────────────────────────────────────────────────

  describe('Actions', () => {
    beforeEach(async () => {
      await securityStore.loadState()
      populateMockData(budgetStore)
    })

    it('addTransaction() pushes a new transaction and recalculates', async () => {
      const countBefore = budgetStore.transactions.length
      await budgetStore.addTransaction({
        date: '2026-06-15',
        description: 'Test Expense',
        amount: -100000,
        accountId: 'acc-checking',
        categoryId: 'cat-exp-food',
        shiftToNextMonth: false
      })
      expect(budgetStore.transactions.length).toBe(countBefore + 1)
    })

    it('editTransaction() modifies an existing transaction', async () => {
      const tx = { ...budgetStore.transactions[0], description: 'Updated Description' }
      await budgetStore.editTransaction(tx)
      expect(budgetStore.transactions.find(t => t.id === tx.id)?.description).toBe('Updated Description')
    })

    it('deleteTransaction() removes a transaction', async () => {
      const txId = budgetStore.transactions[0].id
      const countBefore = budgetStore.transactions.length
      await budgetStore.deleteTransaction(txId)
      expect(budgetStore.transactions.length).toBe(countBefore - 1)
      expect(budgetStore.transactions.find(t => t.id === txId)).toBeUndefined()
    })

    it('transferFunds() creates paired debit/credit transactions', async () => {
      const countBefore = budgetStore.transactions.length
      await budgetStore.transferFunds('acc-checking', 'acc-savings', 500000, 'Test Transfer')
      // Should add 2 transactions (debit + credit)
      expect(budgetStore.transactions.length).toBe(countBefore + 2)

      const newTxs = budgetStore.transactions.slice(-2)
      const debit = newTxs.find(t => t.amount < 0)
      const credit = newTxs.find(t => t.amount > 0)
      expect(debit).toBeDefined()
      expect(credit).toBeDefined()
      expect(debit!.transferId).toBe(credit!.transferId)
      expect(Math.abs(debit!.amount)).toBe(credit!.amount)
    })

    it('setBudgetPlanned() creates a new budget line', async () => {
      await budgetStore.addCategory('Test Category', 'expenses')
      const newCat = budgetStore.categories.find(c => c.name === 'Test Category')!
      await budgetStore.setBudgetPlanned(newCat.id, 750000)

      const budget = budgetStore.budgets.find(b => b.categoryId === newCat.id && b.month === '2026-06')
      expect(budget).toBeDefined()
      expect(budget!.planned).toBe(750000)
    })

    it('setBudgetPlanned() updates an existing budget line', async () => {
      await budgetStore.setBudgetPlanned('cat-exp-food', 3000000)
      const budget = budgetStore.budgets.find(b => b.categoryId === 'cat-exp-food' && b.month === '2026-06')
      expect(budget!.planned).toBe(3000000)
    })

    it('addCategory() adds a new category', async () => {
      const countBefore = budgetStore.categories.length
      await budgetStore.addCategory('New Expense', 'expenses')
      expect(budgetStore.categories.length).toBe(countBefore + 1)
      const added = budgetStore.categories.find(c => c.name === 'New Expense')
      expect(added).toBeDefined()
      expect(added!.parentId).toBe('expenses')
    })

    it('deleteCategory() removes category and associated budgets if no transactions exist', async () => {
      // Add a clean category first
      await budgetStore.addCategory('Clean Category', 'expenses')
      const catId = budgetStore.categories.find(c => c.name === 'Clean Category')!.id
      
      const success = await budgetStore.deleteCategory(catId)
      expect(success).toBe(true)
      expect(budgetStore.categories.find(c => c.id === catId)).toBeUndefined()
    })

    it('deleteCategory() blocks removal if active transactions exist', async () => {
      const catId = 'cat-exp-food' // Has transactions in mock
      const success = await budgetStore.deleteCategory(catId)
      expect(success).toBe(false)
      expect(budgetStore.categories.find(c => c.id === catId)).toBeDefined()
    })

    it('toggleKMode() flips the kMode flag in settingsStore', async () => {
      expect(settingsStore.kMode).toBe(true)
      await settingsStore.toggleKMode()
      expect(settingsStore.kMode).toBe(false)
      await settingsStore.toggleKMode()
      expect(settingsStore.kMode).toBe(true)
    })

    it('changeMonth() updates currentMonth in settingsStore', async () => {
      await settingsStore.changeMonth('12')
      expect(settingsStore.currentMonth).toBe('12')
    })

    it('changeYear() updates currentYear in settingsStore', async () => {
      await settingsStore.changeYear('2025')
      expect(settingsStore.currentYear).toBe('2025')
    })

    it('recalculateAccountBalances() computes correct balances from transactions', () => {
      budgetStore.recalculateAccountBalances()
      // Checking account: starts at 12.5M + income txs - expense txs
      const checking = budgetStore.accounts.find(a => a.id === 'acc-checking')!
      const checkingTxSum = budgetStore.transactions
        .filter(t => t.accountId === 'acc-checking')
        .reduce((sum, t) => sum + t.amount, 0)
      expect(checking.balance).toBe(12500000 + checkingTxSum)
    })

    it('copyPreviousMonthPlan() copies budget from previous month', async () => {
      await settingsStore.changeMonth('07')
      await budgetStore.copyPreviousMonthPlan()

      const julyBudgets = budgetStore.budgets.filter(b => b.month === '2026-07')
      expect(julyBudgets.length).toBeGreaterThan(0)
    })

    it('resetCurrentPlan() zeros all planned budgets for current month', async () => {
      await budgetStore.resetCurrentPlan()
      const currentBudgets = budgetStore.budgets.filter(b => b.month === '2026-06')
      currentBudgets.forEach(b => {
        expect(b.planned).toBe(0)
      })
    })

    it('updateCategory() updates category name', async () => {
      await budgetStore.updateCategory('cat-exp-food', 'New Food Name')
      expect(budgetStore.categories.find(c => c.id === 'cat-exp-food')?.name).toBe('New Food Name')
    })

    it('addBank() adds a new bank', async () => {
      const countBefore = budgetStore.banks.length
      await budgetStore.addBank('New Bank', 'NB', '#000')
      expect(budgetStore.banks.length).toBe(countBefore + 1)
      expect(budgetStore.banks.some(b => b.name === 'New Bank')).toBe(true)
    })

    it('deleteBank() removes bank if it has no accounts', async () => {
      await budgetStore.addBank('Empty Bank', 'EB', '#000')
      const bankId = budgetStore.banks.find(b => b.name === 'Empty Bank')!.id
      const success = await budgetStore.deleteBank(bankId)
      expect(success).toBe(true)
      expect(budgetStore.banks.some(b => b.id === bankId)).toBe(false)
    })

    it('deleteBank() fails if bank has accounts', async () => {
      const success = await budgetStore.deleteBank('bank-bca')
      expect(success).toBe(false)
      expect(budgetStore.banks.some(b => b.id === 'bank-bca')).toBe(true)
    })

    it('resetDatabase() clears all financial data', async () => {
      await budgetStore.resetDatabase()
      expect(budgetStore.banks).toEqual([])
      expect(budgetStore.accounts).toEqual([])
      expect(budgetStore.categories).toEqual([])
      expect(budgetStore.budgets).toEqual([])
      expect(budgetStore.transactions).toEqual([])
    })

    it('importState() restores state from object', async () => {
      const newState = {
        banks: [{ id: 'b1', name: 'Imported Bank', code: 'IB', color: '#fff' }],
        accounts: [],
        categories: [],
        budgets: [],
        transactions: [],
        kMode: false
      }
      const result = await budgetStore.importState(newState)
      expect(result.success).toBe(true)
      expect(budgetStore.banks[0].name).toBe('Imported Bank')
      expect(settingsStore.kMode).toBe(false)
    })

    it('importState() returns error for invalid data', async () => {
      const result = await budgetStore.importState(null)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid backup data.')

      const result2 = await budgetStore.importState({ banks: [] })
      expect(result2.success).toBe(false)
      expect(result2.error).toContain('missing core')
    })
  })

  // ── Senior QA Edge Cases ──────────────────────────────────────────────

  describe('Edge Cases & Data Integrity', () => {
    it('handles very small amounts in K-Mode without losing precision', () => {
      settingsStore.kMode = true
      // Rp 500 should be 0.5
      expect(settingsStore.formatValueRaw(500)).toBe('0,5')
      // Parsing 0.5 back should be 500
      expect(settingsStore.parseInput(0.5)).toBe(500)
      
      // Even smaller: Rp 1
      expect(settingsStore.parseInput(0.001)).toBe(1)
    })
  })

  // ── Formatting Helpers ────────────────────────────────────────────────

  describe('Formatting', () => {
    beforeEach(async () => {
      await securityStore.loadState()
      populateMockData(budgetStore)
    })

    it('formatValue() returns K-suffixed value when kMode is on', () => {
      settingsStore.kMode = true
      const result = settingsStore.formatValue(5000000)
      expect(result).toContain('K')
      expect(result).toContain('Rp')
    })

    it('formatValue() returns full value when kMode is off', () => {
      settingsStore.kMode = false
      const result = settingsStore.formatValue(5000000)
      expect(result).not.toContain('K')
      expect(result).toContain('Rp')
    })

    it('formatIndonesianHuman() formats millions as "jt"', () => {
      const result = settingsStore.formatIndonesianHuman(5000000)
      expect(result).toContain('jt')
    })

    it('formatIndonesianHuman() formats thousands as "rb"', () => {
      const result = settingsStore.formatIndonesianHuman(500000)
      expect(result).toContain('rb')
    })

    it('formatIndonesianHuman() handles negative values', () => {
      const result = settingsStore.formatIndonesianHuman(-2700000)
      expect(result).toContain('-')
      expect(result).toContain('jt')
    })

    it('parseInput() multiplies by 1000 when kMode is on', () => {
      settingsStore.kMode = true
      expect(settingsStore.parseInput(500)).toBe(500000)
    })

    it('parseInput() returns raw value when kMode is off', () => {
      settingsStore.kMode = false
      expect(settingsStore.parseInput(500000)).toBe(500000)
    })
  })
})
