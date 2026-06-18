<template>
  <div
    ref="chartCardRef"
    class="glass-panel rounded-xl p-4 sm:p-5 flex flex-col items-center relative select-none"
    @mousemove="handleMouseMove"
  >
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

    <!-- Hover Subcategories Popover -->
    <Transition name="fade">
      <div
        v-if="hoveredSlice && hoveredSlice.subcategories && hoveredSlice.subcategories.length > 0"
        class="absolute bg-[#0b0f15]/95 backdrop-blur-md rounded-lg border border-[#464554]/60 p-2.5 z-50 flex flex-col justify-start pointer-events-none w-52 max-h-[160px] shadow-2xl transition-all duration-75"
        :style="{
          left: `${tooltipX}px`,
          top: `${tooltipY}px`
        }"
      >
        <div class="flex items-center justify-between border-b border-[#464554]/30 pb-1.5 mb-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: hoveredSlice.color }"></span>
            <span class="text-[10px] font-black text-on-surface truncate">{{ hoveredSlice.category }}</span>
          </div>
          <span class="text-[9px] font-bold text-primary flex-shrink-0 ml-1">{{ hoveredSlice.percentage }}%</span>
        </div>
        <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
          <div
            v-for="sub in hoveredSlice.subcategories"
            :key="sub.name"
            class="flex flex-col gap-0.5 border-b border-[#464554]/10 pb-1 last:border-none last:pb-0"
          >
            <div class="flex items-center justify-between text-[9px] text-on-surface-variant gap-2">
              <span class="font-semibold truncate pr-2">{{ sub.name }}</span>
              <span class="font-bold text-on-surface whitespace-nowrap">
                {{ settingsStore.formatIndonesianHuman(sub.amount) }}
              </span>
            </div>
            <!-- Visual subcategory mini progress bar -->
            <div class="w-full h-0.5 bg-[#1f1f27] rounded-full overflow-hidden mt-0.5">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{
                  backgroundColor: hoveredSlice.color,
                  width: `${Math.round((sub.amount / hoveredSlice.amount) * 100)}%`
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Custom Legend Grid -->
    <div class="w-full border-t border-[#464554]/20 pt-4">
      <div v-if="slices.length > 0" class="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div
          v-for="(slice, idx) in slices"
          :key="idx"
          class="flex items-center justify-between text-xs cursor-pointer"
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
      <div v-else class="flex justify-center py-2 text-[10px] text-on-surface-variant/75 italic">
        No transactions recorded this period
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
    validator: (value) => ['spending', 'savings', 'debt'].includes(value)
  }
})

const store = useBudgetStore()
const settingsStore = useSettingsStore()
const hoveredSlice = ref(null)

const chartCardRef = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)
const tooltipX = ref(0)
const tooltipY = ref(0)

const handleMouseMove = (event) => {
  if (!chartCardRef.value) return
  const rect = chartCardRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  mouseX.value = x
  mouseY.value = y
  
  // Tooltip dimensions
  const tooltipWidth = 208
  const tooltipHeight = 160
  
  // Card dimensions
  const cardWidth = rect.width
  const cardHeight = rect.height
  
  // Position offsets
  let posX = x + 12
  let posY = y + 12
  
  // boundary checks
  if (posX + tooltipWidth > cardWidth) {
    posX = x - tooltipWidth - 12
  }
  if (posY + tooltipHeight > cardHeight) {
    posY = y - tooltipHeight - 12
  }
  
  // clamp
  tooltipX.value = Math.max(8, Math.min(posX, cardWidth - tooltipWidth - 8))
  tooltipY.value = Math.max(8, Math.min(posY, cardHeight - tooltipHeight - 8))
}

const isSpending = computed(() => props.type === 'spending')
const isSavings = computed(() => props.type === 'savings')

const title = computed(() => {
  if (isSpending.value) return 'Spending Breakdown'
  if (isSavings.value) return 'Savings Breakdown'
  return 'Debt Breakdown'
})

const centerLabel = computed(() => {
  if (isSpending.value) return 'Spent'
  if (isSavings.value) return 'Saved'
  return 'Paid'
})

const slices = computed(() => {
  if (isSpending.value) return store.spendingSlices
  if (isSavings.value) return store.savingsSlices
  return store.debtSlices
})

const totalAmount = computed(() => {
  if (isSpending.value) return store.totalActualSpending
  if (isSavings.value) return store.totalSavings
  return store.totalDebtPaid
})

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
