<template>
  <div class="bg-background text-on-background min-h-screen overflow-x-hidden font-sans select-none antialiased">
    <!-- Left Sidebar -->
    <CommonSidebar v-if="!securityStore.isLocked" />

    <!-- Top Header -->
    <header
      v-if="!securityStore.isLocked"
      class="fixed top-0 right-0 h-16 bg-surface/50 backdrop-blur-md border-b border-[#464554]/30 flex justify-between items-center px-4 md:px-8 z-40 transition-all duration-300"
      :style="{ width: isMobile ? '100%' : (settingsStore.isSidebarCollapsed ? 'calc(100% - 50px)' : 'calc(100% - 180px)') }"
    >
      <div class="flex items-center gap-6">
        <!-- Collapse Sidebar Toggle Button -->
        <button
          v-if="!isMobile"
          @click="settingsStore.isSidebarCollapsed = !settingsStore.isSidebarCollapsed; settingsStore.saveSettings()"
          class="hidden md:flex p-2 -ml-2 rounded-lg hover:bg-surface-bright/20 text-on-surface-variant hover:text-primary transition-all active:scale-90 items-center justify-center cursor-pointer"
          title="Toggle Sidebar"
        >
          <ChevronRight v-if="settingsStore.isSidebarCollapsed" class="w-5 h-5" />
          <ChevronLeft v-else class="w-5 h-5" />
        </button>

        <!-- Title and Switcher -->
        <span class="text-lg font-bold text-primary tracking-tight hidden lg:block">Capital Flow</span>
        
        <div class="flex items-center gap-4 h-full">
          <!-- Month/Year Segmented Toggle (Hidden on Planner page) -->
          <div v-if="route.path !== '/planner'" class="flex bg-[#1b1c23]/60 rounded-lg p-0.5 border border-[#464554]/30 select-none">
            <button
              @click="settingsStore.setFilterType('monthly')"
              :class="[
                'px-2 py-0.5 text-[10px] font-extrabold rounded-md transition-all cursor-pointer whitespace-nowrap',
                settingsStore.filterType === 'monthly' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              ]"
            >
              Month
            </button>
            <button
              @click="settingsStore.setFilterType('yearly')"
              :class="[
                'px-2 py-0.5 text-[10px] font-extrabold rounded-md transition-all cursor-pointer whitespace-nowrap',
                settingsStore.filterType === 'yearly' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              ]"
            >
              Year
            </button>
          </div>

          <!-- Year Selector -->
          <div class="relative flex items-center">
            <select
              v-model="settingsStore.currentYear"
              @change="settingsStore.saveSettings()"
              class="appearance-none bg-none bg-transparent border-none text-primary font-bold text-sm pr-6 py-1 focus:ring-0 cursor-pointer border-b border-primary rounded-none"
            >
              <option class="bg-[#1f1f27] text-on-surface" value="2026">2026</option>
              <option class="bg-[#1f1f27] text-on-surface" value="2025">2025</option>
            </select>
            <ChevronDown class="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
          </div>

          <!-- Month Selector -->
          <div v-if="settingsStore.filterType === 'monthly' || route.path === '/planner'" class="relative flex items-center">
            <select
              v-model="settingsStore.currentMonth"
              @change="settingsStore.saveSettings()"
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

      <div class="flex items-center gap-4 text-on-surface-variant relative">
        <!-- Bell Button -->
        <button
          @click="openNotifications"
          class="hover:text-primary transition-all p-2 rounded-full hover:bg-surface-bright/20 relative"
          title="View Alerts"
        >
          <Bell class="w-5 h-5 text-on-surface-variant" />
          <span v-if="hasUnreadAlerts" class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-ping"></span>
          <span v-if="hasUnreadAlerts" class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>

        <!-- Slide-Over Side Sheet for Notifications -->
        <Teleport to="body">
          <div v-if="showNotifications" class="fixed inset-0 z-[100] flex justify-end">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-[#0b0f15]/80 backdrop-blur-sm transition-opacity" @click="showNotifications = false"></div>

            <!-- Sheet Panel -->
            <div class="relative w-80 sm:w-96 bg-[#1f1f27] border-l border-[#464554] shadow-2xl z-10 flex flex-col p-6 h-full transform transition-transform duration-300">
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-[#464554]/30 pb-4 mb-4">
                <div class="flex items-center gap-2">
                  <Bell class="w-5 h-5 text-primary" />
                  <span class="text-md font-bold text-on-surface">Active Alerts</span>
                </div>
                <button
                  @click="showNotifications = false"
                  class="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 hover:bg-surface-bright/20 rounded-full"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Body -->
              <div class="flex-1 overflow-y-auto space-y-3 pr-1">
                <div
                  v-for="alert in store.activeAlerts"
                  :key="alert.id"
                  class="flex gap-3 p-3 rounded-lg hover:bg-surface-variant/20 border border-[#464554]/10 transition-colors"
                >
                  <span
                    class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                    :class="[
                      alert.type === 'error' ? 'bg-error animate-pulse' :
                      alert.type === 'warning' ? 'bg-tertiary animate-pulse' :
                      alert.type === 'success' ? 'bg-secondary' : 'bg-primary'
                    ]"
                  ></span>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-on-surface">{{ alert.title }}</span>
                    <span class="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{{ alert.description }}</span>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="border-t border-[#464554]/30 pt-4 mt-auto">
                <button
                  @click="clearAlertBadge"
                  class="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all duration-200"
                >
                  Mark All as Read
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </header>

    <!-- Main Content Area -->
    <main
      class="transition-all duration-300"
      :class="[!securityStore.isLocked ? (isMobile ? 'ml-0 pt-[72px] px-4 pb-20' : (settingsStore.isSidebarCollapsed ? 'ml-[50px] pt-[88px] px-8 pb-12' : 'ml-[180px] pt-[88px] px-8 pb-12')) : 'flex items-center justify-center min-h-screen w-full']"
    >
      <NuxtPage v-if="!securityStore.isLocked" />
      <CommonLockScreen v-else />
    </main>

    <!-- Bottom Nav for Mobile -->
    <CommonBottomNav v-if="!securityStore.isLocked && isMobile" />

    <!-- Splash Screen on First Load -->
    <CommonSplashScreen v-if="showSplash" @finish="showSplash = false" />
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSecurityStore } from '~/stores/security'
import { useSettingsStore } from '~/stores/settings'
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { ChevronDown, Bell, X, ChevronLeft, ChevronRight } from '@lucide/vue'

const store = useBudgetStore()
const securityStore = useSecurityStore()
const settingsStore = useSettingsStore()
const route = useRoute()
const showNotifications = ref(false)
const userOpenedNotifications = ref(false)
const isMobile = ref(false)
const showSplash = ref(true)

const openNotifications = () => {
  showNotifications.value = true
  userOpenedNotifications.value = true
}

const hasUnreadAlerts = computed(() => {
  if (userOpenedNotifications.value) return false
  return store.activeAlerts.some(a => a.type === 'error' || a.type === 'warning')
})

const clearAlertBadge = () => {
  userOpenedNotifications.value = true
  showNotifications.value = false
}

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
}

onMounted(() => {
  securityStore.loadState()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>

<style scoped>
/* Page transition styles */
</style>
