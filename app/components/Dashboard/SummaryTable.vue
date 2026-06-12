<template>
  <div class="glass-panel rounded-xl p-card-padding flex flex-col relative overflow-hidden w-full select-none">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 border-b border-[#464554]/25 pb-4">
      <div class="flex flex-col">
        <h3 class="text-sm font-black text-on-surface">Cash Flow Summary</h3>
        <p class="text-[10px] text-on-surface-variant font-bold mt-0.5">Budgeted vs actual breakdown for this period (click row to toggle detail)</p>
      </div>
      <span class="text-[9px] font-black text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full uppercase tracking-wider">
        {{ periodLabel }}
      </span>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-[#464554]/25 bg-surface-container-low/40">
            <th class="text-[10px] text-on-surface-variant uppercase font-bold px-4 py-3">Category</th>
            <th class="text-[10px] text-on-surface-variant uppercase font-bold px-4 py-3 text-right">Planned</th>
            <th class="text-[10px] text-on-surface-variant uppercase font-bold px-4 py-3 text-right">Actual</th>
            <th class="text-[10px] text-on-surface-variant uppercase font-bold px-4 py-3 text-right">Difference</th>
            <th class="text-[10px] text-on-surface-variant uppercase font-bold px-4 py-3 w-44">Progress</th>
          </tr>
        </thead>
        <tbody v-for="row in rows" :key="row.id">
          <!-- Parent Row -->
          <tr
            @click="toggleCategory(row.id)"
            class="border-b border-[#464554]/10 hover:bg-surface-bright/5 transition-colors cursor-pointer"
          >
            <!-- Category Name with Toggle and Icon -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span class="inline-flex items-center gap-2.5 text-xs font-black text-on-surface">
                <component
                  :is="expandedCategories[row.id] ? ChevronDown : ChevronRight"
                  class="w-3.5 h-3.5 text-on-surface-variant flex-shrink-0 transition-transform duration-200"
                />
                <span :class="['p-1.5 rounded-lg flex items-center justify-center flex-shrink-0', row.bgColor]">
                  <component :is="row.icon" class="w-4 h-4" />
                </span>
                {{ row.name }}
              </span>
            </td>

            <!-- Planned -->
            <td class="px-4 py-3.5 text-right font-semibold text-xs text-on-surface whitespace-nowrap">
              {{ settingsStore.formatValue(row.planned) }}
            </td>

            <!-- Actual -->
            <td class="px-4 py-3.5 text-right font-extrabold text-xs text-on-surface whitespace-nowrap">
              {{ settingsStore.formatValue(row.actual) }}
            </td>

            <!-- Difference -->
            <td
              class="px-4 py-3.5 text-right font-extrabold text-xs whitespace-nowrap"
              :class="row.diff >= 0 ? 'text-secondary' : 'text-error'"
            >
              {{ row.diff > 0 ? '+' : row.diff < 0 ? '-' : '' }}{{ settingsStore.formatValue(Math.abs(row.diff)) }}
            </td>

            <!-- Progress Bar -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="w-28 h-2 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="row.progressBarClass"
                    :style="{ width: `${Math.min(row.progress, 100)}%` }"
                  ></div>
                </div>
                <span class="text-[10px] font-black text-on-surface-variant w-8">
                  {{ Math.round(row.progress) }}%
                </span>
              </div>
            </td>
          </tr>

          <!-- Child Rows (Subcategories) -->
          <tr
            v-if="expandedCategories[row.id]"
            v-for="sub in row.subcategories"
            :key="sub.id"
            class="bg-surface-container-low/10 border-b border-[#464554]/5 last:border-b last:border-b-[#464554]/20 hover:bg-surface-bright/5 transition-colors"
          >
            <!-- Subcategory Name -->
            <td class="px-4 py-2.5 pl-12 whitespace-nowrap">
              <span class="text-[11px] font-semibold text-on-surface-variant flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: row.iconColor }"></span>
                {{ sub.name }}
              </span>
            </td>

            <!-- Sub Planned -->
            <td class="px-4 py-2.5 text-right font-medium text-[11px] text-on-surface-variant whitespace-nowrap">
              {{ settingsStore.formatValue(sub.planned) }}
            </td>

            <!-- Sub Actual -->
            <td class="px-4 py-2.5 text-right font-bold text-[11px] text-on-surface whitespace-nowrap">
              {{ settingsStore.formatValue(sub.actual) }}
            </td>

            <!-- Sub Difference -->
            <td
              class="px-4 py-2.5 text-right font-bold text-[11px] whitespace-nowrap"
              :class="sub.diff >= 0 ? 'text-secondary/80' : 'text-error/80'"
            >
              {{ sub.diff > 0 ? '+' : sub.diff < 0 ? '-' : '' }}{{ settingsStore.formatValue(Math.abs(sub.diff)) }}
            </td>

            <!-- Sub Progress -->
            <td class="px-4 py-2.5 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="w-20 h-1 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :class="row.progressBarClass"
                    :style="{ width: `${Math.min(sub.progress, 100)}%` }"
                  ></div>
                </div>
                <span class="text-[9px] font-bold text-on-surface-variant w-8">
                  {{ Math.round(sub.progress) }}%
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { TrendingUp, BarChart2, PiggyBank, CreditCard, ChevronDown, ChevronRight } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const expandedCategories = ref({
  income: true,
  spending: true,
  savings: true,
  debt: true
})

const toggleCategory = (key) => {
  expandedCategories.value[key] = !expandedCategories.value[key]
}

const activeMonthStr = computed(() => `${settingsStore.currentYear}-${settingsStore.currentMonth}`)

const periodLabel = computed(() => {
  if (settingsStore.filterType === 'yearly') {
    return settingsStore.currentYear
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIdx = parseInt(settingsStore.currentMonth) - 1
  return `${months[monthIdx] || 'Month'} ${settingsStore.currentYear}`
})

// Calculations for Income
const plannedIncome = computed(() => {
  return store.budgets
    .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr.value)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat?.parentId === 'income'
    })
    .reduce((sum, b) => sum + b.planned, 0)
})

const actualIncome = computed(() => {
  return store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat && cat.parentId === 'income'
    })
    .reduce((sum, t) => sum + t.amount, 0)
})

// Calculations for Expenses
const plannedExpenses = computed(() => store.totalPlannedSpending)
const actualExpenses = computed(() => store.totalActualSpending)

// Calculations for Savings
const plannedSavings = computed(() => {
  return store.budgets
    .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr.value)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat && cat.parentId === 'savings'
    })
    .reduce((sum, b) => sum + b.planned, 0)
})

const actualSavings = computed(() => store.totalSavings)

// Calculations for Debt
const plannedDebt = computed(() => {
  return store.budgets
    .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr.value)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat && cat.parentId === 'debt'
    })
    .reduce((sum, b) => sum + b.planned, 0)
})

const actualDebt = computed(() => {
  return store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat && cat.parentId === 'debt'
    })
    .reduce((sum, t) => sum - t.amount, 0)
})

// Fetch subcategories dynamic data
const getSubcategories = (parentId) => {
  const cats = store.categories.filter(c => c.parentId === parentId)
  
  return cats.map(cat => {
    const planned = store.budgets
      .filter(b => settingsStore.filterType === 'yearly' ? b.month.startsWith(settingsStore.currentYear) : b.month === activeMonthStr.value)
      .filter(b => b.categoryId === cat.id)
      .reduce((sum, b) => sum + b.planned, 0)
    
    let actual = 0
    if (parentId === 'income') {
      actual = store.periodTransactions
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0)
    } else {
      actual = store.periodTransactions
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum - t.amount, 0)
    }
    
    let diff = 0
    if (parentId === 'income') {
      diff = actual - planned
    } else if (parentId === 'expenses') {
      diff = planned - actual
    } else {
      diff = actual - planned
    }
    
    const progress = planned > 0 ? (actual / planned) * 100 : 0
    
    return {
      id: cat.id,
      name: cat.name,
      planned,
      actual,
      diff,
      progress
    }
  })
}

const rows = computed(() => [
  {
    id: 'income',
    name: 'Income',
    icon: TrendingUp,
    bgColor: 'bg-emerald-500/10 text-emerald-400',
    iconColor: '#4edea3',
    planned: plannedIncome.value,
    actual: actualIncome.value,
    diff: actualIncome.value - plannedIncome.value,
    diffType: 'income',
    progress: plannedIncome.value > 0 ? (actualIncome.value / plannedIncome.value) * 100 : 0,
    progressBarClass: 'bg-emerald-400',
    subcategories: getSubcategories('income')
  },
  {
    id: 'spending',
    name: 'Spending',
    icon: BarChart2,
    bgColor: 'bg-rose-500/10 text-rose-400',
    iconColor: '#ffb4ab',
    planned: plannedExpenses.value,
    actual: actualExpenses.value,
    diff: plannedExpenses.value - actualExpenses.value,
    diffType: 'expenses',
    progress: plannedExpenses.value > 0 ? (actualExpenses.value / plannedExpenses.value) * 100 : 0,
    progressBarClass: actualExpenses.value > plannedExpenses.value ? 'bg-error' : 'bg-primary',
    subcategories: getSubcategories('expenses')
  },
  {
    id: 'savings',
    name: 'Savings',
    icon: PiggyBank,
    bgColor: 'bg-indigo-500/10 text-indigo-400',
    iconColor: '#8083ff',
    planned: plannedSavings.value,
    actual: actualSavings.value,
    diff: actualSavings.value - plannedSavings.value,
    diffType: 'savings',
    progress: plannedSavings.value > 0 ? (actualSavings.value / plannedSavings.value) * 100 : 0,
    progressBarClass: 'bg-indigo-400',
    subcategories: getSubcategories('savings')
  },
  {
    id: 'debt',
    name: 'Debt Payments',
    icon: CreditCard,
    bgColor: 'bg-amber-500/10 text-amber-400',
    iconColor: '#ffb95f',
    planned: plannedDebt.value,
    actual: actualDebt.value,
    diff: actualDebt.value - plannedDebt.value,
    diffType: 'debt',
    progress: plannedDebt.value > 0 ? (actualDebt.value / plannedDebt.value) * 100 : 0,
    progressBarClass: 'bg-amber-400',
    subcategories: getSubcategories('debt')
  }
])
</script>
