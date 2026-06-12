<template>
  <div class="glass-panel rounded-xl p-card-padding flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-on-surface">Income Overview</h3>
      <span class="text-[10px] font-semibold text-primary hover:underline cursor-pointer" @click="navigateToPlanner">Manage</span>
    </div>
    <div class="flex flex-col gap-4">
      <div v-for="inc in store.incomeSources" :key="inc.id">
        <div class="flex justify-between items-end mb-1">
          <span class="text-xs text-on-surface font-medium">{{ inc.name }}</span>
          <span class="text-xs text-on-surface-variant font-bold">
            {{ settingsStore.formatIndonesianHuman(inc.actual) }} / {{ settingsStore.formatIndonesianHuman(inc.planned) }}
          </span>
        </div>
        <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
          <div
            class="h-full bg-secondary rounded-full"
            :style="{ width: `${Math.min(inc.planned > 0 ? (inc.actual/inc.planned)*100 : 0, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { useRouter } from '#imports'

const store = useBudgetStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const navigateToPlanner = () => {
  router.push('/planner')
}
</script>
