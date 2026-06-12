<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-[#0b0f15]/80 backdrop-blur-sm transition-opacity" @click="close"></div>

        <!-- Modal Content Box -->
        <div
          class="relative w-full glass-panel bg-[#1f1f27]/90 rounded-2xl p-6 shadow-2xl z-10 border border-[#464554]/40 transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]"
          :class="[
            size === '2xl' ? 'max-w-2xl' :
            size === '3xl' ? 'max-w-3xl' :
            size === 'xl' ? 'max-w-xl' :
            'max-w-lg'
          ]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 border-b border-[#464554]/30 pb-3">
            <h3 class="text-lg font-bold text-on-surface flex items-center gap-2">
              <slot name="header">Title</slot>
            </h3>
            <button @click="close" class="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 hover:bg-surface-bright/20 rounded-full">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto pr-1">
            <slot name="body"></slot>
          </div>

          <!-- Footer -->
          <div class="mt-6 flex justify-end gap-3 border-t border-[#464554]/30 pt-4">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from '@lucide/vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  size: {
    type: String,
    default: 'lg'
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
