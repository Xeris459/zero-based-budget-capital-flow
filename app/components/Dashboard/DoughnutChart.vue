<template>
  <div class="glass-panel rounded-xl p-card-padding flex flex-col items-center relative select-none">
    <div class="w-full flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-on-surface">{{ title }}</h3>
      <span class="text-[9px] font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
        {{ periodLabel }}
      </span>
    </div>

    <!-- Chart Canvas -->
    <div class="relative w-44 h-44 flex items-center justify-center mb-6">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <!-- Background Circle -->
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1f1f27" stroke-width="12" />

        <!-- Slices -->
        <circle
          v-for="(slice, idx) in slices"
          :key="idx"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          :stroke="slice.color"
          stroke-width="12"
          :stroke-dasharray="`${slice.dash} 251.2`"
          :stroke-dashoffset="`-${slice.offset}`"
          class="transition-all duration-300 cursor-pointer origin-center hover:scale-105 hover:stroke-[14px]"
          @mouseenter="hoveredSlice = slice"
          @mouseleave="hoveredSlice = null"
        />
      </svg>

      <!-- Center Text Overlay -->
      <div class="absolute flex flex-col items-center text-center px-4 pointer-events-none">
        <span class="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{{ activeLabel }}</span>
        <span class="text-xs font-black text-on-surface mt-0.5 truncate max-w-[120px] text-glow">
          {{ activeValue }}
        </span>
        <span v-if="hoveredSlice" class="text-[9px] font-extrabold text-primary mt-0.5">
          {{ hoveredSlice.percentage }}%
        </span>
      </div>
    </div>

    <!-- Custom Legend Grid -->
    <div class="w-full grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-[#464554]/20 pt-4">
      <div
        v-for="(slice, idx) in slices"
        :key="idx"
        class="flex items-center justify-between text-xs"
        @mouseenter="hoveredSlice = slice"
        @mouseleave="hoveredSlice = null"
        :class="{ 'opacity-40': hoveredSlice && hoveredSlice.category !== slice.category }"
      >
        <div class="flex items-center gap-2 truncate">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: slice.color }"></span>
          <span class="text-[10px] text-on-surface-variant font-semibold truncate">{{ slice.category }}</span>
        </div>
        <span class="text-[10px] font-bold text-on-surface ml-1">
          {{ settingsStore.formatIndonesianHuman(slice.amount) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps({
  type: {
    type: String,
    default: 'spending',
    validator: (value) => ['spending', 'savings'].includes(value)
  }
})

const store = useBudgetStore()
const settingsStore = useSettingsStore()
const hoveredSlice = ref(null)

const isSpending = computed(() => props.type === 'spending')

const title = computed(() => isSpending.value ? 'Spending Breakdown' : 'Savings Breakdown')
const centerLabel = computed(() => isSpending.value ? 'Spent' : 'Total')

const slices = computed(() => isSpending.value ? store.spendingSlices : store.savingsSlices)
const totalAmount = computed(() => isSpending.value ? store.totalActualSpending : store.totalSavings)

const activeLabel = computed(() => {
  return hoveredSlice.value ? hoveredSlice.value.category : centerLabel.value
})

const activeValue = computed(() => {
  return hoveredSlice.value 
    ? `Rp ${hoveredSlice.value.amount.toLocaleString('id-ID')}` 
    : settingsStore.formatIndonesianHuman(totalAmount.value)
})

const periodLabel = computed(() => {
  if (settingsStore.filterType === 'yearly') {
    return settingsStore.currentYear
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIdx = parseInt(settingsStore.currentMonth) - 1
  return `${months[monthIdx] || 'Month'} ${settingsStore.currentYear}`
})
</script>
