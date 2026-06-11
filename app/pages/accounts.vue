<template>
  <div>
    <!-- Top Action Row -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold text-on-surface flex items-center gap-2">
        <Landmark class="w-5 h-5 text-primary" />
        Accounts & Ledgers
      </h2>
      <div class="flex items-center gap-3">
        <button
          @click="openTransferModal"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright/50 border border-[#464554]/40 text-xs font-bold text-primary transition-all duration-200"
        >
          <ArrowLeftRight class="w-4 h-4" />
          Transfer Funds
        </button>
        <button
          @click="openAddAccountModal"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all duration-200"
        >
          <Plus class="w-4 h-4" />
          Add Account
        </button>
      </div>
    </div>

    <!-- Accounts Grouped by Bank -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
      <div
        v-for="bank in bankSummaries"
        :key="bank.id"
        @click="selectedBankId = bank.id; selectedAccountId = 'all'"
        class="glass-panel rounded-xl p-card-padding flex flex-col cursor-pointer transition-all duration-200 relative overflow-hidden group border"
        :class="[selectedBankId === bank.id ? 'border-primary shadow-lg scale-[1.02]' : 'border-transparent hover:border-[#464554]/40']"
      >
        <!-- Top bar with brand indicator -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: bank.color }"></span>
            <span class="text-xs font-extrabold text-on-surface">{{ bank.name }}</span>
          </div>
          <span class="text-[9px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {{ bank.code }}
          </span>
        </div>

        <!-- Accounts lists -->
        <div class="flex-1 space-y-2 mt-2">
          <div
            v-for="acc in bank.accounts"
            :key="acc.id"
            @click.stop="selectedBankId = bank.id; selectedAccountId = acc.id"
            class="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface-bright/20"
            :class="{ 'bg-primary/10 text-primary border-l-2 border-primary': selectedAccountId === acc.id }"
          >
            <span class="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface">{{ acc.name }}</span>
            <span class="text-xs font-bold" :class="[acc.balance < 0 ? 'text-error' : 'text-on-surface']">
              {{ store.formatValue(acc.balance) }}
            </span>
          </div>
        </div>

        <!-- Net balance of this bank -->
        <div class="border-t border-[#464554]/20 mt-4 pt-3 flex items-center justify-between">
          <span class="text-[10px] text-on-surface-variant font-bold uppercase">Net Assets</span>
          <span class="text-sm font-extrabold" :class="[bank.totalBalance < 0 ? 'text-error' : 'text-glow text-on-surface']">
            {{ store.formatValue(bank.totalBalance) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bank Flow Visual Tracker -->
    <div class="glass-panel rounded-xl p-card-padding mb-8 flex flex-col border border-[#464554]/20">
      <h3 class="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
        <ArrowLeftRight class="w-4 h-4 text-primary" />
        Bank Flow Visualizer (Money Transfers)
      </h3>

      <div class="relative w-full h-48 bg-[#0b0f15]/40 rounded-xl overflow-hidden border border-[#464554]/20 flex items-center justify-center">
        <!-- SVG Canvas for Drawing Connections -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <!-- Glow Filters for arrows -->
            <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <!-- Arrow markers -->
            <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>
          </defs>

          <!-- Draw flow connections -->
          <g v-for="flow in activeFlows" :key="flow.id">
            <!-- Curve connection -->
            <path
              :d="getSvgCurve(flow.fromX, flow.fromY, flow.toX, flow.toY)"
              fill="none"
              stroke="#6366f1"
              stroke-width="2"
              stroke-dasharray="6, 6"
              class="animate-dash"
              marker-end="url(#arrow)"
              filter="url(#glow-indigo)"
            />
            <!-- Flow amount label backdrop -->
            <rect
              :x="((flow.fromX + flow.toX) / 2) - 35"
              :y="((flow.fromY + flow.toY) / 2) - 10"
              width="70"
              height="20"
              rx="4"
              fill="#13131b"
              stroke="#464554"
              stroke-width="1"
            />
            <!-- Flow amount text -->
            <text
              :x="(flow.fromX + flow.toX) / 2"
              :y="((flow.fromY + flow.toY) / 2) + 4"
              fill="#e4e1ed"
              font-size="9"
              font-weight="bold"
              text-anchor="middle"
            >
              {{ store.formatValueRaw(flow.amount) }}
            </text>
          </g>
        </svg>

        <!-- Visual Bank Nodes -->
        <div class="relative w-full h-full flex justify-around items-center px-8 z-20">
          <div
            v-for="node in bankNodes"
            :key="node.id"
            :id="`node-${node.id}`"
            class="flex flex-col items-center justify-center w-24 h-24 rounded-full border bg-[#1f1f27]/90 shadow-xl border-[#464554]/50 relative"
            :style="{ borderColor: node.color }"
          >
            <!-- Mini icon or abbreviation -->
            <Landmark class="w-6 h-6 mb-1" :style="{ color: node.color }" />
            <span class="text-xs font-extrabold text-on-surface">{{ node.code }}</span>
            <span class="text-[9px] font-bold text-on-surface-variant mt-0.5">{{ store.formatValueRaw(node.balance) }}</span>
          </div>
        </div>
      </div>
      <p class="text-[10px] text-on-surface-variant italic text-center mt-2">
        *Shows cash flow directions based on transfers made between your banks this month. Click "Transfer Funds" to move money.
      </p>
    </div>

    <!-- Filtered Ledger List -->
    <div class="glass-panel rounded-xl overflow-hidden border border-[#464554]/30">
      <div class="px-5 py-4 border-b border-[#464554]/25 bg-surface-container-low/40 flex justify-between items-center">
        <h3 class="text-sm font-bold text-on-surface flex items-center gap-2">
          <Receipt class="w-4 h-4 text-primary" />
          {{ ledgerTitle }}
        </h3>
        <span class="text-xs font-bold text-on-surface-variant">{{ filteredLedger.length }} Transactions</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[#464554]/25">
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Date</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Description</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Account</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Category</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in filteredLedger"
              :key="tx.id"
              class="border-b border-[#464554]/10 last:border-none hover:bg-surface-bright/10 transition-colors"
            >
              <td class="px-5 py-3.5 text-xs font-semibold text-on-surface-variant">
                {{ formatDate(tx.date) }}
              </td>
              <td class="px-5 py-3.5 text-xs font-bold text-on-surface">
                {{ tx.description }}
              </td>
              <td class="px-5 py-3.5 text-xs font-semibold text-on-surface-variant">
                {{ getAccountName(tx.accountId) }}
              </td>
              <td class="px-5 py-3.5 text-xs font-semibold text-on-surface-variant">
                {{ getCategoryName(tx.categoryId) }}
              </td>
              <td class="px-5 py-3.5 text-right font-extrabold text-xs"
                :class="[tx.amount > 0 ? 'text-secondary' : 'text-error']"
              >
                {{ tx.amount > 0 ? '+' : '' }}{{ store.formatValue(tx.amount) }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredLedger.length === 0">
              <td colspan="5" class="px-5 py-12 text-center text-xs font-semibold text-on-surface-variant">
                No ledger transactions found for this selection.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Account Modal -->
    <CommonModal :show="showAddAccountModal" @close="showAddAccountModal = false">
      <template #header>Add New Account</template>
      <template #body>
        <form class="space-y-4 pt-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Account Name</label>
            <input
              type="text"
              v-model="newAccount.name"
              placeholder="e.g. Daily checking"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Account Type</label>
            <select
              v-model="newAccount.type"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            >
              <option value="checking">Checking / Current Account</option>
              <option value="savings">Savings Vault</option>
              <option value="credit_card">Credit Card (Liability)</option>
              <option value="cash">Pocket Cash</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Bank Provider</label>
            <select
              v-model="newAccount.bankId"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            >
              <option v-for="b in store.banks" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Starting Balance</label>
            <div class="relative flex items-center">
              <span class="absolute left-3 text-xs font-bold text-on-surface-variant">Rp</span>
              <input
                type="number"
                v-model="newAccount.startingBalance"
                placeholder="0"
                class="bg-[#13131b] border border-[#464554]/40 rounded-lg pl-9 pr-8 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
              />
              <span v-if="store.kMode" class="absolute right-3 text-xs font-bold text-on-surface-variant">K</span>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button
          @click="showAddAccountModal = false"
          class="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
        >
          Cancel
        </button>
        <button
          @click="saveNewAccount"
          class="px-4 py-2 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
        >
          Create Account
        </button>
      </template>
    </CommonModal>

    <!-- Transfer Funds Modal -->
    <CommonModal :show="showTransferModal" @close="showTransferModal = false">
      <template #header>Transfer Funds</template>
      <template #body>
        <form class="space-y-4 pt-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Source Account</label>
            <select
              v-model="transferForm.fromAccountId"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            >
              <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }} ({{ store.formatValueRaw(acc.balance) }})
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Destination Account</label>
            <select
              v-model="transferForm.toAccountId"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            >
              <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }} ({{ store.formatValueRaw(acc.balance) }})
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Amount</label>
            <div class="relative flex items-center">
              <span class="absolute left-3 text-xs font-bold text-on-surface-variant">Rp</span>
              <input
                type="number"
                v-model="transferForm.amount"
                placeholder="0"
                class="bg-[#13131b] border border-[#464554]/40 rounded-lg pl-9 pr-8 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
              />
              <span v-if="store.kMode" class="absolute right-3 text-xs font-bold text-on-surface-variant">K</span>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Memo / Note</label>
            <input
              type="text"
              v-model="transferForm.memo"
              placeholder="e.g. BCA to Jago Savings Transfer"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <button
          @click="showTransferModal = false"
          class="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
        >
          Cancel
        </button>
        <button
          @click="executeTransfer"
          class="px-4 py-2 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
        >
          Confirm Transfer
        </button>
      </template>
    </CommonModal>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { ref, computed } from 'vue'
import {
  Landmark,
  ArrowLeftRight,
  Plus,
  Receipt,
  CreditCard
} from '@lucide/vue'

const store = useBudgetStore()

const selectedBankId = ref('bank-bca')
const selectedAccountId = ref('all') // 'all' or specific accountId

// Modals
const showAddAccountModal = ref(false)
const showTransferModal = ref(false)

const newAccount = ref({
  name: '',
  type: 'checking',
  bankId: 'bank-bca',
  startingBalance: 0
})

const transferForm = ref({
  fromAccountId: '',
  toAccountId: '',
  amount: 0,
  memo: ''
})

// Bank summarizes
const bankSummaries = computed(() => {
  return store.banks.map(bank => {
    const accs = store.accounts.filter(a => a.bankId === bank.id)
    const net = accs.reduce((sum, a) => sum + a.balance, 0)
    return {
      ...bank,
      accounts: accs,
      totalBalance: net
    }
  })
})

// Visual Bank nodes coordinates inside the SVG Canvas (relative percentages)
const bankNodes = computed(() => {
  // We represent 4 nodes: BCA, Jago, Mandiri, Cash
  // Position them: BCA (left), Jago (center), Mandiri (right), Cash (rightmost/center bottom)
  // Let's hardcode positions so they match the HTML layout:
  // Node coordinates inside the 100% SVG box:
  // Let's map coordinates: BCA (15% x, 50% y), Jago (40% x, 50% y), Mandiri (65% x, 50% y), Cash (85% x, 50% y)
  const coords = {
    'bank-bca': { x: 10, y: 50 },
    'bank-jago': { x: 35, y: 50 },
    'bank-mandiri': { x: 62, y: 50 },
    'bank-cash': { x: 88, y: 50 }
  }

  return store.banks.map(bank => {
    const balance = store.accounts
      .filter(a => a.bankId === bank.id)
      .reduce((sum, a) => sum + a.balance, 0)
    
    return {
      ...bank,
      balance,
      x: coords[bank.id]?.x || 0,
      y: coords[bank.id]?.y || 0
    }
  })
})

// Compute active flows between banks based on transfer transactions this month
const activeFlows = computed(() => {
  const transfers = store.periodTransactions.filter(t => t.transferId && t.amount < 0) // Outflows of transfers
  
  return transfers.map(tx => {
    // Find matching credit transaction
    const matchTx = store.periodTransactions.find(t => t.transferId === tx.transferId && t.amount > 0)
    if (!matchTx) return null

    // Find banks
    const sourceAcc = store.accounts.find(a => a.id === tx.accountId)
    const destAcc = store.accounts.find(a => a.id === matchTx.accountId)
    if (!sourceAcc || !destAcc) return null

    if (sourceAcc.bankId === destAcc.bankId) return null // Skip intra-bank transfers

    // Get nodes
    const sourceNode = bankNodes.value.find(n => n.id === sourceAcc.bankId)
    const destNode = bankNodes.value.find(n => n.id === destAcc.bankId)
    if (!sourceNode || !destNode) return null

    return {
      id: tx.transferId,
      fromX: `${sourceNode.x}%`,
      fromY: `${sourceNode.y}%`,
      toX: `${destNode.x}%`,
      toY: `${destNode.y}%`,
      amount: Math.abs(tx.amount)
    }
  }).filter(Boolean)
})

// Custom SVG path drawing curve helper
const getSvgCurve = (fromX, fromY, toX, toY) => {
  // Simple cubic bezier curve:
  // Convert percentage strings back to floats for math
  const fx = parseFloat(fromX)
  const fy = parseFloat(fromY)
  const tx = parseFloat(toX)
  const ty = parseFloat(toY)

  // Control points: shift y slightly to draw a curved loop
  const midX = (fx + tx) / 2
  const midY = ((fy + ty) / 2) - 15 // bend curve upwards

  return `M ${fx}% ${fy}% Q ${midX}% ${midY}% ${tx}% ${ty}%`
}

// Filtered Ledger Title
const ledgerTitle = computed(() => {
  const bank = store.banks.find(b => b.id === selectedBankId.value)
  const bankName = bank ? bank.name : 'Bank'
  
  if (selectedAccountId.value === 'all') {
    return `${bankName} Consolidated Ledger`
  } else {
    const acc = store.accounts.find(a => a.id === selectedAccountId.value)
    return `${acc ? acc.name : 'Account'} Ledger`
  }
})

// Filtered Ledger Transactions list
const filteredLedger = computed(() => {
  return store.transactions.filter(t => {
    const acc = store.accounts.find(a => a.id === t.accountId)
    if (!acc) return false
    
    const matchesBank = acc.bankId === selectedBankId.value
    const matchesAccount = selectedAccountId.value === 'all' || t.accountId === selectedAccountId.value

    return matchesBank && matchesAccount
  }).sort((a, b) => b.date.localeCompare(a.date))
})

const getAccountName = (accountId) => {
  return store.accounts.find(a => a.id === accountId)?.name || 'Account'
}

const getCategoryName = (categoryId) => {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return 'Transfer / Adjustment'
  return cat.name
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Add Account
const openAddAccountModal = () => {
  newAccount.value = {
    name: '',
    type: 'checking',
    bankId: selectedBankId.value,
    startingBalance: 0
  }
  showAddAccountModal.value = true
}

const saveNewAccount = () => {
  if (!newAccount.value.name.trim()) {
    alert('Please enter an account name.')
    return
  }

  const rawBal = parseFloat(newAccount.value.startingBalance) || 0
  const absoluteBalance = store.kMode ? rawBal * 1000 : rawBal

  const id = 'acc-' + Math.random().toString(36).substring(2, 9)
  store.accounts.push({
    id,
    name: newAccount.value.name.trim(),
    type: newAccount.value.type,
    bankId: newAccount.value.bankId,
    startingBalance: absoluteBalance,
    balance: absoluteBalance
  })

  store.saveState()
  showAddAccountModal.value = false
}

// Transfers
const openTransferModal = () => {
  transferForm.value = {
    fromAccountId: store.accounts[0]?.id || '',
    toAccountId: store.accounts[1]?.id || '',
    amount: 0,
    memo: ''
  }
  showTransferModal.value = true
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
  const absoluteAmount = store.kMode ? rawAmt * 1000 : rawAmt

  store.transferFunds(
    transferForm.value.fromAccountId,
    transferForm.value.toAccountId,
    absoluteAmount,
    transferForm.value.memo || 'Transfer Funds'
  )

  showTransferModal.value = false
}
</script>

<style scoped>
/* SVG Flow line animation styling */
@keyframes dash {
  to {
    stroke-dashoffset: -40;
  }
}
.animate-dash {
  animation: dash 3s linear infinite;
}
</style>
