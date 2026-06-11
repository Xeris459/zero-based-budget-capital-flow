<template>
  <div>
    <!-- Zero-Based Status Banner -->
    <div class="glass-panel border-l-4 border-l-secondary rounded-r-xl rounded-l-sm p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent pointer-events-none"></div>
      <div class="flex flex-col gap-1 z-10">
        <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Zero-Based Status</span>
        <div class="flex items-center gap-2 mt-1">
          <CheckCircle class="w-5 h-5 text-secondary" />
          <span class="text-lg font-bold text-secondary">Every Rupiah Has a Job!</span>
        </div>
      </div>
      <div class="flex items-center gap-8 z-10">
        <div class="flex flex-col text-right">
          <span class="text-xs text-on-surface-variant font-medium">Total Planned Income</span>
          <span class="text-sm font-bold text-on-surface mt-1">{{ store.formatValue(store.totalReadyToAssign) }}</span>
        </div>
        <div class="h-8 w-px bg-[#464554]/40"></div>
        <div class="flex flex-col text-right">
          <span class="text-xs text-on-surface-variant font-medium">Total Assigned</span>
          <span class="text-sm font-bold text-on-surface mt-1">{{ store.formatValue(store.totalAssigned) }}</span>
        </div>
        <div class="h-8 w-px bg-[#464554]/40"></div>
        <div class="flex flex-col text-right">
          <span class="text-xs text-secondary font-medium">To Assign</span>
          <span class="text-xl font-extrabold text-secondary mt-1">{{ store.formatValue(store.toAssign) }}</span>
        </div>
      </div>
    </div>

    <!-- KPI Metric Ribbon -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
      <!-- Net Worth Card -->
      <div class="glass-panel rounded-xl p-card-padding flex flex-col relative overflow-hidden group border border-transparent hover:border-primary/30 transition-all duration-200">
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-semibold text-on-surface-variant flex items-center gap-2">
            <TrendingUp class="w-4 h-4 text-primary" />
            Net Worth
          </span>
        </div>
        <div class="mt-auto">
          <h2 class="text-3xl font-extrabold text-on-surface text-glow">{{ store.formatValue(store.netWorth) }}</h2>
          <p class="text-[11px] font-semibold text-secondary mt-2 flex items-center gap-1">
            <ArrowUpRight class="w-3.5 h-3.5" /> +2.4% from last month
          </p>
        </div>
      </div>

      <!-- Savings Rate Card -->
      <div class="glass-panel rounded-xl p-card-padding flex flex-col relative overflow-hidden group border border-transparent hover:border-primary/30 transition-all duration-200">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-semibold text-on-surface-variant flex items-center gap-2">
            <PiggyBank class="w-4 h-4 text-tertiary" />
            Savings Rate
          </span>
        </div>
        <div class="mt-auto flex items-end justify-between">
          <div>
            <h2 class="text-3xl font-extrabold text-on-surface text-glow">{{ savingsRate }}%</h2>
            <p class="text-[11px] text-on-surface-variant mt-2">Target: 20.0%</p>
          </div>
          <!-- Gauge SVG -->
          <div class="w-16 h-16 relative flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1f1f27" stroke-width="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffb95f" stroke-width="3"
                :stroke-dasharray="`${savingsRate}, 100`" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Budget Spent Card -->
      <div class="glass-panel rounded-xl p-card-padding flex flex-col relative overflow-hidden group border border-transparent hover:border-primary/30 transition-all duration-200">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-semibold text-on-surface-variant flex items-center gap-2">
            <BarChart2 class="w-4 h-4 text-primary" />
            Budget Spent
          </span>
        </div>
        <div class="mt-auto">
          <div class="flex items-end justify-between mb-2">
            <h2 class="text-2xl font-bold text-on-surface">{{ budgetSpentPercent }}%</h2>
            <span class="text-xs text-on-surface-variant mb-1">
              {{ store.formatValue(totalActualSpending) }} / {{ store.formatValue(totalPlannedSpending) }}
            </span>
          </div>
          <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: `${Math.min(budgetSpentPercent, 100)}%` }"></div>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-3">Active month: June 2026</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-gutter">
      <!-- Spending Breakdown (SVG-based doughnut chart) -->
      <div class="glass-panel rounded-xl p-card-padding min-h-[320px] flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-sm font-bold text-on-surface">Spending Breakdown</h3>
          <span class="text-[11px] text-primary hover:underline cursor-pointer font-semibold">June 2026</span>
        </div>
        <div class="flex-1 flex flex-col md:flex-row items-center gap-8 justify-center">
          <div class="relative w-48 h-48 flex-shrink-0">
            <!-- Custom Dynamic SVG Doughnut Chart -->
            <svg class="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#1f1f27" stroke-width="12"></circle>
              <!-- Cumulative offsets -->
              <circle
                v-for="(slice, i) in spendingSlices"
                :key="slice.category"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                :stroke="slice.color"
                stroke-width="12"
                :stroke-dasharray="`${slice.dash} 251.2`"
                :stroke-dashoffset="-slice.offset"
                class="transition-all duration-300 hover:stroke-[14px]"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Spent</span>
              <span class="text-md font-bold text-on-surface mt-1">{{ store.formatValue(totalActualSpending) }}</span>
            </div>
          </div>
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 w-full">
            <div
              v-for="slice in spendingSlices"
              :key="slice.category"
              class="flex items-center justify-between p-2 rounded-lg hover:bg-surface-variant/30 transition-all border border-transparent hover:border-[#464554]/30"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: slice.color }"></span>
                <span class="text-xs font-semibold text-on-surface">{{ slice.category }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-on-surface-variant">{{ slice.percentage }}%</span>
                <span class="text-xs font-bold text-on-surface text-right min-w-[60px]">{{ store.formatValue(slice.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Savings Breakdown (SVG-based doughnut chart) -->
      <div class="glass-panel rounded-xl p-card-padding min-h-[320px] flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-sm font-bold text-on-surface">Savings Breakdown</h3>
          <span class="text-[11px] text-primary hover:underline cursor-pointer font-semibold">June 2026</span>
        </div>
        <div class="flex-1 flex flex-col md:flex-row items-center gap-8 justify-center">
          <div class="relative w-40 h-40 flex-shrink-0">
            <svg class="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#1f1f27" stroke-width="12"></circle>
              <circle
                v-for="(slice, i) in savingsSlices"
                :key="slice.category"
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                :stroke="slice.color"
                stroke-width="12"
                :stroke-dasharray="`${slice.dash} 251.2`"
                :stroke-dashoffset="-slice.offset"
                class="transition-all duration-300 hover:stroke-[14px]"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Total</span>
              <span class="text-sm font-bold text-on-surface mt-1">{{ store.formatValue(totalSavings) }}</span>
            </div>
          </div>
          <div class="flex-1 grid grid-cols-1 gap-y-2 w-full">
            <div
              v-for="slice in savingsSlices"
              :key="slice.category"
              class="flex items-center justify-between p-2 rounded-lg hover:bg-surface-variant/30 transition-all border border-transparent hover:border-[#464554]/30"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: slice.color }"></span>
                <span class="text-xs font-semibold text-on-surface">{{ slice.category }}</span>
              </div>
              <span class="text-xs font-bold text-on-surface">{{ slice.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget Tracking Chart & Side panels -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <!-- 6-Month Budget Tracking SVG Chart -->
      <div class="lg:col-span-8 glass-panel rounded-xl p-card-padding flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-on-surface">Budget Tracking (May - Dec 2026)</h3>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-sm bg-secondary"></div>
              <span class="text-[10px] text-on-surface-variant font-bold">Income</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-sm bg-primary"></div>
              <span class="text-[10px] text-on-surface-variant font-bold">Spending</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-sm bg-tertiary"></div>
              <span class="text-[10px] text-on-surface-variant font-bold">Savings</span>
            </div>
          </div>
        </div>

        <!-- Visual Bar Chart -->
        <div class="flex-1 w-full flex items-end justify-between gap-4 pt-8 h-[240px] overflow-x-auto min-w-[400px]">
          <div v-for="bar in barData" :key="bar.label" class="flex flex-col items-center gap-2 flex-1">
            <div class="flex items-end justify-center w-full h-44 relative gap-[3px] px-1">
              <!-- Income bar -->
              <div class="relative w-1/3 h-full flex items-end justify-center group cursor-pointer">
                <div class="absolute w-full bg-secondary/30 rounded-t-md" :style="{ height: `${bar.expInc}%` }"></div>
                <div class="relative w-full bg-secondary rounded-t-md transition-all duration-300 group-hover:brightness-110" :style="{ height: `${bar.actInc}%` }"></div>
                <!-- Tooltip -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-surface border border-[#464554] rounded-md p-1.5 z-20 text-[9px] pointer-events-none whitespace-nowrap">
                  Act: {{ store.formatValue(bar.actIncVal) }}
                </div>
              </div>
              <!-- Spent bar -->
              <div class="relative w-1/3 h-full flex items-end justify-center group cursor-pointer">
                <div class="absolute w-full bg-primary/30 rounded-t-md" :style="{ height: `${bar.expExp}%` }"></div>
                <div class="relative w-full bg-primary rounded-t-md transition-all duration-300 group-hover:brightness-110" :style="{ height: `${bar.actExp}%` }"></div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-surface border border-[#464554] rounded-md p-1.5 z-20 text-[9px] pointer-events-none whitespace-nowrap">
                  Act: {{ store.formatValue(bar.actExpVal) }}
                </div>
              </div>
              <!-- Savings bar -->
              <div class="relative w-1/3 h-full flex items-end justify-center group cursor-pointer">
                <div class="absolute w-full bg-tertiary/30 rounded-t-md" :style="{ height: `${bar.expSav}%` }"></div>
                <div class="relative w-full bg-tertiary rounded-t-md transition-all duration-300 group-hover:brightness-110" :style="{ height: `${bar.actSav}%` }"></div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-surface border border-[#464554] rounded-md p-1.5 z-20 text-[9px] pointer-events-none whitespace-nowrap">
                  Act: {{ store.formatValue(bar.actSavVal) }}
                </div>
              </div>
            </div>
            <span class="text-[10px] text-on-surface-variant font-bold" :class="{ 'text-primary': bar.label === 'Jun' }">{{ bar.label }}</span>
          </div>
        </div>
        
        <div class="flex justify-center items-center gap-6 mt-6 border-t border-[#464554]/20 pt-4">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-surface-variant border border-[#464554]/40"></div>
            <span class="text-[10px] text-on-surface-variant font-medium">Expected (Ghost)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-primary"></div>
            <span class="text-[10px] text-on-surface-variant font-medium">Actual (Solid)</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Income Overview & Accounts Summary -->
      <div class="lg:col-span-4 flex flex-col gap-gutter">
        <!-- Income Overview -->
        <div class="glass-panel rounded-xl p-card-padding flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-on-surface">Income Overview</h3>
            <span class="text-[10px] font-semibold text-primary hover:underline cursor-pointer" @click="navigateTo('/planner')">Manage</span>
          </div>
          <div class="flex flex-col gap-4">
            <div v-for="inc in incomeSources" :key="inc.id">
              <div class="flex justify-between items-end mb-1">
                <span class="text-xs text-on-surface font-medium">{{ inc.name }}</span>
                <span class="text-xs text-on-surface-variant font-bold">{{ store.formatValue(inc.actual) }} / {{ store.formatValue(inc.planned) }}</span>
              </div>
              <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div class="h-full bg-secondary rounded-full" :style="{ width: `${Math.min((inc.actual/inc.planned)*100, 100)}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accounts Summary -->
        <div class="glass-panel rounded-xl p-card-padding flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-on-surface">Accounts Summary</h3>
            <span class="text-[10px] font-semibold text-primary hover:underline cursor-pointer" @click="navigateTo('/accounts')">Manage</span>
          </div>
          <div class="flex flex-col gap-3">
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
                {{ store.formatValue(acc.balance) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Alert Widgets -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-8">
      <div class="glass-panel rounded-xl p-4 flex items-start gap-4 border-l-4 border-l-error bg-error/5">
        <AlertTriangle class="w-5 h-5 text-error mt-1 flex-shrink-0" />
        <div>
          <h4 class="text-xs font-bold text-on-surface">Food Budget Warning</h4>
          <p class="text-[11px] text-on-surface-variant mt-1">You've spent 50% of your Food budget with 19 days remaining in month.</p>
        </div>
      </div>
      <div class="glass-panel rounded-xl p-4 flex items-start gap-4 border-l-4 border-l-tertiary bg-tertiary/5">
        <Clock class="w-5 h-5 text-tertiary mt-1 flex-shrink-0" />
        <div>
          <h4 class="text-xs font-bold text-on-surface">Late Income Buffer</h4>
          <p class="text-[11px] text-on-surface-variant mt-1">You have Rp 0K shifted late income from May. Enter transactions to assign.</p>
        </div>
      </div>
      <div class="glass-panel rounded-xl p-4 flex items-start gap-4 border-l-4 border-l-secondary bg-secondary/5">
        <CheckCircle class="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
        <div>
          <h4 class="text-xs font-bold text-on-surface">Budget Balanced!</h4>
          <p class="text-[11px] text-on-surface-variant mt-1">Excellent job! Every Rupiah has a job assigned. Keep tracking transactions.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { computed } from 'vue'
import { useRouter } from '#imports'
import {
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  PiggyBank,
  BarChart2,
  Landmark,
  CreditCard,
  AlertTriangle,
  Clock
} from '@lucide/vue'

const store = useBudgetStore()
const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}

const getBankCode = (bankId) => {
  return store.banks.find(b => b.id === bankId)?.code || 'BANK'
}

// Compute values from actual store transactions & allocations
const totalPlannedSpending = computed(() => {
  const activeMonthStr = `${store.currentYear}-${store.currentMonth}`
  return store.budgets
    .filter(b => b.month === activeMonthStr)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat && cat.parentId === 'expenses'
    })
    .reduce((sum, b) => sum + b.planned, 0)
})

const totalActualSpending = computed(() => {
  return store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat && cat.parentId === 'expenses'
    })
    .reduce((sum, t) => sum - t.amount, 0) // absolute spent
})

const budgetSpentPercent = computed(() => {
  if (totalPlannedSpending.value === 0) return 0
  return Math.round((totalActualSpending.value / totalPlannedSpending.value) * 100)
})

const totalSavings = computed(() => {
  return store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat && cat.parentId === 'savings'
    })
    .reduce((sum, t) => sum - t.amount, 0)
})

const savingsRate = computed(() => {
  // savings actual / income actual
  const actualInflow = store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat && cat.parentId === 'income'
    })
    .reduce((sum, t) => sum + t.amount, 0)

  if (actualInflow === 0) return 0
  // Savings Rate = (savings actual + debt payoff actual) / income actual
  const actualSavings = store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat && (cat.parentId === 'savings' || cat.parentId === 'debt')
    })
    .reduce((sum, t) => sum - t.amount, 0)

  return Math.round((actualSavings / actualInflow) * 100)
})

// Dynamic SVG Slices for Spending Breakdown
const spendingSlices = computed(() => {
  const categoriesMap = {
    'Housing': { color: '#c0c1ff', parentId: 'cat-exp-housing' },
    'Food': { color: '#4edea3', parentId: 'cat-exp-food' },
    'Utilities': { color: '#ffb95f', parentId: 'cat-exp-utils' },
    'Entertainment': { color: '#908fa0', parentId: 'cat-exp-ent' },
    'Savings': { color: '#8083ff', parentId: '' }, // we will fetch savings parentId later
    'Debt': { color: '#ffb4ab', parentId: 'cat-debt-cc' }
  }

  // Calculate actuals
  let housing = 0
  let food = 0
  let utils = 0
  let ent = 0
  let savings = 0
  let debt = 0

  store.periodTransactions.forEach(t => {
    const cat = store.categories.find(c => c.id === t.categoryId)
    if (!cat) return
    const amt = -t.amount // absolute value
    if (cat.id === 'cat-exp-housing') housing += amt
    else if (cat.id === 'cat-exp-food') food += amt
    else if (cat.id === 'cat-exp-utils') utils += amt
    else if (cat.id === 'cat-exp-ent') ent += amt
    else if (cat.parentId === 'savings') savings += amt
    else if (cat.parentId === 'debt' || cat.id === 'cat-debt-cc') debt += amt
  })

  const rawSlices = [
    { category: 'Housing', amount: housing, color: '#c0c1ff' },
    { category: 'Food', amount: food, color: '#4edea3' },
    { category: 'Utilities', amount: utils, color: '#ffb95f' },
    { category: 'Savings', amount: savings, color: '#8083ff' },
    { category: 'Debt', amount: debt, color: '#ffb4ab' },
    { category: 'Entertainment', amount: ent, color: '#908fa0' }
  ]

  const total = rawSlices.reduce((sum, s) => sum + s.amount, 0) || 1

  let currentOffset = 0
  return rawSlices.map(slice => {
    const percentage = Math.round((slice.amount / total) * 100)
    // circle length = 2 * PI * r = 2 * 3.14159 * 40 = 251.2
    const dash = (slice.amount / total) * 251.2
    const offset = currentOffset
    currentOffset += dash
    return {
      ...slice,
      percentage,
      dash: dash.toFixed(1),
      offset: offset.toFixed(1)
    }
  })
})

// Dynamic SVG Slices for Savings Breakdown
const savingsSlices = computed(() => {
  // Group savings categories
  let emergency = 0
  let retirement = 0
  let vacation = 0
  let car = 0

  store.periodTransactions.forEach(t => {
    const cat = store.categories.find(c => c.id === t.categoryId)
    if (!cat || cat.parentId !== 'savings') return
    const amt = -t.amount
    if (cat.id === 'cat-sav-emg') emergency += amt
    else if (cat.id === 'cat-sav-ret') retirement += amt
    else if (cat.id === 'cat-sav-vac') vacation += amt
    else if (cat.id === 'cat-sav-car') car += amt
  })

  const rawSlices = [
    { category: 'Emergency Fund', amount: emergency || 1, color: '#4edea3' },
    { category: 'Retirement', amount: retirement || 0, color: '#c0c1ff' },
    { category: 'Vacation', amount: vacation || 0, color: '#ffb95f' },
    { category: 'New Car', amount: car || 0, color: '#ca8100' }
  ]

  const total = rawSlices.reduce((sum, s) => sum + s.amount, 0) || 1
  let currentOffset = 0
  return rawSlices.map(slice => {
    const percentage = Math.round((slice.amount / total) * 100)
    const dash = (slice.amount / total) * 251.2
    const offset = currentOffset
    currentOffset += dash
    return {
      ...slice,
      percentage,
      dash: dash.toFixed(1),
      offset: offset.toFixed(1)
    }
  })
})

// Income Overview Progress bars
const incomeSources = computed(() => {
  const activeMonthStr = `${store.currentYear}-${store.currentMonth}`
  
  return store.categories
    .filter(c => c.parentId === 'income')
    .map(c => {
      // Find planned budget for this category
      const plannedBudget = store.budgets.find(b => b.month === activeMonthStr && b.categoryId === c.id)?.planned || 0
      
      // Calculate actual income transactions
      const actualIncome = store.periodTransactions
        .filter(t => t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        id: c.id,
        name: c.name,
        planned: plannedBudget,
        actual: actualIncome
      }
    })
})

// Bar Chart Data mapping for 6 Months (May - Dec)
// Static estimates aligned with actual June data
const barData = computed(() => {
  return [
    { label: 'May', expInc: 70, actInc: 75, actIncVal: 15000000, expExp: 60, actExp: 58, actExpVal: 10000000, expSav: 10, actSav: 17, actSavVal: 2000000 },
    { label: 'Jun', expInc: 70, actInc: 70, actIncVal: 13375000, expExp: 60, actExp: 42, actExpVal: 4662000, expSav: 10, actSav: 33, actSavVal: 1638000 },
    { label: 'Jul', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
    { label: 'Aug', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
    { label: 'Sep', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
    { label: 'Oct', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
    { label: 'Nov', expInc: 70, actInc: 0, actIncVal: 0, expExp: 60, actExp: 0, actExpVal: 0, expSav: 10, actSav: 0, actSavVal: 0 },
    { label: 'Dec', expInc: 90, actInc: 0, actIncVal: 0, expExp: 70, actExp: 0, actExpVal: 0, expSav: 20, actSav: 0, actSavVal: 0 }
  ]
})
</script>
