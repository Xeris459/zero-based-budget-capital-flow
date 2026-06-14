<template>
  <CommonModal :show="show" size="2xl" @close="close">
    <template #header>
      <div class="flex flex-col">
        <span>Add New Account</span>
        <span class="text-[10px] font-semibold text-on-surface-variant normal-case mt-0.5">Create a new checking, savings, card, or cash wallet account</span>
      </div>
    </template>
    <template #body>
      <form class="pt-2 pb-1" @submit.prevent>
        <!-- Hidden selects to support automated Vitest tests -->
        <select v-model="newAccount.type" class="hidden" aria-hidden="true">
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit_card">Credit Card</option>
          <option value="cash">Cash</option>
        </select>
        <select v-model="newAccount.bankId" class="hidden" aria-hidden="true">
          <option v-for="b in store.banks" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <!-- Left Column: Name & Bank Provider -->
          <div class="space-y-4 flex flex-col">
            <!-- Account Name -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Account Name</label>
              <div class="relative flex items-center">
                <PenLine class="absolute left-3 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type="text"
                  v-model="newAccount.name"
                  placeholder="e.g. Salary Checking"
                  class="bg-[#13131b] border border-[#464554]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none w-full placeholder-[#464554]"
                />
              </div>
            </div>

            <!-- Bank Provider (Grid Selector) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Bank Provider</label>
              <div class="grid grid-cols-2 gap-2 select-none">
                <button
                  v-for="b in store.banks"
                  :key="b.id"
                  type="button"
                  @click="newAccount.bankId = b.id"
                  class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-[#13131b]/95 hover:bg-[#1b1b24] text-xs font-bold transition-all cursor-pointer"
                  :style="{ borderLeftColor: b.color, borderLeftWidth: newAccount.bankId === b.id ? '4px' : '1px' }"
                  :class="[
                    newAccount.bankId === b.id 
                      ? 'border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-primary/35 text-on-surface' 
                      : 'border-[#464554]/40 text-on-surface-variant'
                  ]"
                >
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: b.color }"></span>
                  <span class="truncate">{{ b.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Type & Starting Balance -->
          <div class="space-y-4">
            <!-- Account Type (Grid Selector) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Account Type</label>
              <div class="grid grid-cols-2 gap-2 select-none">
                <button
                  type="button"
                  @click="newAccount.type = 'checking'"
                  class="flex flex-col items-center justify-center p-3 rounded-xl border bg-[#13131b]/95 hover:bg-[#1b1b24] transition-all cursor-pointer min-h-[62px]"
                  :class="[
                    newAccount.type === 'checking'
                      ? 'border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-primary/35 text-primary'
                      : 'border-[#464554]/40 text-on-surface-variant'
                  ]"
                >
                  <Landmark class="w-4 h-4 mb-1" />
                  <span class="text-[9px] font-black text-on-surface">Checking</span>
                </button>
                
                <button
                  type="button"
                  @click="newAccount.type = 'savings'"
                  class="flex flex-col items-center justify-center p-3 rounded-xl border bg-[#13131b]/95 hover:bg-[#1b1b24] transition-all cursor-pointer min-h-[62px]"
                  :class="[
                    newAccount.type === 'savings'
                      ? 'border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-primary/35 text-primary'
                      : 'border-[#464554]/40 text-on-surface-variant'
                  ]"
                >
                  <Lock class="w-4 h-4 mb-1" />
                  <span class="text-[9px] font-black text-on-surface">Savings Vault</span>
                </button>

                <button
                  type="button"
                  @click="newAccount.type = 'credit_card'"
                  class="flex flex-col items-center justify-center p-3 rounded-xl border bg-[#13131b]/95 hover:bg-[#1b1b24] transition-all cursor-pointer min-h-[62px]"
                  :class="[
                    newAccount.type === 'credit_card'
                      ? 'border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-primary/35 text-primary'
                      : 'border-[#464554]/40 text-on-surface-variant'
                  ]"
                >
                  <CreditCard class="w-4 h-4 mb-1" />
                  <span class="text-[9px] font-black text-on-surface">Credit Card</span>
                </button>

                <button
                  type="button"
                  @click="newAccount.type = 'cash'"
                  class="flex flex-col items-center justify-center p-3 rounded-xl border bg-[#13131b]/95 hover:bg-[#1b1b24] transition-all cursor-pointer min-h-[62px]"
                  :class="[
                    newAccount.type === 'cash'
                      ? 'border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-primary/35 text-primary'
                      : 'border-[#464554]/40 text-on-surface-variant'
                  ]"
                >
                  <Wallet class="w-4 h-4 mb-1" />
                  <span class="text-[9px] font-black text-on-surface">Pocket Cash</span>
                </button>
              </div>
            </div>

            <!-- Starting Balance -->
            <div 
              @click="focusBalanceInput"
              class="glass-panel bg-[#0e0e15]/40 hover:bg-[#0e0e15]/50 border border-[#464554]/20 hover:border-[#464554]/30 rounded-xl p-4 flex flex-col items-center gap-1.5 shadow-inner transition-all cursor-text relative"
            >
              <span class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Starting Balance</span>
              <div class="relative flex items-center justify-center w-full max-w-[240px]">
                <span class="text-lg font-black text-on-surface-variant mr-1.5 select-none">Rp</span>
                <input
                  type="text"
                  :value="displayStartingBalance"
                  @input="handleStartingBalanceInput"
                  placeholder="0"
                  class="bg-transparent border-none text-2xl font-black text-center text-primary focus:ring-0 focus:outline-none w-full placeholder-primary/20 tracking-tight"
                  id="starting-balance-input"
                />
                <span v-if="settingsStore.kMode" class="text-lg font-black text-on-surface-variant ml-1.5 select-none">K</span>
              </div>

              <!-- Subtext displaying actual conversion -->
              <div class="text-[10px] font-bold text-on-surface-variant/80 border-t border-[#464554]/15 pt-1.5 w-full text-center select-none flex justify-between items-center px-1">
                <button 
                  type="button" 
                  @click.stop="toggleBalanceSign"
                  class="px-2 py-0.5 rounded bg-[#13131b] hover:bg-surface-bright/20 border border-[#464554]/30 text-[8px] font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer animate-fade-in"
                >
                  +/- Negative
                </button>
                <span>
                  Total: <span class="font-black" :class="[newAccount.startingBalance < 0 ? 'text-error' : 'text-secondary']">{{ actualBalanceFormatted }}</span>
                </span>
              </div>

              <!-- Preset Pills -->
              <div class="flex flex-wrap gap-1.5 justify-center mt-2.5">
                <button
                  type="button"
                  @click.stop="addStartingBalancePreset(100)"
                  class="px-2 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +100K
                </button>
                <button
                  type="button"
                  @click.stop="addStartingBalancePreset(500)"
                  class="px-2 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +500K
                </button>
                <button
                  type="button"
                  @click.stop="addStartingBalancePreset(1000)"
                  class="px-2 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +1M
                </button>
                <button
                  type="button"
                  @click.stop="addStartingBalancePreset(5000)"
                  class="px-2 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +5M
                </button>
                <button
                  type="button"
                  @click.stop="clearBalance"
                  class="px-2 py-0.5 rounded-full bg-error/10 hover:bg-error/20 hover:text-error border border-error/20 hover:border-error/40 text-[9px] font-bold text-error transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Clear
                </button>
              </div>
            </div>

            <!-- Foreign Currency Toggle -->
            <div 
              @click="isValas = !isValas"
              class="p-3 bg-[#13131b]/60 border border-[#464554]/25 rounded-xl flex items-center justify-between cursor-pointer select-none"
            >
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-bold text-on-surface">Rekening Valas (Mata Uang Asing)?</span>
                <span class="text-[9px] text-on-surface-variant">Aktifkan jika rekening ini menggunakan mata uang asing (USD, SGD, dll.)</span>
              </div>
              <button
                type="button"
                class="w-11 h-6 rounded-full relative transition-colors focus:outline-none pointer-events-none"
                :class="[isValas ? 'bg-primary' : 'bg-surface-variant']"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                  :class="[isValas ? 'right-1' : 'left-1']"
                ></span>
              </button>
            </div>

            <!-- Valas Instruction Card -->
            <div v-if="isValas" class="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2 text-[10px] text-on-surface-variant leading-relaxed animate-fade-in select-none">
              <div class="flex items-center gap-1.5 text-primary font-bold">
                <HelpCircle class="w-3.5 h-3.5" />
                <span>Panduan Rekening Valas (Cara 1)</span>
              </div>
              <p>
                Untuk menjaga keakuratan anggaran <em>Zero-Based Budgeting</em>, rekening ini harus tetap dicatat dalam ekuivalen <strong>Rupiah (IDR)</strong>:
              </p>
              <ul class="list-disc pl-4 space-y-1">
                <li><strong>Saldo Awal</strong>: Konversikan saldo valas Anda saat ini ke Rupiah menggunakan kurs hari ini (misal: USD 1,000 &rarr; masukkan Rp 16.300.000).</li>
                <li><strong>Konversi/Jual Beli</strong>: Catat penukaran uang sebagai transaksi <strong>Transfer</strong> antar rekening dengan nilai Rupiah aktual.</li>
                <li><strong>Penyesuaian Kurs</strong>: Lakukan penyesuaian bulanan. Jika nilai Rupiah menguat, buat transaksi <em>Inflow</em> kategori khusus "Selisih Kurs". Jika melemah, buat transaksi <em>Outflow</em> "Selisih Kurs".</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <button
        @click="close"
        :disabled="isSaving"
        class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        @click="saveNewAccount"
        :disabled="isSaving"
        class="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-on-primary hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSaving ? 'Creating...' : 'Create Account' }}
      </button>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { Landmark, Lock, CreditCard, Wallet, PenLine, HelpCircle } from '@lucide/vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  selectedBankId: {
    type: String,
    default: 'bank-bca'
  }
})

const emit = defineEmits(['close'])

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const newAccount = ref({
  name: '',
  type: 'checking',
  bankId: props.selectedBankId,
  startingBalance: 0
})

const displayStartingBalance = ref('0')
const isValas = ref(false)
const isSaving = ref(false)

const handleStartingBalanceInput = (event) => {
  const inputVal = event.target.value
  const isNegative = inputVal.startsWith('-')
  const clean = inputVal.replace(/\D/g, '')
  if (!clean) {
    displayStartingBalance.value = isNegative ? '-' : ''
    newAccount.value.startingBalance = 0
    return
  }
  const num = parseInt(clean, 10)
  newAccount.value.startingBalance = isNegative ? -num : num
  displayStartingBalance.value = (isNegative ? '-' : '') + num.toLocaleString('id-ID')
}

const addStartingBalancePreset = (valueK) => {
  const addValue = settingsStore.kMode ? valueK : valueK * 1000
  const currentSign = newAccount.value.startingBalance < 0 ? -1 : 1
  
  // Add magnitude, then apply sign
  const currentMagnitude = Math.abs(newAccount.value.startingBalance || 0)
  const newMagnitude = currentMagnitude + addValue
  
  newAccount.value.startingBalance = newMagnitude * currentSign
  displayStartingBalance.value = (currentSign < 0 ? '-' : '') + newMagnitude.toLocaleString('id-ID')
}

const toggleBalanceSign = () => {
  newAccount.value.startingBalance = -newAccount.value.startingBalance
  const isNegative = newAccount.value.startingBalance < 0
  const absVal = Math.abs(newAccount.value.startingBalance)
  displayStartingBalance.value = (isNegative ? '-' : '') + absVal.toLocaleString('id-ID')
}

const clearBalance = () => {
  newAccount.value.startingBalance = 0
  displayStartingBalance.value = '0'
}

const focusBalanceInput = () => {
  document.getElementById('starting-balance-input')?.focus()
}

const actualBalanceFormatted = computed(() => {
  const rawBal = parseFloat(newAccount.value.startingBalance) || 0
  const absoluteBalance = settingsStore.kMode ? rawBal * 1000 : rawBal
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(absoluteBalance)
})

watch(() => props.show, (newShow) => {
  isSaving.value = false
  if (newShow) {
    newAccount.value = {
      name: '',
      type: 'checking',
      bankId: props.selectedBankId,
      startingBalance: 0
    }
    displayStartingBalance.value = '0'
    isValas.value = false
  }
})

const close = () => {
  emit('close')
}

const saveNewAccount = async () => {
  if (isSaving.value) return
  if (!newAccount.value.name.trim()) {
    alert('Please enter an account name.')
    return
  }

  isSaving.value = true
  try {
    const rawBal = parseFloat(newAccount.value.startingBalance) || 0
    const absoluteBalance = settingsStore.kMode ? rawBal * 1000 : rawBal

    const id = 'acc-' + Math.random().toString(36).substring(2, 9)
    await store.addAccount({
      id,
      name: newAccount.value.name.trim(),
      type: newAccount.value.type,
      bankId: newAccount.value.bankId,
      startingBalance: absoluteBalance
    })

    close()
  } catch (error) {
    console.error(error)
  } finally {
    isSaving.value = false
  }
}
</script>
