<template>
  <div
    class="glass-panel border-l-4 rounded-r-xl rounded-l-sm p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group transition-all duration-200"
    :class="[
      store.toAssign === 0 ? 'border-l-secondary bg-secondary/5' :
      store.toAssign > 0 ? 'border-l-tertiary bg-tertiary/5' : 'border-l-error bg-error/5'
    ]"
  >
    <div class="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent pointer-events-none"></div>
    <div class="flex flex-col gap-0.5 z-10">
      <span class="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Zero-Based Status</span>
      <div class="flex items-center gap-2 mt-0.5">
        <CheckCircle v-if="store.toAssign === 0" class="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
        <AlertCircle v-else-if="store.toAssign > 0" class="w-4 h-4 sm:w-5 sm:h-5 text-tertiary" />
        <AlertTriangle v-else class="w-4 h-4 sm:w-5 sm:h-5 text-error" />
        
        <span
          class="text-sm sm:text-base md:text-lg font-bold"
          :class="[
            store.toAssign === 0 ? 'text-secondary' :
            store.toAssign > 0 ? 'text-tertiary' : 'text-error'
          ]"
        >
          {{ store.toAssign === 0 ? 'Every Rupiah Has a Job!' : store.toAssign > 0 ? 'Ready to Allocate' : 'Over Allocated!' }}
        </span>
      </div>
    </div>
    
    <div class="flex items-center gap-3 sm:gap-6 md:gap-8 z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#464554]/20 pt-3 md:pt-0">
      <div class="flex flex-col text-right">
        <span class="text-[10px] sm:text-xs text-on-surface-variant font-medium">Total Planned Income</span>
        <span class="text-xs sm:text-sm font-bold text-on-surface mt-0.5">{{ settingsStore.formatIndonesianHuman(store.totalReadyToAssign) }}</span>
      </div>
      <div class="h-6 w-px bg-[#464554]/40"></div>
      <div class="flex flex-col text-right">
        <span class="text-[10px] sm:text-xs text-on-surface-variant font-medium">Total Assigned</span>
        <span class="text-xs sm:text-sm font-bold text-on-surface mt-0.5">{{ settingsStore.formatIndonesianHuman(store.totalAssigned) }}</span>
      </div>
      <div class="h-6 w-px bg-[#464554]/40"></div>
      <div class="flex flex-col text-right">
        <span
          class="text-[10px] sm:text-xs font-medium"
          :class="[
            store.toAssign === 0 ? 'text-secondary' :
            store.toAssign > 0 ? 'text-tertiary' : 'text-error'
          ]"
        >To Assign</span>
        <span
          class="text-sm sm:text-base md:text-xl font-extrabold mt-0.5 animate-pulse-slow"
          :class="[
            store.toAssign === 0 ? 'text-secondary' :
            store.toAssign > 0 ? 'text-tertiary' : 'text-error'
          ]"
        >
          {{ settingsStore.formatIndonesianHuman(store.toAssign) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { CheckCircle, AlertCircle, AlertTriangle } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()
</script>
