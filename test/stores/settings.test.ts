import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'

describe('Settings Store', () => {
  let settingsStore: ReturnType<typeof useSettingsStore>
  let budgetStore: ReturnType<typeof useBudgetStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    settingsStore = useSettingsStore()
    budgetStore = useBudgetStore()
  })

  it('provides the expected default state', () => {
    expect(settingsStore.kMode).toBe(true)
    expect(settingsStore.currentMonth).toBe('06')
    expect(settingsStore.currentYear).toBe('2026')
    expect(settingsStore.currencySymbol).toBe('Rp')
    expect(settingsStore.filterType).toBe('monthly')
    expect(settingsStore.plannerView).toBe('monthly')
  })

  it('formats values in k-mode and human-readable mode', () => {
    expect(settingsStore.formatValue(1000)).toBe('Rp 1K')
    expect(settingsStore.formatValueRaw(1500)).toBe('1,5')
    expect(settingsStore.formatIndonesianHuman(1500000)).toBe('Rp 1,5 jt')
    expect(settingsStore.formatIndonesianHuman(-1500000)).toBe('-Rp 1,5 jt')
    expect(settingsStore.formatIndonesianHumanRaw(1500000)).toBe('1,5 jt')
    expect(settingsStore.formatIndonesianHumanRaw(-1500000)).toBe('-1,5 jt')
    expect(settingsStore.formatIndonesianHumanRaw(1500000000)).toBe('1,5 M')
    expect(settingsStore.formatIndonesianHumanRaw(500)).toBe('500')

    settingsStore.kMode = false
    expect(settingsStore.formatValue(1500000)).toBe('Rp 1.500.000')
    expect(settingsStore.formatValueRaw(1500000)).toBe('1.500.000')
    expect(settingsStore.parseInput(42)).toBe(42)
  })

  it('parses k-mode input and merges loaded settings', () => {
    expect(settingsStore.parseInput(42)).toBe(42000)

    settingsStore.loadSettings({
      kMode: false,
      currentMonth: '11',
      currentYear: '2027',
      currencySymbol: '$',
      warningThreshold: 0.9,
      glowEffects: false,
      isSidebarCollapsed: true,
      filterType: 'yearly',
      plannerView: 'yearly',
      maxDebtLimit: 123,
      minSavingsRate: 12,
      lowCashThreshold: 456
    })

    expect(settingsStore.kMode).toBe(false)
    expect(settingsStore.currentMonth).toBe('11')
    expect(settingsStore.currentYear).toBe('2027')
    expect(settingsStore.currencySymbol).toBe('$')
    expect(settingsStore.warningThreshold).toBe(0.9)
    expect(settingsStore.glowEffects).toBe(false)
    expect(settingsStore.isSidebarCollapsed).toBe(true)
    expect(settingsStore.filterType).toBe('yearly')
    expect(settingsStore.plannerView).toBe('yearly')
    expect(settingsStore.maxDebtLimit).toBe(123)
    expect(settingsStore.minSavingsRate).toBe(12)
    expect(settingsStore.lowCashThreshold).toBe(456)
  })

  it('persists state through settings actions', async () => {
    const saveSpy = vi.spyOn(budgetStore, 'saveState').mockResolvedValue(undefined)

    await settingsStore.toggleKMode()
    await settingsStore.changeMonth('12')
    await settingsStore.changeYear('2028')
    await settingsStore.setFilterType('yearly')
    await settingsStore.setPlannerView('yearly')

    expect(settingsStore.kMode).toBe(false)
    expect(settingsStore.currentMonth).toBe('12')
    expect(settingsStore.currentYear).toBe('2028')
    expect(settingsStore.filterType).toBe('yearly')
    expect(settingsStore.plannerView).toBe('yearly')
    expect(saveSpy).toHaveBeenCalledTimes(5)
  })
})