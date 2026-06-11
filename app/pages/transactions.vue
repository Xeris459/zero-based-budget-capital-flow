<template>
  <div>
    <!-- Top Filter Row -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      <div class="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
        <!-- Search -->
        <div class="relative w-full md:w-64">
          <Search class="w-4 h-4 absolute left-3 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search transactions..."
            class="bg-surface-container/60 border border-[#464554]/40 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
          />
        </div>

        <!-- Account Filter -->
        <div class="relative w-full md:w-48">
          <select
            v-model="accountFilter"
            class="bg-surface-container/60 bg-none border border-[#464554]/40 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full appearance-none"
          >
            <option value="all">All Accounts</option>
            <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
          </select>
          <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>

        <!-- Category Group Filter -->
        <div class="relative w-full md:w-48">
          <select
            v-model="categoryFilter"
            class="bg-surface-container/60 bg-none border border-[#464554]/40 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full appearance-none"
          >
            <option value="all">All Categories</option>
            <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
      </div>

      <!-- Add Action Button -->
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all duration-200 w-full md:w-auto justify-center"
      >
        <Plus class="w-4 h-4" />
        Add Transaction
      </button>
    </div>

    <!-- Table Container -->
    <div class="glass-panel rounded-xl overflow-hidden border border-[#464554]/30">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[#464554]/25 bg-surface-container-low/40">
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Date</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Description</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Bank & Account</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3">Category</th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-5 py-3 text-right">Amount</th>
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
                {{ tx.amount > 0 ? '+' : '' }}{{ store.formatValue(tx.amount) }}
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
              <td colspan="7" class="px-5 py-12 text-center text-xs font-semibold text-on-surface-variant">
                <div class="flex flex-col items-center justify-center gap-2">
                  <Inbox class="w-8 h-8 text-on-surface-variant/40" />
                  No transactions found for this period. Click "+ Add Transaction" to create one.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
import { ref, computed } from 'vue'
import {
  Search,
  ChevronDown,
  Plus,
  Landmark,
  Edit2,
  Trash2,
  Inbox
} from '@lucide/vue'

const store = useBudgetStore()

const searchQuery = ref('')
const accountFilter = ref('all')
const categoryFilter = ref('all')

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
    .sort((a, b) => b.date.localeCompare(a.date)) // Sort newest first
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
