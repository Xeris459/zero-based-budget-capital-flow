<template>
  <div class="fixed inset-0 z-[999] bg-[#0b0f15]/90 backdrop-blur-xl flex flex-col items-center justify-center min-h-screen text-on-surface">
    <!-- Main Card -->
    <div
      class="relative w-full max-w-md bg-[#1f1f27]/95 border border-[#464554]/40 rounded-2xl p-5 sm:p-8 shadow-2xl flex flex-col items-center justify-between transition-all duration-300 min-h-[460px] mx-4"
      :class="{ 'shake border-error/50 shadow-error/10': shakeActive }"
    >
      <!-- Brand Logo / Lock Indicator -->
      <div class="flex flex-col items-center text-center w-full mb-6">
        <div class="w-12 h-12 bg-primary/10 border border-primary/25 rounded-full flex items-center justify-center mb-3">
          <Lock class="w-6 h-6 text-primary animate-pulse" />
        </div>
        <h2 class="text-xl font-black text-primary tracking-tight">Capital Flow</h2>
        <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">
          {{ securityStore.isPinSetupRequired ? 'Registrasi PIN Baru' : 'Aplikasi Terkunci' }}
        </p>
      </div>

      <!-- Error / Warning Banner -->
      <div v-if="errorMessage" class="w-full p-2.5 mb-4 bg-error/10 border border-error/20 text-error text-[10px] font-bold rounded-lg text-center leading-relaxed">
        {{ errorMessage }}
      </div>

      <!-- Loading / Biometric Simulation Overlay -->
      <div v-if="isBiometricSimulating" class="flex-1 flex flex-col items-center justify-center gap-4 py-8 w-full">
        <div
          class="relative w-20 h-20 flex items-center justify-center cursor-pointer group"
          @click="simulateBiometricSuccess"
        >
          <span v-if="!biometricSuccess" class="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></span>
          <span v-if="!biometricSuccess" class="absolute -inset-2 rounded-full border border-primary/10 animate-pulse"></span>
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
            :class="[
              biometricSuccess 
                ? 'bg-secondary/20 border-2 border-secondary shadow-secondary/20 scale-110' 
                : 'bg-primary/10 group-hover:bg-primary/25 border border-primary/30 shadow-primary/5'
            ]"
          >
            <Check v-if="biometricSuccess" class="w-8 h-8 text-secondary" />
            <Fingerprint v-else class="w-9 h-9 text-primary group-hover:scale-110 transition-transform duration-200" />
          </div>
        </div>
        <div class="flex flex-col items-center gap-1.5 text-center px-4">
          <span
            class="text-xs font-bold transition-colors"
            :class="[biometricSuccess ? 'text-secondary font-black' : 'text-primary animate-pulse']"
          >
            {{ biometricSuccess ? 'Sidik Jari / Wajah Cocok!' : 'Memindai Biometrik Perangkat...' }}
          </span>
          <span v-if="!biometricSuccess" class="text-[9px] text-on-surface-variant font-medium max-w-[280px]">
            Ketuk ikon sidik jari di atas untuk memverifikasi kecocokan, atau biarkan untuk membatalkan (timeout dalam 5 detik).
          </span>
        </div>
      </div>

      <!-- Credential Views (if not simulating biometric) -->
      <div v-else class="w-full flex-1 flex flex-col justify-center">
        
        <!-- 1. PASSWORD UNLOCK VIEW -->
        <div v-if="currentMode === 'password'" class="w-full space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-on-surface-variant uppercase">Masukkan Password Anda</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="passwordVal"
                placeholder="Password"
                class="bg-[#13131b] border border-[#464554]/40 rounded-lg pl-3 pr-9 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                required
                @keydown.enter="verifyPassword"
                ref="passwordInput"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            @click="verifyPassword"
            class="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all shadow-lg shadow-primary/15"
          >
            Unlock dengan Password
          </button>
        </div>

        <!-- 2. PIN UNLOCK VIEW -->
        <div v-if="currentMode === 'pin'" class="w-full flex flex-col items-center gap-6">
          <!-- PIN Slots (4 Separate boxes) -->
          <div class="flex flex-col gap-1.5 items-center w-full">
            <span class="text-[10px] font-bold text-on-surface-variant uppercase mb-2">
              {{ securityStore.isPinSetupRequired ? 'Tentukan 4 Digit PIN Baru' : 'Masukkan PIN Akses' }}
            </span>
            <div class="flex gap-1.5 sm:gap-2 justify-center items-center">
              <input
                v-for="(digit, idx) in pinDigits"
                :key="idx"
                ref="pinInputs"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="1"
                v-model="pinDigits[idx]"
                @input="onPinInput(idx, $event)"
                @keydown="onPinKeyDown(idx, $event)"
                @paste="onPinPaste($event)"
                class="w-10 h-10 sm:w-12 sm:h-12 bg-[#13131b] border-2 border-[#464554]/40 rounded-xl text-center text-lg sm:text-xl font-extrabold text-on-surface focus:border-primary focus:outline-none transition-all"
                :class="{ 'border-primary shadow-[0_0_8px_rgba(99,102,241,0.2)]': pinDigits[idx] }"
              />
            </div>
          </div>

          <!-- Virtual Numeric Keypad -->
          <div class="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[200px] sm:max-w-[240px]">
            <button
              v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
              :key="num"
              @click="handleKeypadPress(num)"
              class="w-full h-10 sm:h-12 rounded-lg bg-surface-container hover:bg-surface-bright/20 border border-[#464554]/20 text-xs sm:text-sm font-extrabold text-on-surface transition-all active:scale-95"
            >
              {{ num }}
            </button>
            <button
              @click="handleKeypadClear"
              class="w-full h-10 sm:h-12 rounded-lg bg-surface-container/30 hover:bg-error/15 border border-[#464554]/10 text-[8px] sm:text-[9px] font-bold text-on-surface hover:text-error transition-all active:scale-95 uppercase"
            >
              Clear
            </button>
            <button
              @click="handleKeypadPress(0)"
              class="w-full h-10 sm:h-12 rounded-lg bg-surface-container hover:bg-surface-bright/20 border border-[#464554]/20 text-xs sm:text-sm font-extrabold text-on-surface transition-all active:scale-95"
            >
              0
            </button>
            <button
              @click="handleKeypadBackspace"
              class="w-full h-10 sm:h-12 rounded-lg bg-surface-container/30 hover:bg-surface-bright/40 border border-[#464554]/10 flex items-center justify-center text-on-surface transition-all active:scale-95"
              title="Backspace"
            >
              <Undo2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <!-- 3. PATTERN UNLOCK VIEW -->
        <div v-if="currentMode === 'pattern'" class="w-full flex flex-col items-center gap-4">
          <span class="text-[10px] font-bold text-on-surface-variant uppercase text-center">Gambarkan Pola Keamanan</span>
          
          <!-- SVG grid -->
          <svg class="w-44 h-44 bg-[#13131b]/60 border border-[#464554]/30 rounded-xl p-3 select-none mx-auto" viewBox="0 0 120 120">
            <!-- Connecting lines -->
            <line
              v-for="(dot, idx) in patternDots"
              v-if="idx > 0"
              :key="`line-${idx}`"
              :x1="getDotCoords(patternDots[idx - 1]).x"
              :y1="getDotCoords(patternDots[idx - 1]).y"
              :x2="getDotCoords(dot).x"
              :y2="getDotCoords(dot).y"
              stroke="#6366f1"
              stroke-width="3.5"
              stroke-linecap="round"
            />
            <!-- Dot grid nodes -->
            <circle
              v-for="i in 9"
              :key="`dot-${i}`"
              :cx="getDotCoords(i).x"
              :cy="getDotCoords(i).y"
              r="8"
              :fill="patternDots.includes(i) ? '#6366f1' : '#2d2d38'"
              :stroke="patternDots.includes(i) ? '#8083ff' : '#464554'"
              stroke-width="1.5"
              class="cursor-pointer transition-colors"
              @click="handleDotClick(i)"
            />
            <!-- Numbers -->
            <text
              v-for="i in 9"
              :key="`text-${i}`"
              :x="getDotCoords(i).x"
              :y="getDotCoords(i).y + 2"
              font-size="6"
              font-weight="bold"
              fill="#ffffff"
              text-anchor="middle"
              class="pointer-events-none select-none text-[6px] font-sans"
            >
              {{ i }}
            </text>
          </svg>

          <div class="flex items-center justify-between w-full max-w-[200px] mt-2 gap-4">
            <button
              @click="patternDots = []"
              class="px-3 py-1.5 rounded bg-surface-container/60 hover:bg-surface-bright/20 border border-[#464554]/40 text-[9px] font-bold text-on-surface transition-colors"
            >
              Clear Pola
            </button>
            <button
              @click="verifyPattern"
              :disabled="patternDots.length < 2"
              class="px-4 py-1.5 rounded bg-primary text-[9px] font-bold text-on-primary hover:bg-primary/95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Verifikasi Pola
            </button>
          </div>
        </div>

      </div>

      <!-- Footer Mode Selectors & Biometrics Challenge -->
      <div class="w-full border-t border-[#464554]/30 pt-5 mt-6 flex flex-col gap-4 items-center">
        <!-- Biometric Unlock Button (If active) -->
        <button
          v-if="isBiometricEnabled"
          @click="triggerBiometrics"
          class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-xs font-black text-on-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/10 w-full"
        >
          <Fingerprint class="w-4 h-4" />
          Masuk dengan Sidik Jari / Wajah
        </button>

        <!-- Universal Method Selection Tabs (If multiple are active) -->
        <div v-if="activeModes.length > 1" class="flex gap-1 bg-[#13131b] border border-[#464554]/30 p-1 rounded-lg">
          <button
            v-for="mode in activeModes"
            :key="mode"
            @click="setMode(mode)"
            class="px-3 py-1.5 text-[9px] font-extrabold rounded uppercase tracking-wider transition-colors"
            :class="[currentMode === mode ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface']"
          >
            {{ mode }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSecurityStore } from '~/stores/security'
import { useSettingsStore } from '~/stores/settings'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Lock, Eye, EyeOff, Fingerprint, Undo2, Check } from '@lucide/vue'

const store = useBudgetStore()
const securityStore = useSecurityStore()
const settingsStore = useSettingsStore()

async function safeInvoke(cmd, args) {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      return await invoke(cmd, args)
    } catch (e) {
      console.error(`Tauri invoke error for ${cmd}:`, e)
      throw e
    }
  }
  return null
}

// State
const currentMode = ref('')
const passwordVal = ref('')
const showPassword = ref(false)
const patternDots = ref([])
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])

const isBiometricSimulating = ref(false)
const shakeActive = ref(false)
const errorMessage = ref('')
const biometricSuccess = ref(false)
const biometricTimeoutId = ref(null)

// Password input ref for focus
const passwordInput = ref(null)

// Computed active methods
const activeModes = computed(() => {
  const modes = []
  if (securityStore.security.pinEnabled) modes.push('pin')
  if (securityStore.security.patternEnabled) modes.push('pattern')
  if (securityStore.security.passwordEnabled) modes.push('password')
  return modes
})

const isBiometricEnabled = computed(() => {
  return securityStore.security.fingerprintEnabled || securityStore.security.faceEnabled
})

// Set active unlock mode
const setMode = (mode) => {
  currentMode.value = mode
  errorMessage.value = ''
  
  // Clear biometric simulation if running
  if (biometricTimeoutId.value) {
    clearTimeout(biometricTimeoutId.value)
    biometricTimeoutId.value = null
  }
  isBiometricSimulating.value = false
  biometricSuccess.value = false
  
  // Clean values on tab change
  passwordVal.value = ''
  patternDots.value = []
  pinDigits.value = ['', '', '', '']
  
  // Auto focus input
  if (mode === 'password') {
    nextTick(() => {
      passwordInput.value?.focus()
    })
  } else if (mode === 'pin') {
    focusFirstPinInput()
  }
}

// Focus helpers for PIN
const focusFirstPinInput = () => {
  nextTick(() => {
    setTimeout(() => {
      if (pinInputs.value && pinInputs.value[0]) {
        pinInputs.value[0].focus()
      }
    }, 100)
  })
}

// PIN event handlers
const onPinInput = (index, event) => {
  const value = event.target.value
  const cleanVal = value.replace(/\D/g, '')
  pinDigits.value[index] = cleanVal

  if (cleanVal && index < 3) {
    pinInputs.value[index + 1]?.focus()
  }
  
  // Check if complete
  if (pinDigits.value.join('').length === 4) {
    setTimeout(() => {
      verifyPin()
    }, 100)
  }
}

const onPinKeyDown = (index, event) => {
  if (event.key === 'Backspace') {
    if (!pinDigits.value[index] && index > 0) {
      pinDigits.value[index - 1] = ''
      pinInputs.value[index - 1]?.focus()
    } else {
      pinDigits.value[index] = ''
    }
  }
}

const onPinPaste = (event) => {
  const pasteData = event.clipboardData?.getData('text') || ''
  const cleanData = pasteData.replace(/\D/g, '').slice(0, 4)
  if (cleanData) {
    const digits = cleanData.split('')
    for (let i = 0; i < 4; i++) {
      pinDigits.value[i] = digits[i] || ''
    }
    // Verify PIN if fully pasted
    if (cleanData.length === 4) {
      setTimeout(() => {
        verifyPin()
      }, 100)
    } else {
      const focusIndex = Math.min(cleanData.length, 3)
      pinInputs.value[focusIndex]?.focus()
    }
  }
  event.preventDefault()
}

// Keypad triggers
const handleKeypadPress = (num) => {
  const emptyIndex = pinDigits.value.findIndex(d => d === '')
  if (emptyIndex !== -1) {
    pinDigits.value[emptyIndex] = String(num)
    
    // Auto focus next input
    nextTick(() => {
      pinInputs.value[Math.min(emptyIndex + 1, 3)]?.focus()
    })
    
    // Auto verify if full
    if (emptyIndex === 3) {
      setTimeout(() => {
        verifyPin()
      }, 150)
    }
  }
}

const handleKeypadBackspace = () => {
  let lastFilledIndex = -1
  for (let i = 3; i >= 0; i--) {
    if (pinDigits.value[i] !== '') {
      lastFilledIndex = i
      break
    }
  }
  if (lastFilledIndex !== -1) {
    pinDigits.value[lastFilledIndex] = ''
    nextTick(() => {
      pinInputs.value[lastFilledIndex]?.focus()
    })
  }
}

const handleKeypadClear = () => {
  pinDigits.value = ['', '', '', '']
  focusFirstPinInput()
}

// Pattern helpers
const getDotCoords = (index) => {
  const xCoords = [25, 60, 95]
  const yCoords = [25, 60, 95]
  const idx = index - 1
  return { x: xCoords[idx % 3], y: yCoords[Math.floor(idx / 3)] }
}

const handleDotClick = (index) => {
  if (patternDots.value.includes(index)) {
    if (patternDots.value[patternDots.value.length - 1] === index) {
      patternDots.value.pop()
    }
  } else {
    patternDots.value.push(index)
  }
}

// Shake animation helper on error
const triggerErrorShake = (msg) => {
  errorMessage.value = msg
  shakeActive.value = true
  setTimeout(() => {
    shakeActive.value = false
  }, 500)
}

// Success unlock event
const unlockSuccess = () => {
  securityStore.isLocked = false
  // Clean states
  passwordVal.value = ''
  pinDigits.value = ['', '', '', '']
  patternDots.value = []
  errorMessage.value = ''
}

// Verification triggers
const verifyPassword = async () => {
  if (!passwordVal.value.trim()) {
    triggerErrorShake('Password tidak boleh kosong.')
    return
  }
  
  let isMatch = false
  if (settingsStore.isTauri) {
    try {
      isMatch = await safeInvoke('verify_credential', {
        plain: passwordVal.value.trim(),
        hash: securityStore.security.passwordVal
      })
      if (isMatch) {
        const pin = await safeInvoke('unlock_db_from_keyring')
        if (pin) {
          securityStore.security.pinVal = pin
          await store.loadTauriState()
        } else {
          isMatch = false
        }
      }
    } catch (e) {
      console.error('Password verification error:', e)
    }
  } else {
    isMatch = passwordVal.value.trim() === securityStore.security.passwordVal
  }

  if (isMatch) {
    unlockSuccess()
  } else {
    triggerErrorShake('Password yang Anda masukkan salah.')
    passwordVal.value = ''
    nextTick(() => {
      passwordInput.value?.focus()
    })
  }
}

const verifyPin = async () => {
  const enteredPin = pinDigits.value.join('')
  if (enteredPin.length !== 4) {
    triggerErrorShake('Masukkan 4 digit PIN lengkap.')
    return
  }
  if (settingsStore.isTauri) {
    try {
      errorMessage.value = ''
      const success = await securityStore.unlockWithPin(enteredPin)
      if (success) {
        unlockSuccess()
      } else {
        triggerErrorShake(securityStore.isPinSetupRequired ? 'Gagal meregistrasi PIN.' : 'PIN salah atau dekripsi gagal.')
        handleKeypadClear()
      }
    } catch (e) {
      triggerErrorShake(e.message || 'PIN salah atau dekripsi gagal.')
      handleKeypadClear()
    }
  } else {
    // Fallback to web mock password
    if (enteredPin === securityStore.security.pinVal) {
      unlockSuccess()
    } else {
      triggerErrorShake('PIN yang Anda masukkan salah.')
      handleKeypadClear()
    }
  }
}

const verifyPattern = async () => {
  if (patternDots.value.length < 2) {
    triggerErrorShake('Hubungkan minimal 2 titik untuk pola.')
    return
  }
  const enteredPattern = patternDots.value.join('-')
  
  let isMatch = false
  if (settingsStore.isTauri) {
    try {
      isMatch = await safeInvoke('verify_credential', {
        plain: enteredPattern,
        hash: securityStore.security.patternVal
      })
      if (isMatch) {
        const pin = await safeInvoke('unlock_db_from_keyring')
        if (pin) {
          securityStore.security.pinVal = pin
          await store.loadTauriState()
        } else {
          isMatch = false
        }
      }
    } catch (e) {
      console.error('Pattern verification error:', e)
    }
  } else {
    isMatch = enteredPattern === securityStore.security.patternVal
  }

  if (isMatch) {
    unlockSuccess()
  } else {
    triggerErrorShake('Pola yang Anda hubungkan salah.')
    patternDots.value = []
  }
}

// Biometrics Authenticator Trigger
const triggerBiometrics = async () => {
  if (!isBiometricEnabled.value) return
  
  if (settingsStore.isTauri) {
    try {
      errorMessage.value = ''
      const success = await securityStore.authenticateBiometric()
      if (success) {
        unlockSuccess()
      } else {
        triggerErrorShake('Verifikasi biometrik dibatalkan atau tidak cocok.')
      }
    } catch (e) {
      triggerErrorShake(e.message || 'Gagal memverifikasi biometrik.')
    }
  } else {
    // Web fallback simulation
    if (biometricTimeoutId.value) {
      clearTimeout(biometricTimeoutId.value)
    }
    
    isBiometricSimulating.value = true
    biometricSuccess.value = false
    errorMessage.value = ''
    
    biometricTimeoutId.value = setTimeout(() => {
      isBiometricSimulating.value = false
      triggerErrorShake('Pemindaian biometrik timeout. Silakan coba lagi.')
      biometricTimeoutId.value = null
    }, 5000)
  }
}

const simulateBiometricSuccess = () => {
  if (biometricTimeoutId.value) {
    clearTimeout(biometricTimeoutId.value)
    biometricTimeoutId.value = null
  }
  
  biometricSuccess.value = true
  
  setTimeout(() => {
    biometricSuccess.value = false
    isBiometricSimulating.value = false
    unlockSuccess()
  }, 800)
}

// Clear timer on destroy
onBeforeUnmount(() => {
  if (biometricTimeoutId.value) {
    clearTimeout(biometricTimeoutId.value)
  }
})

// Mounted initialization
onMounted(() => {
  if (activeModes.value.length > 0) {
    // Default to the first active mode
    setMode(activeModes.value[0])
  }
  
  // Auto biometrics check challenge if enabled
  if (isBiometricEnabled.value) {
    triggerBiometrics()
  }
})
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-8px); }
  30%, 60%, 90% { transform: translateX(8px); }
}
.shake {
  animation: shake 0.5s ease-in-out;
}
</style>
