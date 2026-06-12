/**
 * Store Yearly Filter — Unit Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { populateMockData } from '../mockData'

describe('Budget Store — Yearly Filtering', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    settingsStore = useSettingsStore()
    populateMockData(store)
  })

  it('aggregates transactions yearly when filterType is yearly', () => {
    // Default seed has:
    // - May 2026 transactions (6 items)
    // - June 2026 transactions (10 items)
    
    // In Monthly mode (default, June 2026):
    expect(settingsStore.filterType).toBe('monthly')
    expect(settingsStore.currentMonth).toBe('06')
    expect(settingsStore.currentYear).toBe('2026')
    
    const juneTxCount = store.periodTransactions.length
    expect(juneTxCount).toBe(10) // June transactions count
    
    // Switch to Yearly mode
    settingsStore.filterType = 'yearly'
    
    const yearlyTxCount = store.periodTransactions.length
    // Should contain both May and June transactions (6 + 10 = 16)
    expect(yearlyTxCount).toBe(16)
  })

  it('aggregates planned income and spending budgets yearly', () => {
    // Monthly mode (June 2026):
    // Planned Income: 15.000.000
    // Planned Spending (Expenses): 10.000.000
    expect(store.totalReadyToAssign).toBe(15000000)
    expect(store.totalPlannedSpending).toBe(10000000)
    
    // Switch to Yearly mode
    settingsStore.filterType = 'yearly'
    
    // Default budgets only have allocations for 2026-06.
    // Let's add budget for May 2026 to verify summation:
    // Adding 2M May planned income, 3M May planned expenses
    store.budgets.push({ month: '2026-05', categoryId: 'cat-inc-salary', planned: 2000000 })
    store.budgets.push({ month: '2026-05', categoryId: 'cat-exp-housing', planned: 3000000 })
    
    // Total Yearly Ready to Assign should be June (15M) + May (2M) = 17M
    expect(store.totalReadyToAssign).toBe(17000000)
    
    // Total Yearly Planned Spending should be June (10M) + May (3M) = 13M
    expect(store.totalPlannedSpending).toBe(13000000)
  })
})
