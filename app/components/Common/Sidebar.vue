<template>
  <aside
    class="hidden md:flex fixed left-0 top-0 h-screen bg-[#1f1f27]/80 backdrop-blur-xl border-r border-[#464554]/30 flex-col py-3 z-50 transition-all duration-300 select-none overflow-visible"
    :class="[settingsStore.isSidebarCollapsed ? 'w-[50px]' : 'w-[180px]']"
  >
    <!-- Logo / Brand Header -->
    <div class="px-3 pb-3 mb-2 flex flex-col animate-fade-in" :class="{ 'items-center': settingsStore.isSidebarCollapsed }">
      <h1 class="text-xs font-extrabold text-glow text-primary flex items-center gap-1.5">
        <Landmark class="w-4 h-4 text-primary flex-shrink-0" />
        <span v-if="!settingsStore.isSidebarCollapsed" class="transition-opacity duration-200">Capital Flow</span>
      </h1>
      <p v-if="!settingsStore.isSidebarCollapsed" class="text-[8px] text-on-surface-variant mt-0.5 font-bold uppercase tracking-wider transition-opacity duration-200">
        Wealth Management
      </p>
    </div>

    <!-- Navigation Links -->
    <nav
      class="flex-1 px-1.5 scrollbar-none transition-all duration-300"
      :class="[settingsStore.isSidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto']"
    >
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.path" class="relative group">
          <NuxtLink
            :to="item.path"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200"
            :class="[
              route.path === item.path
                ? 'bg-primary/15 text-primary border-l-2 border-primary pl-1.5'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/10 border-l-2 border-transparent',
              settingsStore.isSidebarCollapsed ? 'justify-center !px-0.5 border-l-0 border-transparent' : ''
            ]"
          >
            <component :is="item.icon" class="w-3.5 h-3.5 flex-shrink-0" :class="{ 'fill-primary/20': route.path === item.path }" />
            <span v-if="!settingsStore.isSidebarCollapsed" class="text-[11px] font-semibold transition-opacity duration-200">{{ item.name }}</span>
          </NuxtLink>

          <!-- Hover Tooltip (Only shown when collapsed) -->
          <div
            v-if="settingsStore.isSidebarCollapsed"
            class="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2 py-1 bg-[#1f1f27] border border-[#464554]/60 text-on-surface text-[9px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] translate-x-2 group-hover:translate-x-0"
          >
            {{ item.name }}
          </div>
        </li>
      </ul>
    </nav>

    <!-- Footer Controls & Profile -->
    <div class="px-1.5 py-2.5 border-t border-[#464554]/30 mt-auto flex flex-col" :class="{ 'items-center': settingsStore.isSidebarCollapsed }">
      
      <!-- K-Mode Redenomination Toggle -->
      <div
        class="flex items-center rounded-md p-1.5 mb-2 transition-all duration-300 w-full"
        :class="[
          settingsStore.isSidebarCollapsed ? 'justify-center bg-transparent !p-0 mb-3' : 'justify-between bg-surface-container-high'
        ]"
      >
        <span v-if="!settingsStore.isSidebarCollapsed" class="text-[9px] font-semibold text-on-surface transition-opacity duration-200">
          Redenomination (K)
        </span>
        
        <!-- Toggle button with tooltip if collapsed -->
        <div class="relative group">
          <button
            @click="settingsStore.toggleKMode()"
            class="w-7 h-4 rounded-full relative transition-colors focus:outline-none"
            :class="[settingsStore.kMode ? 'bg-primary' : 'bg-surface-variant']"
          >
            <span
              class="absolute top-0.5 w-3 h-3 bg-background rounded-full transition-all duration-200"
              :class="[settingsStore.kMode ? 'right-0.5' : 'left-0.5']"
            ></span>
          </button>
          
          <!-- Tooltip for K Mode if collapsed -->
          <div
            v-if="settingsStore.isSidebarCollapsed"
            class="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2 py-1 bg-[#1f1f27] border border-[#464554]/60 text-on-surface text-[9px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] translate-x-2 group-hover:translate-x-0"
          >
            Redenomination Mode: {{ settingsStore.kMode ? 'Aktif' : 'Nonaktif' }}
          </div>
        </div>
      </div>

      <!-- Quick Settings / (No Support Menu) -->
      <ul class="space-y-1 w-full mb-2.5">
        <li class="relative group">
          <NuxtLink
            to="/settings"
            class="flex items-center gap-1.5 px-2.5 py-1.5 transition-colors rounded-md"
            :class="[
              route.path === '/settings'
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/10',
              settingsStore.isSidebarCollapsed ? 'justify-center !px-0.5' : ''
            ]"
          >
            <Settings class="w-3.5 h-3.5 flex-shrink-0" />
            <span v-if="!settingsStore.isSidebarCollapsed" class="text-[10px] font-medium transition-opacity duration-200">Settings</span>
          </NuxtLink>

          <!-- Settings Tooltip -->
          <div
            v-if="settingsStore.isSidebarCollapsed"
            class="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2 py-1 bg-[#1f1f27] border border-[#464554]/60 text-on-surface text-[9px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] translate-x-2 group-hover:translate-x-0"
          >
            System Settings
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { useSettingsStore } from '~/stores/settings'
import { useRoute } from '#imports'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Landmark,
  Settings
} from '@lucide/vue'

const settingsStore = useSettingsStore()
const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Budget Planner', path: '/planner', icon: Wallet },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Accounts', path: '/accounts', icon: Landmark }
]
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
