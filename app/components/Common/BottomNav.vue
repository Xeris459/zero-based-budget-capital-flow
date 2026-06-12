<template>
  <nav class="fixed bottom-0 left-0 right-0 h-14 bg-[#1f1f27]/90 backdrop-blur-xl border-t border-[#464554]/30 z-50 flex justify-around items-center px-2 shadow-lg select-none">
    <NuxtLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="flex flex-col items-center justify-center flex-1 py-1 px-2 text-on-surface-variant transition-all duration-200"
      :class="[
        route.path === item.path
          ? 'text-primary font-bold'
          : 'hover:text-on-surface'
      ]"
    >
      <div class="relative flex items-center justify-center">
        <component
          :is="item.icon"
          class="w-5 h-5 transition-transform"
          :class="[
            route.path === item.path ? 'scale-110 text-primary' : 'text-on-surface-variant'
          ]"
        />
        <!-- Small dot active indicator -->
        <span
          v-if="route.path === item.path"
          class="absolute -bottom-1.5 w-1 h-1 bg-primary rounded-full"
        ></span>
      </div>
      <span class="text-[9px] mt-1 font-semibold tracking-wider transition-opacity duration-200">
        {{ item.name }}
      </span>
    </NuxtLink>
  </nav>
</template>

<script setup>
import { useRoute } from '#imports'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Landmark,
  Settings
} from '@lucide/vue'

const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Planner', path: '/planner', icon: Wallet },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Accounts', path: '/accounts', icon: Landmark },
  { name: 'Settings', path: '/settings', icon: Settings }
]
</script>
