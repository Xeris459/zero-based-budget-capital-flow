import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { useBudgetStore } from '~/stores/budget'
import { useSecurityStore } from '~/stores/security'
import { useSettingsStore } from '~/stores/settings'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}))

describe('Security Store', () => {
  let securityStore: ReturnType<typeof useSecurityStore>
  let budgetStore: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>
  const invokeMock = vi.mocked(invoke)

  const enableTauriMode = (enabled: boolean) => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: enabled,
      configurable: true,
      writable: true
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    securityStore = useSecurityStore()
    budgetStore = useBudgetStore()
    settingsStore = useSettingsStore()
    localStorage.clear()
    invokeMock.mockReset()
    enableTauriMode(false)
  })

  it('loads web state and keeps security locked when persisted security is enabled', async () => {
    localStorage.setItem('zbb_data', JSON.stringify({
      kMode: false,
      currentMonth: '04',
      currentYear: '2025',
      currencySymbol: 'Rp',
      warningThreshold: 0.75,
      glowEffects: false,
      isSidebarCollapsed: true,
      filterType: 'yearly',
      plannerView: 'yearly',
      maxDebtLimit: 250000,
      minSavingsRate: 15,
      lowCashThreshold: 50000,
      banks: [{ id: 'b1', name: 'Bank 1', code: 'B1', color: '#fff' }],
      accounts: [{ id: 'a1', name: 'Cash', type: 'cash', bankId: 'b1', startingBalance: 1000, balance: 1000 }],
      categories: [{ id: 'c1', name: 'Food', parentId: 'expenses' }],
      budgets: [{ month: '2025-04', categoryId: 'c1', planned: 2000 }],
      transactions: [],
      security: {
        passwordEnabled: true,
        pinEnabled: true,
        patternEnabled: false,
        fingerprintEnabled: false,
        faceEnabled: false,
        passwordVal: 'hashed',
        pinVal: '1234',
        patternVal: ''
      }
    }))

    await securityStore.loadState()

    expect(settingsStore.currentMonth).toBe('04')
    expect(settingsStore.currentYear).toBe('2025')
    expect(budgetStore.banks).toHaveLength(1)
    expect(budgetStore.accounts).toHaveLength(1)
    expect(securityStore.isLocked).toBe(true)
    expect(securityStore.security.pinEnabled).toBe(true)
    expect(securityStore.security.pinVal).toBe('1234')
  })

  it('registers a new pin in tauri mode when setup is required', async () => {
    enableTauriMode(true)
    securityStore.isPinSetupRequired = true
    securityStore.isLocked = true
    invokeMock.mockImplementation(async (command: string) => {
      if (command === 'register_pin') return true
      return null
    })
    const loadSpy = vi.spyOn(budgetStore, 'loadTauriState').mockResolvedValue(undefined)

    const result = await securityStore.unlockWithPin('2468')

    expect(result).toBe(true)
    expect(securityStore.isLocked).toBe(false)
    expect(securityStore.isPinSetupRequired).toBe(false)
    expect(securityStore.security.pinVal).toBe('2468')
    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(invokeMock).toHaveBeenCalledWith('register_pin', { pin: '2468' })
  })

  it('authenticates biometrics and syncs the loaded state', async () => {
    enableTauriMode(true)
    invokeMock.mockImplementation(async (command: string) => {
      if (command === 'authenticate_biometric') return '8642'
      return null
    })
    const loadSpy = vi.spyOn(budgetStore, 'loadTauriState').mockResolvedValue(undefined)

    const result = await securityStore.authenticateBiometric()

    expect(result).toBe(true)
    expect(securityStore.isLocked).toBe(false)
    expect(securityStore.security.pinVal).toBe('8642')
    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(invokeMock).toHaveBeenCalledWith('authenticate_biometric', undefined)
  })

  it('enables and disables biometric persistence based on active methods', async () => {
    enableTauriMode(true)
    settingsStore.isTauri = true
    securityStore.isLocked = false
    securityStore.security.pinVal = '2468'
    securityStore.security.passwordEnabled = true
    const saveSpy = vi.spyOn(budgetStore, 'saveState').mockResolvedValue(undefined)

    invokeMock.mockResolvedValueOnce(null)
    await securityStore.syncKeyring()
    expect(invokeMock).toHaveBeenCalledWith('enable_biometric', { pin: '2468' })

    invokeMock.mockClear()
    invokeMock.mockResolvedValueOnce(null)
    securityStore.security.passwordEnabled = false
    securityStore.security.patternEnabled = false
    securityStore.security.fingerprintEnabled = false
    securityStore.security.faceEnabled = false
    await securityStore.syncKeyring()
    expect(invokeMock).toHaveBeenCalledWith('disable_biometric', undefined)

    invokeMock.mockResolvedValue(null)
    await securityStore.setBiometricEnabled('fingerprint', true)
    expect(securityStore.security.fingerprintEnabled).toBe(true)
    expect(saveSpy).toHaveBeenCalled()
  })
})