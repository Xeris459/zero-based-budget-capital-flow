<template>
  <div>
    <!-- Click-Outside Overlay to close filter dropdowns -->
    <div v-if="accountDropdownOpen || categoryDropdownOpen" @click="closeDropdowns" class="fixed inset-0 z-20 bg-transparent" />
    <!-- Top Filter Row -->
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 w-full xl:w-auto">
        <!-- Search -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search transactions..."
            class="bg-surface-container/60 border border-[#464554]/40 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
          />
        </div>

        <!-- Account Filter -->
        <div class="relative w-full sm:w-48">
          <button
            type="button"
            @click="toggleAccountDropdown"
            class="bg-[#13131b]/95 border border-[#464554]/40 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-on-surface hover:bg-surface-bright/20 focus:border-primary focus:outline-none w-full text-left flex items-center justify-between cursor-pointer"
          >
            <span class="truncate">{{ getAccountFilterLabel }}</span>
            <ChevronDown class="w-3.5 h-3.5 text-on-surface-variant transition-transform" :class="{ 'rotate-180 text-primary': accountDropdownOpen }" />
          </button>
          
          <div v-if="accountDropdownOpen" class="absolute left-0 mt-1.5 w-full bg-[#171721]/95 border border-[#464554]/50 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-30 max-h-56 overflow-y-auto divide-y divide-[#464554]/25 backdrop-blur-md">
            <div
              @click="selectAccountFilter('all')"
              class="flex items-center justify-between px-3.5 py-2 hover:bg-primary/10 cursor-pointer transition-colors text-xs font-bold"
              :class="[accountFilter === 'all' ? 'text-primary bg-primary/5' : 'text-on-surface-variant']"
            >
              <span>All Accounts</span>
              <Check v-if="accountFilter === 'all'" class="w-3.5 h-3.5 text-primary" />
            </div>
            <div
              v-for="acc in store.accounts"
              :key="acc.id"
              @click="selectAccountFilter(acc.id)"
              class="flex items-center justify-between px-3.5 py-2 hover:bg-primary/10 cursor-pointer transition-colors text-xs font-bold"
              :class="[accountFilter === acc.id ? 'text-primary bg-primary/5' : 'text-on-surface-variant']"
            >
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getAccountColor(acc.id) }"></span>
                <span>{{ acc.name }}</span>
              </div>
              <Check v-if="accountFilter === acc.id" class="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </div>

        <!-- Category Group Filter -->
        <div class="relative w-full sm:w-48">
          <button
            type="button"
            @click="toggleCategoryDropdown"
            class="bg-[#13131b]/95 border border-[#464554]/40 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-on-surface hover:bg-surface-bright/20 focus:border-primary focus:outline-none w-full text-left flex items-center justify-between cursor-pointer"
          >
            <span class="truncate">{{ getCategoryFilterLabel }}</span>
            <ChevronDown class="w-3.5 h-3.5 text-on-surface-variant transition-transform" :class="{ 'rotate-180 text-primary': categoryDropdownOpen }" />
          </button>
          
          <div v-if="categoryDropdownOpen" class="absolute left-0 mt-1.5 w-full bg-[#171721]/95 border border-[#464554]/50 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-30 max-h-56 overflow-y-auto divide-y divide-[#464554]/25 backdrop-blur-md">
            <div
              @click="selectCategoryFilter('all')"
              class="flex items-center justify-between px-3.5 py-2 hover:bg-primary/10 cursor-pointer transition-colors text-xs font-bold"
              :class="[categoryFilter === 'all' ? 'text-primary bg-primary/5' : 'text-on-surface-variant']"
            >
              <span>All Categories</span>
              <Check v-if="categoryFilter === 'all'" class="w-3.5 h-3.5 text-primary" />
            </div>
            <div
              v-for="cat in store.categories"
              :key="cat.id"
              @click="selectCategoryFilter(cat.id)"
              class="flex items-center justify-between px-3.5 py-2 hover:bg-primary/10 cursor-pointer transition-colors text-xs font-bold"
              :class="[categoryFilter === cat.id ? 'text-primary bg-primary/5' : 'text-on-surface-variant']"
            >
              <span>{{ cat.name }}</span>
              <Check v-if="categoryFilter === cat.id" class="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <!-- Add Action Button -->
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all duration-200 w-full sm:w-auto justify-center"
      >
        <Plus class="w-4 h-4" />
        Add Transaction
      </button>
    </div>

    <!-- Table Container -->
    <div class="glass-panel rounded-xl overflow-hidden border border-[#464554]/30">
      <!-- Desktop View Table -->
      <div class="overflow-x-auto hidden md:block">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[#464554]/25 bg-surface-container-low/40">
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Date</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Description</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Bank & Account</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Category</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3 text-right">Amount</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3 text-right">Balance</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3 text-center w-40">Shift Next Month</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="border-b border-[#464554]/10 last:border-none hover:bg-surface-bright/10 transition-colors"
            >
              <!-- Date -->
              <td class="px-5 py-3.5 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                {{ formatDate(tx.date) }}
              </td>

              <!-- Description -->
              <td class="px-5 py-3.5 text-xs font-bold text-on-surface">
                {{ tx.description }}
              </td>

              <!-- Account -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  :style="{ backgroundColor: `${getAccountColor(tx.accountId)}20`, color: getAccountColor(tx.accountId) }"
                >
                  <Landmark class="w-3 h-3" />
                  {{ getAccountName(tx.accountId) }}
                </span>
              </td>

              <!-- Category -->
              <td class="px-5 py-3.5 text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                {{ getCategoryName(tx.categoryId) }}
              </td>

              <!-- Amount -->
              <td class="px-5 py-3.5 text-right font-extrabold text-xs whitespace-nowrap"
                :class="[tx.amount > 0 ? 'text-secondary' : 'text-error']"
              >
                {{ tx.amount > 0 ? '+' : '' }}{{ settingsStore.formatValue(tx.amount) }}
              </td>

              <!-- Balance -->
              <td class="px-5 py-3.5 text-right font-bold text-xs whitespace-nowrap text-on-surface-variant">
                {{ settingsStore.formatValue(transactionBalances.get(tx.id) || 0) }}
              </td>

              <!-- Late Income Shift Toggle -->
              <td class="px-5 py-3.5 text-center">
                <div class="flex justify-center" v-if="tx.amount > 0">
                  <button
                    @click="toggleShift(tx)"
                    class="w-10 h-5 rounded-full relative transition-colors focus:outline-none"
                    :class="[tx.shiftToNextMonth ? 'bg-secondary' : 'bg-surface-variant']"
                  >
                    <span
                      class="absolute top-0.5 w-4 h-4 bg-background rounded-full transition-all duration-200"
                      :class="[tx.shiftToNextMonth ? 'right-0.5' : 'left-0.5']"
                    ></span>
                  </button>
                </div>
                <span v-else class="text-[10px] text-on-surface-variant/40 font-semibold">—</span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openEditModal(tx)"
                    class="text-on-surface-variant hover:text-primary transition-colors p-1"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteTx(tx.id)"
                    class="text-on-surface-variant hover:text-error transition-colors p-1"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="8" class="px-5 py-12 text-center text-xs font-semibold text-on-surface-variant">
                <div class="flex flex-col items-center justify-center gap-2">
                  <Inbox class="w-8 h-8 text-on-surface-variant/40" />
                  No transactions found for this period. Click "+ Add Transaction" to create one.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card List View -->
      <div class="block md:hidden space-y-3 p-4 bg-surface-container-lowest/30">
        <div
          v-for="tx in filteredTransactions"
          :key="tx.id"
          class="glass-panel p-3.5 rounded-lg border border-[#464554]/20 flex flex-col gap-2.5 relative overflow-hidden"
        >
          <!-- Top bar: Date and Action Buttons -->
          <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-bold border-b border-[#464554]/10 pb-1.5">
            <span>{{ formatDate(tx.date) }}</span>
            <div class="flex items-center gap-2">
              <button
                @click="openEditModal(tx)"
                class="text-on-surface-variant hover:text-primary transition-colors p-1"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="deleteTx(tx.id)"
                class="text-on-surface-variant hover:text-error transition-colors p-1"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Middle section: Description and Account Badge -->
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-bold text-on-surface leading-tight">{{ tx.description }}</span>
              <span class="text-[10px] text-on-surface-variant font-medium">{{ getCategoryName(tx.categoryId) }}</span>
            </div>
            <span class="text-xs font-extrabold" :class="[tx.amount > 0 ? 'text-secondary' : 'text-error']">
              {{ tx.amount > 0 ? '+' : '' }}{{ settingsStore.formatValue(tx.amount) }}
            </span>
          </div>

          <!-- Bottom Row: Bank & Account Badge and Next Month Shift -->
          <div class="flex items-center justify-between mt-0.5 pt-1.5 border-t border-[#464554]/10">
            <div class="flex flex-col gap-1">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold"
                :style="{ backgroundColor: `${getAccountColor(tx.accountId)}20`, color: getAccountColor(tx.accountId) }"
              >
                <Landmark class="w-2.5 h-2.5" />
                {{ getAccountName(tx.accountId) }}
              </span>
              <span class="text-[9px] text-on-surface-variant/70 font-semibold ml-1">
                Bal: {{ settingsStore.formatValue(transactionBalances.get(tx.id) || 0) }}
              </span>
            </div>

            <!-- Shift Toggle (Only for income/amount > 0) -->
            <div class="flex items-center gap-1.5" v-if="tx.amount > 0">
              <span class="text-[9px] text-on-surface-variant font-bold">Shift Month:</span>
              <button
                @click="toggleShift(tx)"
                class="w-7 h-4 rounded-full relative transition-colors focus:outline-none"
                :class="[tx.shiftToNextMonth ? 'bg-secondary' : 'bg-surface-variant']"
              >
                <span
                  class="absolute top-0.5 w-3 h-3 bg-background rounded-full transition-all duration-200"
                  :class="[tx.shiftToNextMonth ? 'right-0.5' : 'left-0.5']"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State for Mobile -->
        <div v-if="filteredTransactions.length === 0" class="py-12 text-center text-xs font-semibold text-on-surface-variant">
          <div class="flex flex-col items-center justify-center gap-2">
            <Inbox class="w-8 h-8 text-on-surface-variant/40" />
            No transactions found for this period. Click "+ Add Transaction" to create one.
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Modal Component -->
    <TransactionsTransactionModal
      :show="showModal"
      :transaction="selectedTransaction"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ref, computed } from 'vue'
import {
  Search,
  ChevronDown,
  Plus,
  Landmark,
  Edit2,
  Trash2,
  Inbox,
  Check
} from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const searchQuery = ref('')
const accountFilter = ref('all')
const categoryFilter = ref('all')

const accountDropdownOpen = ref(false)
const categoryDropdownOpen = ref(false)

const toggleAccountDropdown = () => {
  accountDropdownOpen.value = !accountDropdownOpen.value
  categoryDropdownOpen.value = false
}

const toggleCategoryDropdown = () => {
  categoryDropdownOpen.value = !categoryDropdownOpen.value
  accountDropdownOpen.value = false
}

const selectAccountFilter = (id) => {
  accountFilter.value = id
  accountDropdownOpen.value = false
}

const selectCategoryFilter = (id) => {
  categoryFilter.value = id
  categoryDropdownOpen.value = false
}

const closeDropdowns = () => {
  accountDropdownOpen.value = false
  categoryDropdownOpen.value = false
}

const getAccountFilterLabel = computed(() => {
  if (accountFilter.value === 'all') return 'All Accounts'
  const acc = store.accounts.find(a => a.id === accountFilter.value)
  return acc ? acc.name : 'All Accounts'
})

const getCategoryFilterLabel = computed(() => {
  if (categoryFilter.value === 'all') return 'All Categories'
  const cat = store.categories.find(c => c.id === categoryFilter.value)
  return cat ? cat.name : 'All Categories'
})

// Chronological running balances map (maps transaction ID to running balance of its account)
const transactionBalances = computed(() => {
  const balancesMap = new Map()
  
  // Group transactions by account
  const txsByAccount = {}
  store.accounts.forEach(acc => {
    txsByAccount[acc.id] = []
  })
  
  // Collect all transactions in the store and record their original order index
  store.transactions.forEach((tx, idx) => {
    if (!txsByAccount[tx.accountId]) {
      txsByAccount[tx.accountId] = []
    }
    txsByAccount[tx.accountId].push({ tx, idx })
  })
  
  // Calculate running balance per account
  for (const accountId in txsByAccount) {
    const startingBalances = {
      'acc-checking': 12500000,
      'acc-savings': 30000000,
      'acc-credit': -2700000,
      'acc-cash': 5400000
    }
    
    let balance = startingBalances[accountId] !== undefined
      ? startingBalances[accountId]
      : (store.accounts.find(a => a.id === accountId)?.startingBalance || 0)
      
    // Sort chronologically (by date ascending, then by original index ascending)
    const sorted = txsByAccount[accountId].sort((a, b) => {
      const dateComp = a.tx.date.localeCompare(b.tx.date)
      if (dateComp !== 0) return dateComp
      return a.idx - b.idx
    })
    
    // Compute prefix sum running balance
    sorted.forEach(item => {
      balance += item.tx.amount
      balancesMap.set(item.tx.id, balance)
    })
  }
  
  return balancesMap
})

const showModal = ref(false)
const selectedTransaction = ref(null)

const getAccountName = (accountId) => {
  return store.accounts.find(a => a.id === accountId)?.name || 'Account'
}

const getAccountColor = (accountId) => {
  const acc = store.accounts.find(a => a.id === accountId)
  if (!acc) return '#c0c1ff'
  const bank = store.banks.find(b => b.id === acc.bankId)
  return bank?.color || '#c0c1ff'
}

const getCategoryName = (categoryId) => {
  const cat = store.categories.find(c => c.id === categoryId)
  if (!cat) return 'Uncategorized'
  // Find group name
  const groupName = cat.parentId === 'income' ? 'Income' :
                    cat.parentId === 'expenses' ? 'Expenses' :
                    cat.parentId === 'savings' ? 'Savings' : 'Debt'
  return `${groupName} > ${cat.name}`
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

// Compute filtered transactions
const filteredTransactions = computed(() => {
  // Find indices in the original store.transactions array to keep it consistent
  const getOriginalIndex = (tx) => store.transactions.findIndex(t => t.id === tx.id)

  return store.periodTransactions
    .filter(t => {
      // Search query
      const matchSearch = t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      // Account filter
      const matchAccount = accountFilter.value === 'all' || t.accountId === accountFilter.value
      
      // Category filter
      const matchCategory = categoryFilter.value === 'all' || t.categoryId === categoryFilter.value

      return matchSearch && matchAccount && matchCategory
    })
    .sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date)
      if (dateComp !== 0) return dateComp
      return getOriginalIndex(b) - getOriginalIndex(a)
    })
})

// Toggles
const toggleShift = (tx) => {
  tx.shiftToNextMonth = !tx.shiftToNextMonth
  store.editTransaction(tx)
}

// Modal open/close
const openAddModal = () => {
  selectedTransaction.value = null
  showModal.value = true
}

const openEditModal = (tx) => {
  selectedTransaction.value = tx
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedTransaction.value = null
}

const deleteTx = (id) => {
  if (confirm('Are you sure you want to delete this transaction? This will instantly adjust the account balance.')) {
    store.deleteTransaction(id)
  }
}
</script>
