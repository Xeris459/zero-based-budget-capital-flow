import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

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

export interface SecurityConfig {
  passwordEnabled: boolean
  pinEnabled: boolean
  patternEnabled: boolean
  fingerprintEnabled: boolean
  faceEnabled: boolean
  passwordVal: string
  pinVal: string
  patternVal: string
}

export interface SecurityState {
  isLocked: boolean
  isPinSetupRequired: boolean
  security: SecurityConfig
}

export const useSecurityStore = defineStore('security', {
  state: (): SecurityState => ({
    isLocked: false,
    isPinSetupRequired: false,
    security: {
      passwordEnabled: false,
      pinEnabled: false,
      patternEnabled: false,
      fingerprintEnabled: false,
      faceEnabled: false,
      passwordVal: '',
      pinVal: '',
      patternVal: ''
    }
  }),

  actions: {
    // Unlock or Register using PIN in Tauri
    async unlockWithPin(pin: string): Promise<boolean> {
      const { useBudgetStore } = await import('./budget')
      const budgetStore = useBudgetStore()
      try {
        let success = false
        if (this.isPinSetupRequired) {
          success = await safeInvoke<boolean>('register_pin', { pin }) || false
          if (success) {
            this.isPinSetupRequired = false
            this.security.pinVal = pin
            // Initialize with defaults and save
            budgetStore.loadDefaults()
            await budgetStore.saveState()
          }
        } else {
          success = await safeInvoke<boolean>('unlock_db', { pin }) || false
          if (success) {
            this.security.pinVal = pin
            await budgetStore.loadTauriState()
          }
        }

        if (success) {
          this.isLocked = false
          return true
        }
      } catch (e: any) {
        console.error('Failed to unlock DB:', e)
        throw new Error(e.message || 'Unlock failed. Incorrect PIN.')
      }
      return false
    },

    // Authenticate with Biometrics (Windows Hello)
    async authenticateBiometric(): Promise<boolean> {
      const { useBudgetStore } = await import('./budget')
      const budgetStore = useBudgetStore()
      try {
        const pin = await safeInvoke<string>('authenticate_biometric')
        if (pin) {
          this.security.pinVal = pin
          await budgetStore.loadTauriState()
          this.isLocked = false
          return true
        }
      } catch (e) {
        console.error('Failed to authenticate biometrics:', e)
      }
      return false
    },

    // Synchronize PIN keyring based on active fallback lock preferences
    async syncKeyring() {
      const settingsStore = useSettingsStore()
      if (settingsStore.isTauri && !this.isLocked) {
        const needsKeyring = this.security.passwordEnabled ||
                             this.security.patternEnabled ||
                             this.security.fingerprintEnabled ||
                             this.security.faceEnabled;
        try {
          if (needsKeyring && this.security.pinVal) {
            await safeInvoke('enable_biometric', { pin: this.security.pinVal })
          } else if (!needsKeyring) {
            await safeInvoke('disable_biometric')
          }
        } catch (e) {
          console.error('Failed to sync keyring:', e)
        }
      }
    },

    // Toggle biometric settings with OS Keyring persistence
    async setBiometricEnabled(method: 'fingerprint' | 'face', enabled: boolean): Promise<boolean> {
      const settingsStore = useSettingsStore()
      const { useBudgetStore } = await import('./budget')
      const budgetStore = useBudgetStore()
      if (settingsStore.isTauri && !this.isLocked) {
        try {
          if (enabled) {
            // Save current PIN to OS keyring
            await safeInvoke('enable_biometric', { pin: this.security.pinVal })
          } else {
            // Disable: check if both are disabled now
            const otherMethod = method === 'fingerprint' ? 'face' : 'fingerprint'
            if (!this.security[`${otherMethod}Enabled`]) {
              await safeInvoke('disable_biometric')
            }
          }
        } catch (e) {
          console.error('Failed to update keyring for biometrics:', e)
          alert('Failed to configure biometric storage on your system.')
          return false
        }
      }
      this.security[`${method}Enabled`] = enabled
      await budgetStore.saveState()
      return true
    },

    // Load state from localStorage / Tauri
    async loadState() {
      const settingsStore = useSettingsStore()
      const { useBudgetStore } = await import('./budget')
      const budgetStore = useBudgetStore()

      if (typeof window !== 'undefined') {
        settingsStore.isTauri = !!(window as any).__TAURI_INTERNALS__

        if (settingsStore.isTauri) {
          try {
            const hasPin = await safeInvoke<boolean>('has_pin_setup')
            if (!hasPin) {
              this.isPinSetupRequired = true
              this.isLocked = true
              this.security.pinEnabled = true
              budgetStore.loadDefaults()
              return
            } else {
              this.isPinSetupRequired = false
              
              // Load stored config to see if security is enabled before prompting
              const storedLocal = localStorage.getItem('zbb_data')
              let isAnySecurityEnabled = true // default to true for safety
              
              if (storedLocal) {
                const parsed = JSON.parse(storedLocal)
                if (parsed.security) {
                  this.security = {
                    ...this.security,
                    ...parsed.security
                  }
                  
                  isAnySecurityEnabled = this.security.pinEnabled || 
                                         this.security.passwordEnabled || 
                                         this.security.patternEnabled
                }
              }
              
              if (isAnySecurityEnabled) {
                this.isLocked = true
                
                // Auto-trigger biometric challenge if enabled
                const isBioEnabled = this.security.fingerprintEnabled || this.security.faceEnabled
                if (isBioEnabled) {
                  const bioAvail = await safeInvoke<boolean>('check_biometric_available')
                  if (bioAvail) {
                    this.authenticateBiometric()
                  }
                }
              } else {
                // Security is turned off by user: auto-unlock in background
                this.isLocked = false
                const pin = this.security.pinVal || '0000'
                const success = await safeInvoke<boolean>('unlock_db', { pin }) || false
                if (success) {
                  await budgetStore.loadTauriState()
                } else {
                  // If background auto-unlock fails (e.g. key mismatch), lock for safety
                  this.isLocked = true
                  this.security.pinEnabled = true
                }
              }
              return
            }
          } catch (e) {
            console.error('Failed to initialize database:', e)
          }
        }

        // Web fallback (localStorage)
        const stored = localStorage.getItem('zbb_data')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            // Load settings state
            settingsStore.loadSettings(parsed)
            // Load budget data list state
            budgetStore.loadWebState(parsed)

            if (parsed.security !== undefined) {
              this.security = parsed.security
            }
            
            const hasUniversal = this.security.passwordEnabled || this.security.pinEnabled || this.security.patternEnabled
            this.isLocked = hasUniversal
            budgetStore.recalculateAccountBalances()
            return
          } catch (e) {
            console.error('Failed to parse local storage, loading defaults...', e)
          }
        }

        budgetStore.loadDefaults()
        await budgetStore.saveState()
      }
    }
  }
})
