<template>
  <div>
    <!-- Zero-Based Budget Banner -->
    <DashboardZbbStatusBanner />

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
import { computed } from 'vue'
import { CalendarRange, Copy, RotateCcw } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

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
</script>
