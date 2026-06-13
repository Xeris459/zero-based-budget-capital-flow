<template>
  <div
    class="fixed top-0 left-0 right-0 h-8 bg-[#0b0f15]/80 backdrop-blur-md border-b border-[#464554]/30 flex justify-between items-center z-[2000] select-none"
    data-tauri-drag-region
  >
    <!-- App Logo & Title -->
    <div class="flex items-center gap-2 px-3 pointer-events-none">
      <Landmark class="w-3.5 h-3.5 text-primary" />
      <span class="text-[10px] font-extrabold text-primary tracking-wider uppercase">Capital Flow</span>
    </div>

    <!-- Window Controls -->
    <div class="flex items-center h-full">
      <!-- Minimize -->
      <button
        @click="minimizeWindow"
        class="w-11 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-bright/20 hover:text-on-surface transition-colors duration-150 cursor-pointer"
        title="Minimize"
      >
        <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 10 10">
          <line x1="1" y1="5" x2="9" y2="5" />
        </svg>
      </button>

      <!-- Maximize/Restore — hover triggers Windows Snap overlay, click toggles maximize -->
      <button
        ref="maximizeBtn"
        @click="toggleMaximize"
        @mouseenter="showSnap"
        class="w-11 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-bright/20 hover:text-on-surface transition-colors duration-150 cursor-pointer"
        :title="isMaximized ? 'Restore' : 'Maximize'"
      >
        <!-- Restore Icon (Overlapping squares) -->
        <svg v-if="isMaximized" class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 10 10">
          <path d="M3,1.5 H8.5 V7 H7 M1.5,3 H7 V8.5 H1.5 Z" />
        </svg>
        <!-- Maximize Icon (Single square) -->
        <svg v-else class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 10 10">
          <rect x="1.5" y="1.5" width="7" height="7" />
        </svg>
      </button>

      <!-- Close -->
      <button
        @click="closeWindow"
        class="w-11 h-8 flex items-center justify-center text-on-surface-variant hover:bg-error hover:text-white transition-colors duration-150 cursor-pointer"
        title="Close"
      >
        <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 10 10">
          <path d="M1.5,1.5 L8.5,8.5 M8.5,1.5 L1.5,8.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Landmark } from '@lucide/vue'
import { useSettingsStore } from '~/stores/settings'

const settingsStore = useSettingsStore()
const isMaximized = ref(false)
const maximizeBtn = ref(null)
let appWindow = null
let unlistenResized = null

const minimizeWindow = async () => {
  if (appWindow) {
    await appWindow.minimize()
  }
}

const toggleMaximize = async () => {
  if (appWindow) {
    await appWindow.toggleMaximize()
  }
}

const closeWindow = async () => {
  if (appWindow) {
    await appWindow.close()
  }
}

// Trigger Windows 11 Snap Layout overlay on hover of the maximize button
const showSnap = async () => {
  if (!maximizeBtn.value) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const rect = maximizeBtn.value.getBoundingClientRect()
    await invoke('plugin:decorum|show_snap_overlay', {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    })
  } catch {
    // decorum not available or not Windows 11 - silently ignore
  }
}

onMounted(async () => {
  const isTauriEnv = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__
  if (isTauriEnv || settingsStore.isTauri) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      appWindow = getCurrentWindow()

      // Initialize maximized state
      isMaximized.value = await appWindow.isMaximized()

      // Listen to resize events to sync icon
      unlistenResized = await appWindow.onResized(async () => {
        isMaximized.value = await appWindow.isMaximized()
      })
    } catch (e) {
      console.error('Failed to initialize Tauri window APIs:', e)
    }
  }
})

onBeforeUnmount(() => {
  if (unlistenResized) {
    unlistenResized()
  }
})
</script>
