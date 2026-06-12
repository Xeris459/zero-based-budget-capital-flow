<template>
  <div ref="chartCardRef" class="glass-panel rounded-xl p-4 sm:p-5 flex flex-col relative">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
      <h3 class="text-xs sm:text-sm font-bold text-on-surface">Budget Tracking (May - Dec {{ settingsStore.currentYear }})</h3>
      <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 bg-secondary"></div>
          <span class="text-[9px] sm:text-[10px] text-on-surface-variant font-bold">Income</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 bg-primary"></div>
          <span class="text-[9px] sm:text-[10px] text-on-surface-variant font-bold">Spending</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 bg-tertiary"></div>
          <span class="text-[9px] sm:text-[10px] text-on-surface-variant font-bold">Savings</span>
        </div>
        <!-- Mobile Scroll Toggle -->
        <div class="flex items-center gap-1.5 md:hidden border-l border-[#464554]/30 pl-3">
          <span class="text-[9px] text-on-surface-variant font-bold">Scrollable</span>
          <button
            @click="isScrollable = !isScrollable"
            class="w-7 h-4 rounded-full relative transition-colors focus:outline-none"
            :class="[isScrollable ? 'bg-primary' : 'bg-surface-variant']"
          >
            <span
              class="absolute top-0.5 w-3 h-3 bg-background rounded-full transition-all duration-200"
              :class="[isScrollable ? 'right-0.5' : 'left-0.5']"
            ></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Visual Bar Chart Wrapper -->
    <div class="flex-1 w-full overflow-x-auto scrollbar-none">
      <div
        class="flex items-end justify-between pt-14 pb-2 h-[200px] sm:h-[260px] transition-all duration-300"
        :class="[isScrollable ? 'min-w-[480px] gap-4' : 'w-full gap-1.5 sm:gap-2 px-1']"
      >
        <div v-for="bar in store.barData" :key="bar.label" class="flex flex-col items-center gap-2 flex-1">
          <div class="flex items-end justify-center w-full h-44 relative gap-[3px] px-1">
            <!-- Income bar -->
            <div
              class="relative w-1/3 h-full flex items-end justify-center cursor-pointer"
              @mouseenter="hoveredBarLabel = bar.label; hoveredType = 'income'; hoveredValue = bar.actIncVal"
              @mouseleave="hoveredBarLabel = null; hoveredType = null; hoveredValue = 0"
              @mousemove="handleMouseMove"
            >
              <div class="absolute w-full bg-secondary/30" :style="{ height: `${bar.expInc}%` }"></div>
              <div class="relative w-full bg-secondary transition-all duration-300 hover:brightness-110" :style="{ height: `${bar.actInc}%` }"></div>
            </div>
            <!-- Spent bar -->
            <div
              class="relative w-1/3 h-full flex items-end justify-center cursor-pointer"
              @mouseenter="hoveredBarLabel = bar.label; hoveredType = 'spending'; hoveredValue = bar.actExpVal"
              @mouseleave="hoveredBarLabel = null; hoveredType = null; hoveredValue = 0"
              @mousemove="handleMouseMove"
            >
              <div class="absolute w-full bg-primary/30" :style="{ height: `${bar.expExp}%` }"></div>
              <div class="relative w-full bg-primary transition-all duration-300 hover:brightness-110" :style="{ height: `${bar.actExp}%` }"></div>
            </div>
            <!-- Savings bar -->
            <div
              class="relative w-1/3 h-full flex items-end justify-center cursor-pointer"
              @mouseenter="hoveredBarLabel = bar.label; hoveredType = 'savings'; hoveredValue = bar.actSavVal"
              @mouseleave="hoveredBarLabel = null; hoveredType = null; hoveredValue = 0"
              @mousemove="handleMouseMove"
            >
              <div class="absolute w-full bg-tertiary/30" :style="{ height: `${bar.expSav}%` }"></div>
              <div class="relative w-full bg-tertiary transition-all duration-300 hover:brightness-110" :style="{ height: `${bar.actSav}%` }"></div>
            </div>
          </div>
          <span class="text-[10px] text-on-surface-variant font-bold" :class="{ 'text-primary': bar.label === activeMonthLabel }">{{ bar.label }}</span>
        </div>
      </div>
    </div>
    
    <div class="flex justify-center items-center gap-6 mt-4 sm:mt-6 border-t border-[#464554]/20 pt-3 sm:pt-4">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-surface-variant border border-[#464554]/40"></div>
        <span class="text-[10px] text-on-surface-variant font-medium">Expected (Ghost)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-primary"></div>
        <span class="text-[10px] text-on-surface-variant font-medium">Actual (Solid)</span>
      </div>
    </div>

    <!-- Floating Global Tooltip following the mouse cursor -->
    <div
      v-if="hoveredBarLabel"
      class="absolute bg-[#1f1f27]/95 border border-[#464554]/80 rounded-lg py-1.5 px-3 z-50 text-[10px] pointer-events-none whitespace-nowrap shadow-2xl flex flex-col items-center backdrop-blur-sm transition-all duration-75"
      :style="{
        left: `${mouseX + 12}px`,
        top: `${mouseY - 48}px`
      }"
    >
      <span :class="[hoveredTypeColorClass, 'font-bold']">{{ hoveredTypeName }}</span>
      <span class="text-on-surface font-extrabold mt-0.5">Rp {{ hoveredValue.toLocaleString('id-ID') }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'

const store = useBudgetStore()
const settingsStore = useSettingsStore()
const chartCardRef = ref(null)
const isScrollable = ref(true)

const hoveredBarLabel = ref(null)
const hoveredType = ref(null)
const hoveredValue = ref(0)

const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (event) => {
  if (!chartCardRef.value) return
  const rect = chartCardRef.value.getBoundingClientRect()
  mouseX.value = event.clientX - rect.left
  mouseY.value = event.clientY - rect.top
}

const hoveredTypeName = computed(() => {
  if (hoveredType.value === 'income') return 'Income'
  if (hoveredType.value === 'spending') return 'Spending'
  if (hoveredType.value === 'savings') return 'Savings'
  return ''
})

const hoveredTypeColorClass = computed(() => {
  if (hoveredType.value === 'income') return 'text-secondary'
  if (hoveredType.value === 'spending') return 'text-primary'
  if (hoveredType.value === 'savings') return 'text-tertiary'
  return ''
})

const activeMonthLabel = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIdx = parseInt(settingsStore.currentMonth) - 1
  return months[monthIdx] || ''
})
</script>
