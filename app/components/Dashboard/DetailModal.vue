<template>
  <CommonModal :show="show" @close="close">
    <template #header>
      {{ title }}
    </template>

    <template #body>
      <div class="space-y-4 pt-2">
        <!-- Net Worth Breakdown -->
        <div v-if="type === 'net_worth'" class="space-y-3">
          <div
            v-for="acc in store.accounts"
            :key="acc.id"
            class="flex items-center justify-between p-3 rounded-lg bg-surface-variant/30 border border-[#464554]/30"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="[
                  acc.type === 'checking' ? 'bg-secondary/15 text-secondary' :
                  acc.type === 'savings' ? 'bg-primary/15 text-primary' :
                  acc.type === 'credit_card' ? 'bg-error/15 text-error' :
                  'bg-on-surface-variant/15 text-on-surface-variant'
                ]"
              >
                <CreditCard v-if="acc.type === 'credit_card'" class="w-4 h-4" />
                <PiggyBank v-else-if="acc.type === 'savings'" class="w-4 h-4" />
                <Landmark v-else class="w-4 h-4" />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">{{ acc.name }}</span>
                <span class="text-[10px] text-on-surface-variant font-medium">{{ getBankCode(acc.bankId) }}</span>
              </div>
            </div>
            <span
              class="text-xs font-extrabold"
              :class="[acc.balance < 0 ? 'text-error' : 'text-on-surface']"
            >
              {{ settingsStore.formatIndonesianHuman(acc.balance) }}
            </span>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 mt-4">
            <span class="text-xs font-bold text-primary">Total Net Worth</span>
            <span class="text-sm font-extrabold text-primary">{{ settingsStore.formatIndonesianHuman(store.netWorth) }}</span>
          </div>
        </div>

        <!-- Savings Rate Breakdown -->
        <div v-else-if="type === 'savings_rate'" class="space-y-3">
          <div class="max-h-80 overflow-y-auto pr-1 space-y-2">
            <div
              v-for="tx in savingsTransactions"
              :key="tx.id"
              class="flex justify-between items-center p-2.5 rounded-lg bg-surface-variant/20 border border-[#464554]/20 hover:bg-surface-variant/30 transition-colors"
            >
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">{{ tx.description }}</span>
                <span class="text-[10px] text-on-surface-variant mt-1">{{ formatDate(tx.date) }} • {{ getCategoryName(tx.categoryId) }}</span>
              </div>
              <span class="text-xs font-extrabold text-secondary">
                {{ settingsStore.formatIndonesianHuman(Math.abs(tx.amount)) }}
              </span>
            </div>

            <div v-if="savingsTransactions.length === 0" class="text-center py-6 text-xs text-on-surface-variant">
              No savings or debt payoff transactions recorded this period.
            </div>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg bg-tertiary/10 border border-tertiary/20 mt-4">
            <span class="text-xs font-bold text-tertiary">Total Savings / Payoffs</span>
            <span class="text-sm font-extrabold text-tertiary">{{ settingsStore.formatIndonesianHuman(totalSavings) }}</span>
          </div>
        </div>

        <!-- Budget Spent Breakdown -->
        <div v-else-if="type === 'budget_spent'" class="space-y-3">
          <div class="max-h-80 overflow-y-auto pr-1 space-y-2">
            <div
              v-for="tx in expenseTransactions"
              :key="tx.id"
              class="flex justify-between items-center p-2.5 rounded-lg bg-surface-variant/20 border border-[#464554]/20 hover:bg-surface-variant/30 transition-colors"
            >
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">{{ tx.description }}</span>
                <span class="text-[10px] text-on-surface-variant mt-1">{{ formatDate(tx.date) }} • {{ getCategoryName(tx.categoryId) }}</span>
              </div>
              <span class="text-xs font-extrabold text-error">
                {{ settingsStore.formatIndonesianHuman(Math.abs(tx.amount)) }}
              </span>
            </div>

            <div v-if="expenseTransactions.length === 0" class="text-center py-6 text-xs text-on-surface-variant">
              No expense transactions recorded this period.
            </div>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 mt-4">
            <span class="text-xs font-bold text-primary">Total Spending</span>
            <span class="text-sm font-extrabold text-primary">{{ settingsStore.formatIndonesianHuman(store.totalActualSpending) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        @click="close"
        class="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
      >
        Close
      </button>
    </template>
  </CommonModal>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { Landmark, PiggyBank, CreditCard } from '@lucide/vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])
const store = useBudgetStore()
const settingsStore = useSettingsStore()

const close = () => {
  emit('close')
}

const title = computed(() => {
  switch (props.type) {
    case 'net_worth': return 'Net Worth Breakdown'
    case 'savings_rate': return 'Savings & Debt Payoffs'
    case 'budget_spent': return settingsStore.filterType === 'yearly' ? 'Annual Expenses Ledger' : 'Monthly Expenses Ledger'
    default: return 'Breakdown Details'
  }
})

const getBankCode = (bankId) => {
  return store.banks.find(b => b.id === bankId)?.code || 'BANK'
}

const getCategoryName = (categoryId) => {
  return store.categories.find(c => c.id === categoryId)?.name || 'Uncategorized'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Compute savings rate transactions
const savingsTransactions = computed(() => {
  return store.periodTransactions.filter(t => {
    const cat = store.categories.find(c => c.id === t.categoryId)
    return cat && (cat.parentId === 'savings' || cat.parentId === 'debt')
  })
})

const totalSavings = computed(() => {
  return savingsTransactions.value.reduce((sum, t) => sum - t.amount, 0)
})

// Compute expense transactions
const expenseTransactions = computed(() => {
  return store.periodTransactions.filter(t => {
    const cat = store.categories.find(c => c.id === t.categoryId)
    return cat && cat.parentId === 'expenses'
  })
})
</script>
