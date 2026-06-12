/**
 * Nuxt auto-import stubs for test environment.
 * Aliased as '#imports' in vitest.config.ts
 */
import { ref, computed, reactive, watch, watchEffect, onMounted, onUnmounted, nextTick } from 'vue'

// Re-export Vue Composition API (Nuxt auto-imports these)
export {
  ref,
  computed,
  reactive,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  nextTick
}

// Stub useRoute
export function useRoute() {
  return reactive({
    path: '/',
    params: {},
    query: {},
    name: 'index'
  })
}

// Stub useRouter
export function useRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }
}

// Stub definePageMeta (Nuxt macro)
export function definePageMeta(_meta: any) {}

// Stub navigateTo
export function navigateTo(path: string) {
  return Promise.resolve()
}
