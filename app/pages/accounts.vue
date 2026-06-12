<template>
  <div class="flex flex-col lg:flex-row gap-6 items-stretch">
    <!-- Left Column: Master List (Accounts by Bank) -->
    <div class="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
      <!-- Top Actions Card -->
      <div class="glass-panel p-4 rounded-xl border border-[#464554]/20 flex flex-col gap-2.5">
        <h2 class="text-sm font-extrabold text-on-surface flex items-center gap-2">
          <Landmark class="w-4.5 h-4.5 text-primary" />
          Accounts & Ledgers
        </h2>
        <div class="grid grid-cols-2 gap-2 mt-1">
          <button
            @click="showAddAccountModal = true"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/95 text-[11px] font-bold text-on-primary transition-all duration-200 justify-center cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            Add Account
          </button>
          <button
            @click="openGeneralTransfer"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-bright/50 border border-[#464554]/40 text-[11px] font-bold text-primary transition-all duration-200 justify-center cursor-pointer"
          >
            <ArrowLeftRight class="w-3.5 h-3.5" />
            Transfer
          </button>
        </div>
      </div>

      <!-- Accounts Navigator List -->
      <div class="glass-panel rounded-xl overflow-hidden border border-[#464554]/20 flex-1 flex flex-col">
        <div class="px-4 py-3 border-b border-[#464554]/25 bg-surface-container-low/40">
          <span class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Select Bank or Account</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-3 max-h-[400px] lg:max-h-[calc(100vh-280px)]">
          <div
            v-for="bank in store.bankSummaries"
            :key="bank.id"
            class="rounded-lg overflow-hidden border border-[#464554]/10 bg-surface-container-lowest/30"
          >
            <!-- Bank Header (Selectable) -->
            <div
              @click="selectedBankId = bank.id; selectedAccountId = 'all'"
              class="flex items-center justify-between p-3 cursor-pointer hover:bg-surface-bright/10 transition-colors border-b border-[#464554]/10"
              :class="[selectedBankId === bank.id && selectedAccountId === 'all' ? 'bg-primary/10 text-primary border-l-2 border-primary font-bold' : '']"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: bank.color }"></span>
                <span class="text-xs font-bold text-on-surface">{{ bank.name }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full">
                  {{ bank.code }}
                </span>
                <span class="text-xs font-extrabold" :class="[bank.totalBalance < 0 ? 'text-error' : 'text-on-surface']">
                  {{ settingsStore.formatValue(bank.totalBalance) }}
                </span>
              </div>
            </div>

            <!-- Accounts List under Bank -->
            <div class="p-1 space-y-0.5">
              <div
                v-for="acc in bank.accounts"
                :key="acc.id"
                @click="selectedBankId = bank.id; selectedAccountId = acc.id"
                class="flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-surface-bright/20 transition-all"
                :class="[selectedBankId === bank.id && selectedAccountId === acc.id ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary' : '']"
              >
                <span class="text-xs font-semibold text-on-surface-variant ml-3">{{ acc.name }}</span>
                <span class="text-xs font-bold" :class="[acc.balance < 0 ? 'text-error' : 'text-on-surface']">
                  {{ settingsStore.formatValue(acc.balance) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Detail Area -->
    <div class="flex-1 flex flex-col gap-6">
      <!-- Selected Item KPI Card -->
      <div class="glass-panel p-card-padding rounded-xl border border-[#464554]/20 bg-surface-container-low/40 relative overflow-hidden">
        <!-- Accent Glow background -->
        <div 
          class="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none"
          :style="{ backgroundColor: getSelectedBankColor }"
        ></div>

        <div class="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getSelectedBankColor }"></span>
              <h1 class="text-md sm:text-lg font-extrabold text-on-surface leading-tight">
                {{ getSelectedName }}
              </h1>
            </div>
            <p class="text-xs text-on-surface-variant font-semibold mt-1">
              {{ getSelectedDetails }}
            </p>
          </div>
          <div class="flex flex-col items-start sm:items-end">
            <span class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Current Balance</span>
            <span class="text-xl sm:text-2xl font-black text-glow" :class="[getSelectedBalance < 0 ? 'text-error' : 'text-primary']">
              {{ settingsStore.formatValue(getSelectedBalance) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bank Flow Visualizer Tracker -->
      <AccountsBankFlowVisualizer @initiate-transfer="handleVisualizerTransfer" />

      <!-- Filtered Ledger List -->
      <AccountsLedgerTable
        :selectedBankId="selectedBankId"
        :selectedAccountId="selectedAccountId"
      />
    </div>

    <!-- Add Account Modal -->
    <AccountsAddAccountModal
      :show="showAddAccountModal"
      :selectedBankId="selectedBankId"
      @close="showAddAccountModal = false"
    />

    <!-- Transfer Funds Modal -->
    <AccountsTransferModal
      :show="showTransferModal"
      :initialFromAccountId="initialFromAccountId"
      :initialToAccountId="initialToAccountId"
      :sourceBankId="filterSourceBankId"
      :destBankId="filterDestBankId"
      @close="showTransferModal = false"
    />
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ref, computed } from 'vue'
import { Landmark, ArrowLeftRight, Plus } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const selectedBankId = ref('bank-bca')
const selectedAccountId = ref('all')

const showAddAccountModal = ref(false)
const showTransferModal = ref(false)

const initialFromAccountId = ref('')
const initialToAccountId = ref('')
const filterSourceBankId = ref('')
const filterDestBankId = ref('')

const openGeneralTransfer = () => {
  filterSourceBankId.value = ''
  filterDestBankId.value = ''
  initialFromAccountId.value = ''
  initialToAccountId.value = ''
  showTransferModal.value = true
}

const handleVisualizerTransfer = ({ sourceBankId, destBankId }) => {
  filterSourceBankId.value = sourceBankId
  filterDestBankId.value = destBankId
  if (sourceBankId === destBankId) {
    // Intra-bank transfer (between accounts under the same bank)
    const bankAccounts = store.accounts.filter(a => a.bankId === sourceBankId)
    if (bankAccounts.length >= 2) {
      initialFromAccountId.value = bankAccounts[0].id
      initialToAccountId.value = bankAccounts[1].id
      showTransferModal.value = true
    }
  } else {
    // Inter-bank transfer (between different banks)
    const sourceAcc = store.accounts.find(a => a.bankId === sourceBankId)
    const destAcc = store.accounts.find(a => a.bankId === destBankId)

    initialFromAccountId.value = sourceAcc ? sourceAcc.id : ''
    initialToAccountId.value = destAcc ? destAcc.id : ''

    showTransferModal.value = true
  }
}

const getSelectedBankColor = computed(() => {
  const bank = store.banks.find(b => b.id === selectedBankId.value)
  return bank ? bank.color : '#6366f1'
})

const getSelectedName = computed(() => {
  if (selectedAccountId.value === 'all') {
    const bank = store.banks.find(b => b.id === selectedBankId.value)
    return bank ? `${bank.name} Consolidated` : 'Select Account'
  } else {
    const acc = store.accounts.find(a => a.id === selectedAccountId.value)
    return acc ? acc.name : 'Select Account'
  }
})

const getSelectedDetails = computed(() => {
  if (selectedAccountId.value === 'all') {
    const bank = store.banks.find(b => b.id === selectedBankId.value)
    const accCount = bank ? store.accounts.filter(a => a.bankId === bank.id).length : 0
    return bank ? `${accCount} Accounts under ${bank.name}` : 'Consolidated Ledger View'
  } else {
    const acc = store.accounts.find(a => a.id === selectedAccountId.value)
    if (!acc) return 'Account Ledger View'
    const bank = store.banks.find(b => b.id === acc.bankId)
    const typeLabel = acc.type === 'checking' ? 'Checking Account' :
                      acc.type === 'savings' ? 'Savings Account' :
                      acc.type === 'credit_card' ? 'Credit Card / Liability' : 'Cash Ledger'
    return bank ? `${typeLabel} — ${bank.name}` : typeLabel
  }
})

const getSelectedBalance = computed(() => {
  if (selectedAccountId.value === 'all') {
    const bank = store.banks.find(b => b.id === selectedBankId.value)
    return bank ? store.accounts.filter(a => a.bankId === bank.id).reduce((sum, a) => sum + a.balance, 0) : 0
  } else {
    const acc = store.accounts.find(a => a.id === selectedAccountId.value)
    return acc ? acc.balance : 0
  }
})
</script>
