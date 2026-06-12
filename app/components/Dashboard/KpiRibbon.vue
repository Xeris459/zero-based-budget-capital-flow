<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-gutter">
      <!-- Net Worth Card -->
      <div
        @click="openDetail('net_worth')"
        class="glass-panel rounded-xl p-4 sm:p-5 flex flex-col relative group border border-transparent hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
      >
        <div class="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
        </div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <TrendingUp class="w-4 h-4 text-primary" />
            <span class="text-xs font-semibold text-on-surface-variant">Net Worth</span>
            <div
              class="relative flex items-center"
              @click.stop
              @mouseenter="showNetWorthTooltip = true"
              @mouseleave="showNetWorthTooltip = false"
            >
              <Info class="w-3.5 h-3.5 text-on-surface-variant/60 hover:text-primary transition-colors cursor-help" />
              <!-- Tooltip Panel -->
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-[#181922] border border-[#464554]/60 text-[11px] font-medium text-on-surface-variant leading-normal shadow-xl z-50 transition-all duration-200 origin-bottom"
                :class="[showNetWorthTooltip ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none']"
              >
                <span class="text-on-surface font-bold block mb-1">Net Worth</span>
                Measures total financial health by subtracting total liabilities (like credit card debt) from total liquid assets (savings, cash, etc.).
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#181922]"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-auto">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-on-surface text-glow leading-tight">{{ settingsStore.formatIndonesianHuman(store.netWorth) }}</h2>
          <p class="text-[11px] font-semibold text-secondary mt-1.5 flex items-center gap-1">
            <ArrowUpRight class="w-3.5 h-3.5" /> +2.4% from last month
          </p>
        </div>
      </div>

      <!-- Savings Rate Card -->
      <div
        @click="openDetail('savings_rate')"
        class="glass-panel rounded-xl p-4 sm:p-5 flex flex-col relative group border border-transparent hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <PiggyBank class="w-4 h-4 text-tertiary" />
            <span class="text-xs font-semibold text-on-surface-variant">Savings Rate</span>
            <div
              class="relative flex items-center"
              @click.stop
              @mouseenter="showSavingsTooltip = true"
              @mouseleave="showSavingsTooltip = false"
            >
              <Info class="w-3.5 h-3.5 text-on-surface-variant/60 hover:text-primary transition-colors cursor-help" />
              <!-- Tooltip Panel -->
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-[#181922] border border-[#464554]/60 text-[11px] font-medium text-on-surface-variant leading-normal shadow-xl z-50 transition-all duration-200 origin-bottom"
                :class="[showSavingsTooltip ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none']"
              >
                <span class="text-on-surface font-bold block mb-1">Savings Rate</span>
                Measures the percentage of actual income saved or paid towards debt this month: <code>(Savings + Debt Payoff) / Total Income * 100%</code>.
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#181922]"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-auto flex items-end justify-between gap-2">
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-on-surface text-glow leading-tight">{{ store.savingsRate }}%</h2>
            <p class="text-[11px] text-on-surface-variant mt-1.5">Target: 20.0%</p>
          </div>
          <!-- Gauge SVG -->
          <div class="w-12 h-12 sm:w-16 sm:h-16 relative flex items-center justify-center flex-shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1f1f27" stroke-width="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffb95f" stroke-width="3"
                :stroke-dasharray="`${store.savingsRate}, 100`" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Budget Spent Card -->
      <div
        @click="openDetail('budget_spent')"
        class="glass-panel rounded-xl p-4 sm:p-5 flex flex-col relative group border border-transparent hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
        :class="{ 'hover:border-error/30': store.budgetSpentPercent > 100 }"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <BarChart2 class="w-4 h-4" :class="[store.budgetSpentPercent > 100 ? 'text-error' : 'text-primary']" />
            <span class="text-xs font-semibold text-on-surface-variant">Budget Spent</span>
            <div
              class="relative flex items-center"
              @click.stop
              @mouseenter="showSpentTooltip = true"
              @mouseleave="showSpentTooltip = false"
            >
              <Info class="w-3.5 h-3.5 text-on-surface-variant/60 hover:text-primary transition-colors cursor-help" />
              <!-- Tooltip Panel -->
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-[#181922] border border-[#464554]/60 text-[11px] font-medium text-on-surface-variant leading-normal shadow-xl z-50 transition-all duration-200 origin-bottom"
                :class="[showSpentTooltip ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none']"
              >
                <span class="text-on-surface font-bold block mb-1">Budget Spent Limit</span>
                Tracks operational spending (under <strong class="text-primary">Expenses</strong> group like Food, Housing) against planned limits. Savings goals and Debt payments are excluded.
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#181922]"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-auto">
          <div class="flex items-end justify-between mb-1.5">
            <h2 class="text-xl sm:text-2xl font-bold leading-tight" :class="[store.budgetSpentPercent > 100 ? 'text-error text-glow' : 'text-on-surface']">
              {{ store.budgetSpentPercent }}%
            </h2>
            <span class="text-[10px] sm:text-xs text-on-surface-variant mb-0.5">
              {{ settingsStore.formatIndonesianHuman(store.totalActualSpending) }} / {{ settingsStore.formatIndonesianHuman(store.totalPlannedSpending) }}
            </span>
          </div>
          <div class="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="[store.budgetSpentPercent > 100 ? 'bg-error' : 'bg-primary']"
              :style="{ width: `${Math.min(store.budgetSpentPercent, 100)}%` }"
            ></div>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-2.5">
            Active period: {{ settingsStore.filterType === 'yearly' ? settingsStore.currentYear : `${settingsStore.currentYear}-${settingsStore.currentMonth}` }}
          </p>
        </div>
      </div>
    </div>

    <!-- Detail Breakdown Modal -->
    <DashboardDetailModal
      :show="showDetailModal"
      :type="activeType"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ref } from 'vue'
import { TrendingUp, ArrowUpRight, PiggyBank, BarChart2, Info } from '@lucide/vue'
 
const store = useBudgetStore()
const settingsStore = useSettingsStore()
 
const showDetailModal = ref(false)
const activeType = ref('net_worth')
const showNetWorthTooltip = ref(false)
const showSavingsTooltip = ref(false)
const showSpentTooltip = ref(false)

const openDetail = (type) => {
  activeType.value = type
  showDetailModal.value = true
}
</script>
