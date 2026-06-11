<template>
  <div class="bg-background text-on-background min-h-screen overflow-x-hidden font-sans select-none antialiased">
    <!-- Left Sidebar -->
    <CommonSidebar />

    <!-- Top Header -->
    <header class="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface/50 backdrop-blur-md border-b border-[#464554]/30 flex justify-between items-center px-8 z-40">
      <div class="flex items-center gap-6">
        <!-- Title and Switcher -->
        <span class="text-lg font-bold text-primary tracking-tight hidden lg:block">Capital Flow</span>
        
        <div class="flex items-center gap-4 h-full">
          <!-- Year Selector -->
          <div class="relative flex items-center">
            <select
              v-model="store.currentYear"
              @change="store.saveState"
              class="appearance-none bg-none bg-transparent border-none text-primary font-bold text-sm pr-6 py-1 focus:ring-0 cursor-pointer border-b border-primary rounded-none"
            >
              <option class="bg-[#1f1f27] text-on-surface" value="2026">2026</option>
              <option class="bg-[#1f1f27] text-on-surface" value="2025">2025</option>
            </select>
            <ChevronDown class="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
          </div>

          <!-- Month Selector -->
          <div class="relative flex items-center">
            <select
              v-model="store.currentMonth"
              @change="store.saveState"
              class="appearance-none bg-none bg-transparent border-none text-primary font-bold text-sm pr-6 py-1 focus:ring-0 cursor-pointer border-b border-primary rounded-none"
            >
              <option class="bg-[#1f1f27] text-on-surface" value="01">Jan</option>
              <option class="bg-[#1f1f27] text-on-surface" value="02">Feb</option>
              <option class="bg-[#1f1f27] text-on-surface" value="03">Mar</option>
              <option class="bg-[#1f1f27] text-on-surface" value="04">Apr</option>
              <option class="bg-[#1f1f27] text-on-surface" value="05">May</option>
              <option class="bg-[#1f1f27] text-on-surface" value="06">Jun</option>
              <option class="bg-[#1f1f27] text-on-surface" value="07">Jul</option>
              <option class="bg-[#1f1f27] text-on-surface" value="08">Aug</option>
              <option class="bg-[#1f1f27] text-on-surface" value="09">Sep</option>
              <option class="bg-[#1f1f27] text-on-surface" value="10">Oct</option>
              <option class="bg-[#1f1f27] text-on-surface" value="11">Nov</option>
              <option class="bg-[#1f1f27] text-on-surface" value="12">Dec</option>
            </select>
            <ChevronDown class="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 text-on-surface-variant">
        <button class="hover:text-primary transition-all p-2 rounded-full hover:bg-surface-bright/20 relative">
          <Bell class="w-5 h-5 text-on-surface-variant" />
          <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="ml-[280px] pt-[88px] px-8 pb-12">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { onMounted } from 'vue'
import { ChevronDown, Bell } from '@lucide/vue'

const store = useBudgetStore()

onMounted(() => {
  store.loadState()
})
</script>
