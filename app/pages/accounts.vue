<template>
  <div class="flex flex-col lg:flex-row gap-6 items-stretch">
    <!-- Left Column: Master List (Accounts by Bank) -->
    <div class="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
      <!-- Top Actions Card -->
      <div class="glass-panel p-4 rounded-xl border border-[#464554]/20 flex flex-col gap-2.5">
        <h2 class="text-sm font-extrabold text-on-surface flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Landmark class="w-4.5 h-4.5 text-primary" />
            Accounts & Ledgers
          </div>
          <button 
            @click="showValasHelpModal = true"
            class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-0.5 rounded hover:bg-surface-bright/20"
            title="Panduan Rekening Valas"
          >
            <HelpCircle class="w-4 h-4" />
          </button>
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
                @contextmenu.prevent="openContextMenu($event, acc)"
                @touchstart="onTouchStart($event, acc)"
                @touchend="onTouchEnd"
                @touchmove="onTouchEnd"
                class="group flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-surface-bright/20 transition-all relative select-none"
                :class="[
                  selectedBankId === bank.id && selectedAccountId === acc.id ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary' : '',
                  acc.active === false ? 'opacity-55' : ''
                ]"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span 
                    class="text-xs font-semibold text-on-surface-variant ml-3 truncate"
                    :class="{ 'line-through text-on-surface-variant/70': acc.active === false }"
                  >
                    {{ acc.name }}
                  </span>
                  <span 
                    v-if="acc.active === false" 
                    class="px-1 py-0.5 rounded text-[8px] font-bold bg-[#ff4444]/10 border border-[#ff4444]/25 text-error scale-90"
                  >
                    Nonaktif
                  </span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span class="text-xs font-bold" :class="[acc.balance < 0 ? 'text-error' : 'text-on-surface']">
                    {{ settingsStore.formatValue(acc.balance) }}
                  </span>
                  <!-- Clickable context menu icon -->
                  <button
                    @click.stop="openContextMenu($event, acc)"
                    class="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-surface-bright/20 text-on-surface-variant transition-opacity cursor-pointer"
                  >
                    <MoreVertical class="w-3.5 h-3.5" />
                  </button>
                </div>
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

    <!-- Valas Help Guide Modal -->
    <CommonModal :show="showValasHelpModal" @close="showValasHelpModal = false">
      <template #header>
        <div class="flex items-center gap-2">
          <HelpCircle class="w-5 h-5 text-primary" />
          <span>Panduan Rekening Valas (Mata Uang Asing)</span>
        </div>
      </template>
      <template #body>
        <div class="py-2 space-y-4 text-xs leading-relaxed text-on-surface-variant">
          <p>
            Dalam sistem <strong>Zero-Based Budgeting (ZBB)</strong>, seluruh dana anggaran Anda harus dihitung dalam satu mata uang dasar (misal Rupiah) agar alokasi seimbang sempurna. 
            Berikut adalah cara mengelola rekening mata uang asing (valas) agar tetap akurat:
          </p>

          <div class="space-y-3">
            <div class="p-3 bg-[#13131b]/60 border border-[#464554]/20 rounded-xl">
              <h4 class="font-extrabold text-on-surface text-[11px] uppercase tracking-wider mb-1 text-primary">1. Pencatatan Awal</h4>
              <p>
                Konversikan saldo mata uang asing Anda ke dalam Rupiah ekuivalen menggunakan kurs hari ini saat membuat rekening baru di aplikasi (contoh: saldo awal USD 1,000 dengan kurs Rp 16.300/USD dimasukkan sebagai saldo awal sebesar <strong>Rp 16.300.000</strong>).
              </p>
            </div>

            <div class="p-3 bg-[#13131b]/60 border border-[#464554]/20 rounded-xl">
              <h4 class="font-extrabold text-on-surface text-[11px] uppercase tracking-wider mb-1 text-primary">2. Transaksi Jual Beli / Konversi</h4>
              <p>
                Gunakan fitur <strong>Transfer Funds</strong> apabila Anda menukar uang antar rekening (misal dari rekening Rupiah BCA ke rekening Mandiri USD). 
                Masukkan nominal transfer sesuai dengan nilai ekuivalen Rupiah riil yang didebit atau dikredit.
              </p>
            </div>

            <div class="p-3 bg-[#13131b]/60 border border-[#464554]/20 rounded-xl">
              <h4 class="font-extrabold text-on-surface text-[11px] uppercase tracking-wider mb-1 text-primary">3. Penyesuaian Fluktuasi Kurs Bulanan</h4>
              <p>
                Karena nilai tukar mata uang asing selalu berubah setiap harinya, saldo Rupiah di aplikasi dapat berbeda dengan saldo valas asli Anda.
              </p>
              <ul class="list-disc pl-4 mt-1 space-y-1">
                <li><strong>Jika Rupiah melemah (Valas menguat)</strong>: Catat transaksi <em>Inflow (Income)</em> dengan kategori khusus (misal "Selisih Kurs") untuk menambah saldo rekening Anda di aplikasi agar sama dengan nilai Rupiah terkininya.</li>
                <li><strong>Jika Rupiah menguat (Valas melemah)</strong>: Catat transaksi <em>Outflow (Expense)</em> dengan kategori khusus "Selisih Kurs" untuk mengurangi saldo rekening Anda di aplikasi.</li>
              </ul>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          @click="showValasHelpModal = false"
          class="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-on-primary hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          Mengerti
        </button>
      </template>
    </CommonModal>

    <!-- Edit Starting Balance Modal -->
    <CommonModal :show="showEditStartingBalanceModal" @close="showEditStartingBalanceModal = false">
      <template #header>
        <div class="flex flex-col">
          <span>Edit Starting Balance</span>
          <span class="text-[10px] font-semibold text-on-surface-variant normal-case mt-0.5">Edit the base money (starting balance) for this account</span>
        </div>
      </template>
      <template #body>
        <div class="flex flex-col gap-4 py-2">
          <p class="text-xs text-on-surface-variant">
            Ubah saldo awal untuk akun <strong>{{ editingAccount?.name }}</strong>. 
            Saldo akhir akan dihitung ulang secara otomatis berdasarkan transaksi yang ada.
          </p>
          <div class="flex flex-col gap-1.5">
            <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Saldo Awal</label>
            <div class="glass-panel bg-[#0e0e15]/40 border border-[#464554]/20 rounded-xl p-4 flex flex-col items-center gap-1">
              <div class="relative flex items-center justify-center w-full max-w-[240px]">
                <span class="text-lg font-black text-on-surface-variant mr-1.5 select-none">Rp</span>
                <input
                  type="text"
                  :value="editStartingBalanceDisplay"
                  @input="handleEditStartingBalanceInput"
                  placeholder="0"
                  class="bg-transparent border-none text-2xl font-black text-center text-primary focus:ring-0 focus:outline-none w-full placeholder-primary/20 tracking-tight"
                  id="edit-starting-balance-input"
                />
                <span v-if="settingsStore.kMode" class="text-lg font-black text-on-surface-variant ml-1.5 select-none">K</span>
              </div>
              <div class="text-[10px] font-bold text-on-surface-variant/80 border-t border-[#464554]/15 pt-1.5 w-full text-center select-none flex justify-between items-center px-1 mt-1.5">
                <button 
                  type="button" 
                  @click="toggleEditBalanceSign"
                  class="px-2 py-0.5 rounded bg-[#13131b] hover:bg-surface-bright/20 border border-[#464554]/30 text-[8px] font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  +/- Negative
                </button>
                <span>
                  Total: <span class="font-black text-secondary">{{ editActualBalanceFormatted }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          @click="showEditStartingBalanceModal = false"
          :disabled="isSavingStartingBalance"
          class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          @click="saveStartingBalance"
          :disabled="isSavingStartingBalance"
          class="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-on-primary hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSavingStartingBalance ? 'Saving...' : 'Save' }}
        </button>
      </template>
    </CommonModal>

    <!-- Context Menu Overlay -->
    <div
      v-if="contextMenu.show"
      class="fixed z-[9999] bg-[#14141e]/95 backdrop-blur-md border border-[#464554]/40 rounded-xl shadow-2xl py-1.5 w-48 text-left animate-fade-in"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <div class="px-3 py-1.5 border-b border-[#464554]/25 mb-1">
        <p class="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider truncate">
          {{ contextMenu.account?.name }}
        </p>
      </div>

      <!-- Edit starting balance -->
      <button
        @click="triggerEditStartingBalance"
        class="w-full px-3 py-2 text-left hover:bg-surface-bright/10 text-xs font-bold text-on-surface flex items-center gap-2 transition-all cursor-pointer"
      >
        <Edit2 class="w-3.5 h-3.5 text-primary" />
        Edit Starting Balance
      </button>

      <!-- Toggle Active status -->
      <button
        @click="toggleAccountActive"
        class="w-full px-3 py-2 text-left hover:bg-surface-bright/10 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        :class="[contextMenu.account?.active !== false ? 'text-error' : 'text-secondary']"
      >
        <component :is="contextMenu.account?.active !== false ? ToggleLeft : ToggleRight" class="w-3.5 h-3.5" />
        {{ contextMenu.account?.active !== false ? 'Deactivate Account' : 'Activate Account' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Landmark, ArrowLeftRight, Plus, MoreVertical, Edit2, ToggleLeft, ToggleRight, HelpCircle } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const selectedBankId = ref('bank-bca')
const selectedAccountId = ref('all')

const showAddAccountModal = ref(false)
const showTransferModal = ref(false)
const showValasHelpModal = ref(false)

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

// ====================================================
// Context Menu & Account Edit/Deactivate Handlers
// ====================================================
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  account: null
})

const openContextMenu = (event, account) => {
  event.preventDefault()
  event.stopPropagation()
  
  let x = event.clientX
  let y = event.clientY
  
  if (!x || !y) {
    const rect = event.currentTarget.getBoundingClientRect()
    x = rect.left + rect.width / 2
    y = rect.bottom
  }
  
  // Guard window boundaries
  const menuWidth = 192
  const menuHeight = 110
  if (x + menuWidth > window.innerWidth) {
    x -= menuWidth
  }
  if (y + menuHeight > window.innerHeight) {
    y -= menuHeight
  }
  
  contextMenu.value = {
    show: true,
    x,
    y,
    account
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

// Mobile long press (hold) handlers
let touchTimer = null
const onTouchStart = (event, account) => {
  if (touchTimer) clearTimeout(touchTimer)
  touchTimer = setTimeout(() => {
    const touch = event.touches[0]
    openContextMenu({
      preventDefault: () => {},
      stopPropagation: () => {},
      clientX: touch.clientX,
      clientY: touch.clientY
    }, account)
  }, 600)
}

const onTouchEnd = () => {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

// Edit Starting Balance Modal Handlers
const showEditStartingBalanceModal = ref(false)
const editingAccount = ref(null)
const editStartingBalanceRaw = ref(0)
const editStartingBalanceDisplay = ref('0')
const isSavingStartingBalance = ref(false)

const triggerEditStartingBalance = () => {
  if (!contextMenu.value.account) return
  isSavingStartingBalance.value = false
  editingAccount.value = { ...contextMenu.value.account }
  
  const rawBal = editingAccount.value.startingBalance
  const unitBalance = settingsStore.kMode ? Math.round(rawBal / 1000) : rawBal
  
  editStartingBalanceRaw.value = unitBalance
  editStartingBalanceDisplay.value = unitBalance.toLocaleString('id-ID')
  
  showEditStartingBalanceModal.value = true
  closeContextMenu()
}

const handleEditStartingBalanceInput = (event) => {
  const inputVal = event.target.value
  const isNegative = inputVal.startsWith('-')
  const clean = inputVal.replace(/\D/g, '')
  if (!clean) {
    editStartingBalanceDisplay.value = isNegative ? '-' : ''
    editStartingBalanceRaw.value = 0
    return
  }
  const num = parseInt(clean, 10)
  editStartingBalanceRaw.value = isNegative ? -num : num
  editStartingBalanceDisplay.value = (isNegative ? '-' : '') + num.toLocaleString('id-ID')
}

const toggleEditBalanceSign = () => {
  editStartingBalanceRaw.value = -editStartingBalanceRaw.value
  const isNegative = editStartingBalanceRaw.value < 0
  const absVal = Math.abs(editStartingBalanceRaw.value)
  editStartingBalanceDisplay.value = (isNegative ? '-' : '') + absVal.toLocaleString('id-ID')
}

const editActualBalanceFormatted = computed(() => {
  const rawBal = parseFloat(editStartingBalanceRaw.value) || 0
  const absoluteBalance = settingsStore.kMode ? rawBal * 1000 : rawBal
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(absoluteBalance)
})

const saveStartingBalance = async () => {
  if (!editingAccount.value || isSavingStartingBalance.value) return
  
  isSavingStartingBalance.value = true
  try {
    const rawBal = parseFloat(editStartingBalanceRaw.value) || 0
    const absoluteBalance = settingsStore.kMode ? rawBal * 1000 : rawBal
    
    const updatedAccount = {
      ...editingAccount.value,
      startingBalance: absoluteBalance
    }
    
    await store.updateAccount(updatedAccount)
    showEditStartingBalanceModal.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isSavingStartingBalance.value = false
  }
}

// Toggle Account Active/Inactive status
const toggleAccountActive = async () => {
  const account = contextMenu.value.account
  if (!account) return
  
  const updatedAccount = {
    ...account,
    active: !(account.active !== false)
  }
  
  await store.updateAccount(updatedAccount)
  closeContextMenu()
}

// Global click event to close context menu when clicking outside
onMounted(() => {
  window.addEventListener('click', closeContextMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeContextMenu)
})
</script>
