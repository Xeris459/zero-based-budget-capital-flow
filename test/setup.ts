/**
 * Global test setup for Vitest
 * - Mocks localStorage
 * - Stubs Lucide icons globally
 */
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

// ── Mock localStorage ──────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ── Stub NuxtLink → <a> ───────────────────────────────────────────────
const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: [String, Object], default: '' } },
  setup(props, { slots }) {
    return () => h('a', { href: typeof props.to === 'string' ? props.to : '/' }, slots.default?.())
  }
})

// ── Stub NuxtPage → <div> ─────────────────────────────────────────────
const NuxtPageStub = defineComponent({
  name: 'NuxtPage',
  setup(_, { slots }) {
    return () => h('div', { 'data-testid': 'nuxt-page' }, slots.default?.())
  }
})

// ── Register global stubs ──────────────────────────────────────────────
config.global.stubs = {
  NuxtLink: NuxtLinkStub,
  NuxtPage: NuxtPageStub,
  Teleport: true // stub Teleport to render children inline
}

// ── Reset localStorage before each test ────────────────────────────────
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})
