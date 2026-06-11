<template>
  <aside class="fixed left-0 top-0 h-screen w-[280px] bg-[#1f1f27]/80 backdrop-blur-xl border-r border-[#464554]/30 flex flex-col py-6 z-50">
    <!-- Logo -->
    <div class="px-6 pb-6 mb-4">
      <h1 class="text-xl font-extrabold text-glow text-primary flex items-center gap-2">
        <Landmark class="w-6 h-6 text-primary" />
        Capital Flow
      </h1>
      <p class="text-xs text-on-surface-variant mt-1 font-semibold uppercase tracking-wider">Wealth Management</p>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto px-4">
      <ul class="space-y-1.5">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
            :class="[
              route.path === item.path
                ? 'bg-primary/15 text-primary border-l-4 border-primary pl-3'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20 border-l-4 border-transparent'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" :class="{ 'fill-primary/20': route.path === item.path }" />
            <span class="font-body-md font-semibold">{{ item.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Footer Controls & Profile -->
    <div class="px-4 py-4 border-t border-[#464554]/30 mt-auto">
      <!-- K-Mode Redenomination Toggle -->
      <div class="flex items-center justify-between bg-surface-container-high rounded-xl p-3 mb-4">
        <span class="text-xs font-semibold text-on-surface">Redenomination (K)</span>
        <button
          @click="store.toggleKMode()"
          class="w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          :class="[store.kMode ? 'bg-primary' : 'bg-surface-variant']"
        >
          <span
            class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
            :class="[store.kMode ? 'right-1' : 'left-1']"
          ></span>
        </button>
      </div>

      <!-- Quick Settings / Help -->
      <ul class="space-y-1">
        <li>
          <a href="#" class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20 transition-colors rounded-lg">
            <Settings class="w-4 h-4" />
            <span class="text-xs font-medium">Settings</span>
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20 transition-colors rounded-lg">
            <HelpCircle class="w-4 h-4" />
            <span class="text-xs font-medium">Support</span>
          </a>
        </li>
      </ul>

      <!-- User Profile Card -->
      <div class="mt-4 flex items-center gap-3 px-2">
        <div class="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-[#464554]/50 flex items-center justify-center">
          <span class="font-bold text-primary text-sm">AM</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-semibold text-on-surface">Alex Mercer</span>
          <span class="text-[10px] text-on-surface-variant font-medium">Pro Plan</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useRoute } from '#imports'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Landmark,
  Settings,
  HelpCircle
} from '@lucide/vue'

const store = useBudgetStore()
const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Budget Planner', path: '/planner', icon: Wallet },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Accounts', path: '/accounts', icon: Landmark }
]
</script>
