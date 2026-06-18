import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { useSecurityStore } from '~/stores/security'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}))

describe('Budget Store - Tauri flows', () => {
  let budgetStore: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>
  let securityStore: ReturnType<typeof useSecurityStore>
  const invokeMock = vi.mocked(invoke)

  const enableTauriMode = (enabled: boolean) => {
    if (enabled) {
      (window as any).__TAURI_INTERNALS__ = { 
        invoke: invokeMock 
      }
    } else {
      (window as any).__TAURI_INTERNALS__ = undefined
    }
    settingsStore.isTauri = enabled
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    budgetStore = useBudgetStore()
    settingsStore = useSettingsStore()
    securityStore = useSecurityStore()
    localStorage.clear()
    vi.clearAllMocks()
    enableTauriMode(true)
    securityStore.isLocked = false
    securityStore.security.pinVal = '2468'
  })

  it('loads tauri state and synchronizes settings and security', async () => {
    invokeMock.mockResolvedValueOnce({
      banks: [{ id: 'bank-1', name: 'Bank 1', code: 'B1', color: '#fff' }],
      accounts: [{ id: 'acc-1', name: 'Cash', type: 'cash', bankId: 'bank-1', startingBalance: 1000, balance: 1000 }],
      categories: [{ id: 'cat-1', name: 'Food', parentId: 'expenses' }],
      budgets: [{ month: '2026-06', categoryId: 'cat-1', planned: 5000 }],
      transactions: [{ id: 'tx-1', date: '2026-06-01', description: 'Lunch', amount: -100, accountId: 'acc-1', categoryId: 'cat-1', shiftToNextMonth: false }],
      kMode: false,
      currentMonth: '05',
      currentYear: '2027',
      currencySymbol: '$',
      warningThreshold: 0.9,
      glowEffects: false,
      isSidebarCollapsed: true,
      filterType: 'yearly',
      plannerView: 'yearly',
      maxDebtLimit: 1,
      minSavingsRate: 2,
      lowCashThreshold: 3,
      security: {
        passwordEnabled: true,
        pinEnabled: true,
        patternEnabled: false,
        fingerprintEnabled: false,
        faceEnabled: false,
        passwordVal: 'hash',
        pinVal: '9999',
        patternVal: ''
      }
    })

    await budgetStore.loadTauriState()

    expect(budgetStore.banks).toHaveLength(1)
    expect(budgetStore.accounts).toHaveLength(1)
    expect(budgetStore.categories).toHaveLength(1)
    expect(budgetStore.budgets).toHaveLength(1)
    expect(budgetStore.transactions).toHaveLength(1)
    expect(settingsStore.currentMonth).toBe('05')
    expect(settingsStore.currentYear).toBe('2027')
    expect(settingsStore.currencySymbol).toBe('$')
    expect(securityStore.security.pinVal).toBe('9999')
  })

  it('saves state to localStorage and emits config updates in tauri mode', async () => {
    await budgetStore.addCategory('Food', 'expenses')
    budgetStore.accounts = [{ id: 'acc-1', name: 'Cash', type: 'cash', bankId: 'bank-1', startingBalance: 1000, balance: 1000 }]

    invokeMock.mockResolvedValue(undefined)
    await budgetStore.saveState()

    expect(invokeMock).toHaveBeenCalledWith('db_save_config', { key: 'kMode', value: settingsStore.kMode.toString() })
    const stored = JSON.parse(localStorage.getItem('zbb_data') || '{}')
    expect(stored.security.pinVal).toBe('')
    expect(stored.accounts).toHaveLength(1)
  })

  it('imports, resets, and appends tauri-backed records', async () => {
    invokeMock.mockResolvedValue(undefined)

    const imported = await budgetStore.importState({
      banks: [{ id: 'bank-2', name: 'Bank 2', code: 'B2', color: '#000' }],
      accounts: [{ id: 'acc-2', name: 'Wallet', type: 'cash', bankId: 'bank-2', startingBalance: 2000, balance: 2000 }],
      categories: [{ id: 'cat-2', name: 'Transport', parentId: 'expenses' }],
      budgets: [{ month: '2026-06', categoryId: 'cat-2', planned: 3000 }],
      transactions: [{ id: 'tx-2', date: '2026-06-02', description: 'Bus', amount: -100, accountId: 'acc-2', categoryId: 'cat-2', shiftToNextMonth: false }],
      kMode: false,
      currencySymbol: 'Rp',
      currentMonth: '06',
      currentYear: '2026',
      maxDebtLimit: 100,
      minSavingsRate: 10,
      lowCashThreshold: 50,
      security: { passwordEnabled: false, pinEnabled: true, patternEnabled: false, fingerprintEnabled: false, faceEnabled: false, passwordVal: '', pinVal: '1111', patternVal: '' }
    })

    expect(imported.success).toBe(true)
    expect(budgetStore.accounts).toHaveLength(1)
    expect(settingsStore.currentMonth).toBe('06')
    expect(securityStore.security.pinVal).toBe('1111')
    expect(localStorage.getItem('zbb_data')).not.toBeNull()

    await budgetStore.resetDatabase()
    expect(budgetStore.banks).toHaveLength(0)
    expect(budgetStore.accounts).toHaveLength(0)
    expect(localStorage.getItem('zbb_data')).toBeNull()

    await budgetStore.addTransaction({
      date: '2026-06-03',
      description: 'Coffee',
      amount: -50,
      accountId: 'acc-2',
      categoryId: 'cat-2',
      shiftToNextMonth: false
    })

    expect(budgetStore.transactions.length).toBeGreaterThan(0)
  })

  it('covers individual actions in Tauri mode', async () => {
    invokeMock.mockResolvedValue(undefined)
    
    // Add category
    await budgetStore.addCategory('New Cat', 'expenses')
    const cat = budgetStore.categories.find(c => c.name === 'New Cat')
    expect(cat).toBeDefined()
    
    if (cat) {
      // Update category
      await budgetStore.updateCategory(cat.id, 'Updated Cat')
      // Delete category
      await budgetStore.deleteCategory(cat.id)
    }
    
    // Add bank
    await budgetStore.addBank('New Bank', 'NB', '#fff')
    const bank = budgetStore.banks.find(b => b.name === 'New Bank')
    expect(bank).toBeDefined()
    
    if (bank) {
      // Delete bank
      await budgetStore.deleteBank(bank.id)
    }
    
    // Set budget planned
    await budgetStore.setBudgetPlanned('cat-1', 1000)
    
    // Transfer funds
    await budgetStore.transferFunds('acc-1', 'acc-2', 500, 'T')

    // Add transaction
    await budgetStore.addTransaction({
      date: '2026-06-05',
      description: 'New Tx',
      amount: -100,
      accountId: 'acc-1',
      categoryId: 'cat-1',
      shiftToNextMonth: false
    })

    // Delete account
    await budgetStore.deleteAccount('acc-1')

    // Verify all core DB commands were called at least once
    const expectedCommands = [
      'db_add_category', 
      'db_update_category', 
      'db_delete_category', 
      'db_add_bank', 
      'db_delete_bank', 
      'db_set_budget_planned', 
      'db_add_transaction',
      'db_delete_account'
    ]
    
    expectedCommands.forEach(cmd => {
      const wasCalled = invokeMock.mock.calls.some(call => call[0] === cmd)
      expect(wasCalled, `Command ${cmd} should have been called`).toBe(true)
    })
  })
})