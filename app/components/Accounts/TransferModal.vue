<template>
  <CommonModal :show="show" size="2xl" @close="close">
    <template #header>
      <div class="flex flex-col">
        <span>Transfer Funds</span>
        <span class="text-[10px] font-semibold text-on-surface-variant normal-case mt-0.5">Move money between your bank accounts instantly</span>
      </div>
    </template>
    <template #body>
      <form class="pt-2 pb-1" @submit.prevent>
        <!-- Hidden native selects for test suite and accessibility compatibility -->
        <select v-model="transferForm.fromAccountId" class="hidden" aria-hidden="true">
          <option v-for="acc in filteredSourceAccounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
        <select v-model="transferForm.toAccountId" class="hidden" aria-hidden="true">
          <option v-for="acc in filteredDestAccounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <!-- Left Column: Source & Destination Account Cards -->
          <div class="space-y-4 flex flex-col">
            <!-- Source Account Card -->
            <div class="flex flex-col gap-1.5">
              <button
                type="button"
                @click="toggleSourceDropdown"
                class="w-full bg-[#13131b]/95 hover:bg-[#1b1b24] border border-[#464554]/40 rounded-xl px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 relative flex flex-col justify-between min-h-[76px] shadow-sm hover:shadow-md cursor-pointer"
                :class="{ 'border-primary ring-1 ring-primary/30': sourceDropdownOpen }"
              >
                <div class="flex justify-between items-start w-full">
                  <span class="text-[8px] font-black text-primary uppercase tracking-wider">From Source Account</span>
                  <ChevronDown class="w-3.5 h-3.5 text-on-surface-variant transition-transform duration-250" :class="{ 'rotate-180 text-primary': sourceDropdownOpen }" />
                </div>
                <div class="mt-1 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" :style="{ backgroundColor: getAccountBankColor(transferForm.fromAccountId) }"></span>
                  <span class="text-xs font-extrabold text-on-surface truncate">{{ getAccountName(transferForm.fromAccountId) }}</span>
                </div>
                <div class="text-[9px] font-bold text-on-surface-variant mt-0.5">
                  Current Balance: <span class="text-on-surface/90">{{ getAccountBalanceFormatted(transferForm.fromAccountId) }}</span>
                </div>
              </button>

              <!-- Inline Custom Dropdown for Source -->
              <transition name="expand">
                <div v-if="sourceDropdownOpen" class="border border-[#464554]/30 rounded-xl bg-[#171721] overflow-hidden divide-y divide-[#464554]/25 shadow-inner">
                  <div
                    v-for="acc in filteredSourceAccounts"
                    :key="acc.id"
                    @click="selectSourceAccount(acc.id)"
                    class="flex items-center justify-between px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors group"
                    :class="[transferForm.fromAccountId === acc.id ? 'bg-primary/5 text-primary' : 'text-on-surface']"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getAccountBankColor(acc.id) }"></span>
                      <div class="flex flex-col">
                        <span class="text-xs font-bold group-hover:text-primary transition-colors">{{ acc.name }}</span>
                        <span class="text-[9px] text-on-surface-variant font-medium">{{ getBankCode(acc.bankId) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-extrabold text-on-surface-variant">{{ getAccountBalanceFormatted(acc.id) }}</span>
                      <Check v-if="transferForm.fromAccountId === acc.id" class="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Swap Button (Floating between them) -->
            <div class="flex justify-center -my-2 z-30">
              <button
                type="button"
                @click="swapAccounts"
                class="w-7 h-7 rounded-full bg-[#1b1b24] border border-[#464554]/60 hover:border-primary flex items-center justify-center text-primary hover:text-primary-light transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer"
                title="Swap Accounts"
              >
                <ArrowLeftRight class="w-3.5 h-3.5 rotate-90" />
              </button>
            </div>

            <!-- Destination Account Card -->
            <div class="flex flex-col gap-1.5">
              <button
                type="button"
                @click="toggleDestDropdown"
                class="w-full bg-[#13131b]/95 hover:bg-[#1b1b24] border border-[#464554]/40 rounded-xl px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 relative flex flex-col justify-between min-h-[76px] shadow-sm hover:shadow-md cursor-pointer"
                :class="{ 'border-secondary ring-1 ring-secondary/30': destDropdownOpen }"
              >
                <div class="flex justify-between items-start w-full">
                  <span class="text-[8px] font-black text-secondary uppercase tracking-wider">To Destination Account</span>
                  <ChevronDown class="w-3.5 h-3.5 text-on-surface-variant transition-transform duration-250" :class="{ 'rotate-180 text-secondary': destDropdownOpen }" />
                </div>
                <div class="mt-1 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" :style="{ backgroundColor: getAccountBankColor(transferForm.toAccountId) }"></span>
                  <span class="text-xs font-extrabold text-on-surface truncate">{{ getAccountName(transferForm.toAccountId) }}</span>
                </div>
                <div class="text-[9px] font-bold text-on-surface-variant mt-0.5">
                  Current Balance: <span class="text-on-surface/90">{{ getAccountBalanceFormatted(transferForm.toAccountId) }}</span>
                </div>
              </button>

              <!-- Inline Custom Dropdown for Destination -->
              <transition name="expand">
                <div v-if="destDropdownOpen" class="border border-[#464554]/30 rounded-xl bg-[#171721] overflow-hidden divide-y divide-[#464554]/25 shadow-inner">
                  <div
                    v-for="acc in filteredDestAccounts"
                    :key="acc.id"
                    @click="selectDestAccount(acc.id)"
                    class="flex items-center justify-between px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors group"
                    :class="[transferForm.toAccountId === acc.id ? 'bg-primary/5 text-primary' : 'text-on-surface']"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getAccountBankColor(acc.id) }"></span>
                      <div class="flex flex-col">
                        <span class="text-xs font-bold group-hover:text-primary transition-colors">{{ acc.name }}</span>
                        <span class="text-[9px] text-on-surface-variant font-medium">{{ getBankCode(acc.bankId) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-extrabold text-on-surface-variant">{{ getAccountBalanceFormatted(acc.id) }}</span>
                      <Check v-if="transferForm.toAccountId === acc.id" class="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Right Column: Amount & Memo -->
          <div class="space-y-4">
            <!-- High-Impact Amount Input -->
            <div 
              @click="focusAmountInput"
              class="glass-panel bg-[#0e0e15]/40 hover:bg-[#0e0e15]/50 border border-[#464554]/20 hover:border-[#464554]/30 rounded-xl p-4 flex flex-col items-center gap-1.5 shadow-inner transition-all cursor-text"
            >
              <span class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Transfer Amount</span>
              <div class="relative flex items-center justify-center w-full max-w-[240px]">
                <span class="text-lg font-black text-on-surface-variant mr-1.5 select-none">Rp</span>
                <input
                  type="text"
                  :value="displayAmount"
                  @input="handleAmountInput"
                  placeholder="0"
                  class="bg-transparent border-none text-2xl font-black text-center text-primary focus:ring-0 focus:outline-none w-full placeholder-primary/20 tracking-tight"
                  id="transfer-amount-input"
                />
                <span v-if="settingsStore.kMode" class="text-lg font-black text-on-surface-variant ml-1.5 select-none">K</span>
              </div>

              <!-- Subtext displaying actual conversion -->
              <div class="text-[10px] font-bold text-on-surface-variant/80 border-t border-[#464554]/15 pt-1.5 w-full text-center select-none">
                Total Transfer: <span class="text-secondary font-black">{{ actualAmountFormatted }}</span>
              </div>

              <!-- Preset Pills -->
              <div class="flex flex-wrap gap-1.5 justify-center mt-2.5">
                <button
                  type="button"
                  @click.stop="addPresetAmount(50)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +50K
                </button>
                <button
                  type="button"
                  @click.stop="addPresetAmount(100)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +100K
                </button>
                <button
                  type="button"
                  @click.stop="addPresetAmount(500)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +500K
                </button>
                <button
                  type="button"
                  @click.stop="addPresetAmount(1000)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +1M
                </button>
                <button
                  type="button"
                  @click.stop="clearAmount"
                  class="px-2.5 py-0.5 rounded-full bg-error/10 hover:bg-error/20 hover:text-error border border-error/20 hover:border-error/40 text-[9px] font-bold text-error transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Clear
                </button>
              </div>
            </div>

            <!-- Memo Input Section -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Memo / Note</label>
              <div class="relative flex items-center">
                <FileText class="absolute left-3 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type="text"
                  v-model="transferForm.memo"
                  placeholder="e.g. BCA to Jago Savings Transfer"
                  class="bg-[#13131b] border border-[#464554]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none w-full placeholder-[#464554]"
                />
              </div>
              
              <!-- Quick Memo Suggestions -->
              <div class="flex flex-wrap gap-1.5 mt-1 select-none">
                <button
                  v-for="suggestion in memoSuggestions"
                  :key="suggestion"
                  type="button"
                  @click="transferForm.memo = suggestion"
                  class="px-2 py-0.5 rounded bg-[#13131b] hover:bg-surface-bright/20 border border-[#464554]/25 text-[8px] font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <button
        @click="close"
        class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40 cursor-pointer"
      >
        Cancel
      </button>
      <button
        @click="executeTransfer"
        class="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-on-primary hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)]"
      >
        Confirm Transfer
      </button>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ChevronDown, ArrowLeftRight, FileText, Check } from '@lucide/vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  initialFromAccountId: {
    type: String,
    default: ''
  },
  initialToAccountId: {
    type: String,
    default: ''
  },
  sourceBankId: {
    type: String,
    default: ''
  },
  destBankId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const transferForm = ref({
  fromAccountId: '',
  toAccountId: '',
  amount: 0,
  memo: ''
})

const displayAmount = ref('0')
const sourceDropdownOpen = ref(false)
const destDropdownOpen = ref(false)

const memoSuggestions = [
  'Refill Pocket Cash',
  'Savings Allocation',
  'Monthly Transfer',
  'Emergency Fund'
]

const getAccount = (accId) => {
  return store.accounts.find(a => a.id === accId)
}

const getAccountBankColor = (accId) => {
  const acc = getAccount(accId)
  if (!acc) return '#908fa0'
  const bank = store.banks.find(b => b.id === acc.bankId)
  return bank ? bank.color : '#908fa0'
}

const getAccountName = (accId) => {
  const acc = getAccount(accId)
  if (!acc) return 'Select Account'
  const bank = store.banks.find(b => b.id === acc.bankId)
  return bank ? `${bank.code} — ${acc.name}` : acc.name
}

const getAccountBalanceFormatted = (accId) => {
  const acc = getAccount(accId)
  if (!acc) return 'Rp 0'
  return settingsStore.formatValue(acc.balance)
}

const getBankCode = (bankId) => {
  const bank = store.banks.find(b => b.id === bankId)
  return bank ? bank.code : ''
}

const handleAmountInput = (event) => {
  const inputVal = event.target.value
  const clean = inputVal.replace(/\D/g, '')
  if (!clean) {
    displayAmount.value = ''
    transferForm.value.amount = 0
    return
  }
  const num = parseInt(clean, 10)
  transferForm.value.amount = num
  displayAmount.value = num.toLocaleString('id-ID')
}

const addPresetAmount = (valueK) => {
  const addValue = settingsStore.kMode ? valueK : valueK * 1000
  transferForm.value.amount = (transferForm.value.amount || 0) + addValue
  displayAmount.value = transferForm.value.amount.toLocaleString('id-ID')
}

const clearAmount = () => {
  transferForm.value.amount = 0
  displayAmount.value = '0'
}

const swapAccounts = () => {
  const temp = transferForm.value.fromAccountId
  transferForm.value.fromAccountId = transferForm.value.toAccountId
  transferForm.value.toAccountId = temp
}

const toggleSourceDropdown = () => {
  sourceDropdownOpen.value = !sourceDropdownOpen.value
  destDropdownOpen.value = false
}

const toggleDestDropdown = () => {
  destDropdownOpen.value = !destDropdownOpen.value
  sourceDropdownOpen.value = false
}

const selectSourceAccount = (accId) => {
  transferForm.value.fromAccountId = accId
  sourceDropdownOpen.value = false
}

const selectDestAccount = (accId) => {
  transferForm.value.toAccountId = accId
  destDropdownOpen.value = false
}

const focusAmountInput = () => {
  document.getElementById('transfer-amount-input')?.focus()
}

const actualAmountFormatted = computed(() => {
  const rawAmt = parseFloat(transferForm.value.amount) || 0
  const absoluteAmount = settingsStore.kMode ? rawAmt * 1000 : rawAmt
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(absoluteAmount)
})

const filteredSourceAccounts = computed(() => {
  if (props.sourceBankId) {
    return store.accounts.filter(acc => acc.bankId === props.sourceBankId)
  }
  return store.accounts
})

const filteredDestAccounts = computed(() => {
  if (props.destBankId) {
    return store.accounts.filter(acc => acc.bankId === props.destBankId)
  }
  return store.accounts
})

watch(() => props.show, (newShow) => {
  if (newShow) {
    sourceDropdownOpen.value = false
    destDropdownOpen.value = false
    const fromId = props.initialFromAccountId || filteredSourceAccounts.value[0]?.id || ''
    let toId = props.initialToAccountId || filteredDestAccounts.value[0]?.id || ''

    if (fromId && fromId === toId && filteredDestAccounts.value.length > 1) {
      const otherAcc = filteredDestAccounts.value.find(acc => acc.id !== fromId)
      if (otherAcc) {
        toId = otherAcc.id
      }
    }

    transferForm.value = {
      fromAccountId: fromId,
      toAccountId: toId,
      amount: 0,
      memo: ''
    }
    displayAmount.value = '0'
  }
}, { immediate: true })

const close = () => {
  emit('close')
}

const executeTransfer = () => {
  if (transferForm.value.fromAccountId === transferForm.value.toAccountId) {
    alert('Source and destination accounts must be different.')
    return
  }
  if (!transferForm.value.amount || transferForm.value.amount <= 0) {
    alert('Please enter a valid transfer amount.')
    return
  }

  const rawAmt = parseFloat(transferForm.value.amount)
  const absoluteAmount = settingsStore.kMode ? rawAmt * 1000 : rawAmt

  store.transferFunds(
    transferForm.value.fromAccountId,
    transferForm.value.toAccountId,
    absoluteAmount,
    transferForm.value.memo || 'Transfer Funds'
  )

  close()
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.25s ease-in-out, opacity 0.2s ease-in-out;
  max-height: 280px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
