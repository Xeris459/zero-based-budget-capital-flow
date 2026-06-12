import { defineStore } from 'pinia'
import type { SettingsState } from '~/types'

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

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    kMode: true, // Default to Redenomination Mode ON
    currentMonth: '06',
    currentYear: '2026',
    currencySymbol: 'Rp',
    warningThreshold: 0.8,
    glowEffects: true,
    isSidebarCollapsed: false,
    isTauri: false,
    filterType: 'monthly',
    plannerView: 'monthly',
    maxDebtLimit: 5000000,
    minSavingsRate: 10,
    lowCashThreshold: 100000
  }),

  getters: {
    activePeriod(state) {
      return `${state.currentYear}-${state.currentMonth}`
    }
  },

  actions: {
    // Redenomination display helper
    formatValue(value: number): string {
      const prefix = this.currencySymbol ? `${this.currencySymbol} ` : ''
      if (this.kMode) {
        const simplified = value / 1000
        // Format with Indonesian locale dot thousands separator
        return `${prefix}${simplified.toLocaleString('id-ID')}K`
      }
      return `${prefix}${value.toLocaleString('id-ID')}`
    },

    // Redenomination display helper without prefix
    formatValueRaw(value: number): string {
      if (this.kMode) {
        return (value / 1000).toLocaleString('id-ID') + 'K'
      }
      return value.toLocaleString('id-ID')
    },

    // Indonesian human-readable currency format (e.g. 1.000.000 -> 1 jt, 150.000 -> 150 rb)
    formatIndonesianHuman(value: number): string {
      const isNegative = value < 0
      const absVal = Math.abs(value)
      let formatted = ''

      if (absVal >= 1000000000) {
        const val = absVal / 1000000000
        formatted = `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
      } else if (absVal >= 1000000) {
        const val = absVal / 1000000
        formatted = `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
      } else if (absVal >= 1000) {
        const val = absVal / 1000
        formatted = `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`
      } else {
        formatted = absVal.toLocaleString('id-ID')
      }

      const prefix = this.currencySymbol ? `${this.currencySymbol} ` : ''
      return `${isNegative ? '-' : ''}${prefix}${formatted}`
    },

    // Indonesian human-readable currency format without prefix
    formatIndonesianHumanRaw(value: number): string {
      const isNegative = value < 0
      const absVal = Math.abs(value)
      let formatted = ''

      if (absVal >= 1000000000) {
        const val = absVal / 1000000000
        formatted = `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
      } else if (absVal >= 1000000) {
        const val = absVal / 1000000
        formatted = `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
      } else if (absVal >= 1000) {
        const val = absVal / 1000
        formatted = `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`
      } else {
        formatted = absVal.toLocaleString('id-ID')
      }

      return `${isNegative ? '-' : ''}${formatted}`
    },

    // Input parsing helper
    parseInput(value: number): number {
      if (this.kMode) {
        return value * 1000
      }
      return value
    },

    loadSettings(parsedPayload: any) {
      if (parsedPayload.kMode !== undefined) this.kMode = parsedPayload.kMode
      if (parsedPayload.currentMonth !== undefined) this.currentMonth = parsedPayload.currentMonth
      if (parsedPayload.currentYear !== undefined) this.currentYear = parsedPayload.currentYear
      if (parsedPayload.currencySymbol !== undefined) this.currencySymbol = parsedPayload.currencySymbol
      if (parsedPayload.warningThreshold !== undefined) this.warningThreshold = parsedPayload.warningThreshold
      if (parsedPayload.glowEffects !== undefined) this.glowEffects = parsedPayload.glowEffects
      if (parsedPayload.isSidebarCollapsed !== undefined) this.isSidebarCollapsed = parsedPayload.isSidebarCollapsed
      if (parsedPayload.filterType !== undefined) this.filterType = parsedPayload.filterType
      if (parsedPayload.plannerView !== undefined) this.plannerView = parsedPayload.plannerView
      if (parsedPayload.maxDebtLimit !== undefined) this.maxDebtLimit = parsedPayload.maxDebtLimit
      if (parsedPayload.minSavingsRate !== undefined) this.minSavingsRate = parsedPayload.minSavingsRate
      if (parsedPayload.lowCashThreshold !== undefined) this.lowCashThreshold = parsedPayload.lowCashThreshold
    },

    async toggleKMode() {
      this.kMode = !this.kMode
      await this.saveSettings()
    },

    async changeMonth(month: string) {
      this.currentMonth = month
      await this.saveSettings()
    },

    async changeYear(year: string) {
      this.currentYear = year
      await this.saveSettings()
    },

    async setFilterType(type: 'monthly' | 'yearly') {
      this.filterType = type
      await this.saveSettings()
    },

    async setPlannerView(view: 'monthly' | 'yearly') {
      this.plannerView = view
      await this.saveSettings()
    },

    async saveSettings() {
      const { useBudgetStore } = await import('./budget')
      const budgetStore = useBudgetStore()
      await budgetStore.saveState()
    }
  }
})
