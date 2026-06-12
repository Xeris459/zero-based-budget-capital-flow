<template>
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
              {{ tx.amount > 0 ? '+' : '' }}{{ settingsStore.formatValue(tx.amount) }}
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
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { Receipt } from '@lucide/vue'

const props = defineProps({
  selectedBankId: {
    type: String,
    required: true
  },
  selectedAccountId: {
    type: String,
    required: true
  }
})

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const ledgerTitle = computed(() => {
  return store.ledgerTitle(props.selectedBankId, props.selectedAccountId)
})

const filteredLedger = computed(() => {
  return store.filteredLedger(props.selectedBankId, props.selectedAccountId)
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
</script>
