<template>
  <div>
    <!-- Sticky Zero-Based Budget Banner for real-time allocation tracking (Monthly View only) -->
    <div
      v-if="plannerView === 'monthly'"
      class="sticky z-20 bg-background/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-[#464554]/10 mb-6 shadow-md"
      :class="[settingsStore.isTauri ? 'top-24' : 'top-16']"
    >
      <DashboardZbbStatusBanner class="!mb-0" />
    </div>

    <!-- Sticky 12-Month ZBB Status Ribbon for real-time allocation tracking (Yearly View only) -->
    <div
      v-if="plannerView === 'yearly'"
      class="sticky z-20 bg-background/95 backdrop-blur-md pt-2 pb-3.5 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-[#464554]/10 mb-5 shadow-sm"
      :class="[settingsStore.isTauri ? 'top-24' : 'top-16']"
    >
      <div
        ref="zbbScrollRef"
        class="glass-panel px-5 py-2 rounded-xl border border-[#464554]/30 flex items-center justify-between overflow-x-auto scrollbar-none w-full max-w-full"
        @scroll="handleZbbScroll"
      >
        <!-- Title & Subtitle (aligned with Category column) -->
        <div class="flex flex-col flex-1 min-w-[240px] pr-4 flex-shrink-0">
          <span class="text-[9px] text-on-surface-variant font-extrabold uppercase tracking-wider">Zero-Based Status (12 Months)</span>
          <span class="text-[8px] text-on-surface-variant/80 font-medium">Real-time allocation tracker</span>
        </div>
        
        <!-- 12 Month Badges (aligned with table month columns) -->
        <div class="flex gap-0 flex-shrink-0">
          <div
            v-for="(m, idx) in months"
            :key="m"
            class="w-[110px] min-w-[110px] max-w-[110px] flex items-center justify-center flex-shrink-0"
          >
            <div
              class="flex items-center gap-1 px-1.5 py-0.5 rounded-full border transition-all text-[9px] font-bold whitespace-nowrap"
              :class="[
                getMonthToAssign(m) === 0 ? 'bg-secondary/5 border-secondary/35 text-secondary' :
                getMonthToAssign(m) > 0 ? 'bg-tertiary/5 border-tertiary/35 text-tertiary' : 'bg-error/5 border-error/35 text-error'
              ]"
            >
              <span class="text-[8px] uppercase opacity-80">{{ monthLabels[idx] }}</span>
              <span class="font-extrabold tracking-tight">
                {{ settingsStore.formatValue(getMonthToAssign(m)) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Total column spacer (aligned with Total column) -->
        <div class="w-[130px] min-w-[130px] max-w-[130px] flex-shrink-0"></div>
      </div>
    </div>
    <!-- Action Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
      <h2 class="text-lg font-bold text-on-surface flex items-center gap-2">
        <CalendarRange class="w-5 h-5 text-primary" />
        Budget Planner
      </h2>
      <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <!-- View Toggle -->
        <div class="flex bg-[#1b1c23]/60 rounded-lg p-0.5 border border-[#464554]/30 select-none">
          <button
            @click="plannerView = 'monthly'"
            :class="[
              'px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap',
              plannerView === 'monthly' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            ]"
          >
            Monthly
          </button>
          <button
            @click="plannerView = 'yearly'"
            :class="[
              'px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap',
              plannerView === 'yearly' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            ]"
          >
            Yearly Grid
          </button>
        </div>

        <!-- Month specific actions (Only visible in Monthly view) -->
        <div v-if="plannerView === 'monthly'" class="flex items-center gap-2">
          <button
            @click="store.copyPreviousMonthPlan()"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright/50 border border-[#464554]/40 text-xs font-semibold text-primary transition-all duration-200"
            title="Copy plan from previous month"
          >
            <Copy class="w-3.5 h-3.5" />
            <span>Copy Previous</span>
          </button>
          <button
            @click="confirmReset"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-error/10 border border-error/30 text-xs font-semibold text-error transition-all duration-200"
            title="Reset planned budget for this month"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Category Groups List (Monthly Accordions) -->
    <div v-if="plannerView === 'monthly'" class="flex flex-col gap-5">
      <PlannerGroupAccordion
        v-for="group in groups"
        :key="group.id"
        :group="group"
      />
    </div>

    <!-- Yearly Spreadsheet Grid -->
    <PlannerYearlyGrid v-else />
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { CalendarRange, Copy, RotateCcw } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getGroupMonthTotal = (groupId, monthStr) => {
  const activeMonthStr = `${settingsStore.currentYear}-${monthStr}`
  return store.budgets
    .filter(b => b.month === activeMonthStr)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat?.parentId === groupId
    })
    .reduce((sum, b) => sum + b.planned, 0)
}

const getMonthToAssign = (monthStr) => {
  const income = getGroupMonthTotal('income', monthStr)
  const expenses = getGroupMonthTotal('expenses', monthStr)
  const savings = getGroupMonthTotal('savings', monthStr)
  const debt = getGroupMonthTotal('debt', monthStr)
  return income - (expenses + savings + debt)
}

const plannerView = computed({
  get: () => settingsStore.plannerView || 'monthly',
  set: (val) => settingsStore.setPlannerView(val)
})

const groups = ref([
  { id: 'income', name: 'Income Sources', expanded: true },
  { id: 'expenses', name: 'Expenses Categories', expanded: true },
  { id: 'savings', name: 'Savings Goals', expanded: true },
  { id: 'debt', name: 'Debt Payoffs', expanded: true }
])

const confirmReset = () => {
  if (confirm('Are you sure you want to reset current month plan? This clears all planned values for this month.')) {
    store.resetCurrentPlan()
  }
}

// Scroll Synchronization setup for Yearly ZBB Ribbon
const zbbScrollRef = ref(null)
let lastScrollLeft = 0

const handleZbbScroll = (event) => {
  const scrollLeft = event.target.scrollLeft
  if (Math.abs(lastScrollLeft - scrollLeft) > 0.5) {
    lastScrollLeft = scrollLeft
    window.dispatchEvent(new CustomEvent('sync-yearly-scroll', { 
      detail: { scrollLeft, source: 'zbb' } 
    }))
  }
}

const handleGlobalSync = (event) => {
  const { scrollLeft, source } = event.detail
  if (source !== 'zbb' && Math.abs(lastScrollLeft - scrollLeft) > 0.5) {
    lastScrollLeft = scrollLeft
    if (zbbScrollRef.value && Math.abs(zbbScrollRef.value.scrollLeft - scrollLeft) > 0.5) {
      zbbScrollRef.value.scrollLeft = scrollLeft
    }
  }
}

onMounted(() => {
  window.addEventListener('sync-yearly-scroll', handleGlobalSync)
})

onUnmounted(() => {
  window.removeEventListener('sync-yearly-scroll', handleGlobalSync)
})
</script>
