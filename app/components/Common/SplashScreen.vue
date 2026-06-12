<template>
  <div
    class="fixed inset-0 z-[1000] bg-[#0b0f15] flex flex-col items-center justify-center transition-all duration-500 ease-out"
    :class="{ 'opacity-0 scale-95 pointer-events-none': isFading }"
  >
    <!-- Background Aura Glow -->
    <div class="absolute w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>

    <!-- Content Wrapper -->
    <div class="relative flex flex-col items-center gap-6 select-none">
      <!-- Icon -->
      <div class="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5 animate-bounce-slow">
        <Landmark class="w-8 h-8 text-primary" />
      </div>

      <!-- Branding Text -->
      <div class="text-center flex flex-col items-center">
        <h1 class="text-glow text-3xl font-black text-primary tracking-tight">Capital Flow</h1>
        <p class="text-[9px] text-on-surface-variant mt-1.5 font-bold uppercase tracking-[0.25em]">
          Wealth Management
        </p>
      </div>

      <!-- Glowing Progress Bar -->
      <div class="mt-6 flex flex-col items-center gap-2">
        <div class="w-44 h-1.5 bg-surface-variant/45 rounded-full overflow-hidden border border-[#464554]/20 relative">
          <div
            class="h-full bg-primary rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(192,193,255,0.8)]"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <span class="text-[9px] text-on-surface-variant font-bold tracking-wider uppercase opacity-60">
          Loading Data... {{ Math.round(progress) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Landmark } from '@lucide/vue'

const emit = defineEmits(['finish'])

const progress = ref(0)
const isFading = ref(false)

onMounted(() => {
  // Smoothly increment progress
  const duration = 1500 // 1.5 seconds
  const intervalTime = 20
  const steps = duration / intervalTime
  const increment = 100 / steps
  
  const timer = setInterval(() => {
    if (progress.value < 100) {
      progress.value = Math.min(progress.value + increment, 100)
    } else {
      clearInterval(timer)
      // Start fade out
      isFading.value = true
      // Unmount after fade finishes (500ms)
      setTimeout(() => {
        emit('finish')
      }, 500)
    }
  }, intervalTime)
})
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounceSlow 3s infinite ease-in-out;
}
@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
