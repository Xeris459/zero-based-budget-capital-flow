import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import BottomNav from '~/components/Common/BottomNav.vue'
import Titlebar from '~/components/Common/Titlebar.vue'
import SplashScreen from '~/components/Common/SplashScreen.vue'

const testState = vi.hoisted(() => ({
  routePath: '/',
  invoke: vi.fn(),
  getCurrentWindow: vi.fn()
}))

vi.mock('#imports', () => ({
  useRoute: () => ({ path: testState.routePath, params: {}, query: {}, name: 'index' })
}))

vi.mock('@tauri-apps/api/core', () => ({
  invoke: testState.invoke
}))

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: testState.getCurrentWindow
}))

describe('Common Shell Components', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useSettingsStore()
    testState.routePath = '/'
    testState.invoke.mockReset()
    testState.getCurrentWindow.mockReset()
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: true,
      configurable: true,
      writable: true
    })
  })

  it('renders bottom navigation and marks the active route', () => {
    testState.routePath = '/planner'

    const wrapper = mount(BottomNav)

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Planner')
    expect(wrapper.text()).toContain('Transactions')
    expect(wrapper.text()).toContain('Accounts')
    expect(wrapper.text()).toContain('Settings')
    expect(wrapper.findAll('a').some(link => link.classes().includes('text-primary'))).toBe(true)
  })

  it('wires titlebar window controls and snap overlay', async () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: false,
      configurable: true,
      writable: true
    })
    testState.invoke.mockResolvedValue(undefined)

    const wrapper = mount(Titlebar)
    await nextTick()
    await Promise.resolve()

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')

    const maximizeButton = buttons[1]
    Object.defineProperty(maximizeButton.element, 'getBoundingClientRect', {
      value: () => ({ x: 1, y: 2, width: 3, height: 4 }),
      configurable: true
    })
    await maximizeButton.trigger('click')
    await maximizeButton.trigger('mouseenter')
    await buttons[2].trigger('click')
    expect(testState.invoke).toHaveBeenCalledTimes(0)
  })

  it('emits finish after splash screen animation completes', async () => {
    vi.useFakeTimers()

    const wrapper = mount(SplashScreen)
    expect(wrapper.text()).toContain('Capital Flow')

    await vi.advanceTimersByTimeAsync(2100)

    expect(wrapper.emitted('finish')).toBeTruthy()
    vi.useRealTimers()
  })
})