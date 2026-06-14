import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import LockScreen from '~/components/Common/LockScreen.vue'
import { useSecurityStore } from '~/stores/security'
import { useSettingsStore } from '~/stores/settings'

describe('LockScreen.vue', () => {
  let securityStore: ReturnType<typeof useSecurityStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    securityStore = useSecurityStore()
    settingsStore = useSettingsStore()
    securityStore.isLocked = true
    settingsStore.isTauri = false
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('unlocks with password in web fallback mode', async () => {
    securityStore.security.passwordEnabled = true
    securityStore.security.pinEnabled = true
    securityStore.security.passwordVal = 'secret'

    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'password')?.trigger('click')

    const input = wrapper.find('input[placeholder="Password"]')
    await input.setValue('wrong')
    await wrapper.findAll('button').find(button => button.text() === 'Unlock dengan Password')?.trigger('click')

    expect(wrapper.text()).toContain('Password yang Anda masukkan salah.')

    await input.setValue('secret')
    await wrapper.findAll('button').find(button => button.text() === 'Unlock dengan Password')?.trigger('click')

    await nextTick()

    expect(securityStore.isLocked).toBe(false)
  })

  it('accepts pin input from keypad and clears invalid attempts', async () => {
    securityStore.security.pinEnabled = true
    securityStore.security.passwordEnabled = true
    securityStore.security.pinVal = '1234'

    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'pin')?.trigger('click')

    const keypadButtons = wrapper.findAll('button').filter(button => /^\d$/.test(button.text()))
    for (const button of keypadButtons.slice(0, 4)) {
      await button.trigger('click')
    }

    await vi.advanceTimersByTimeAsync(250)

    expect(securityStore.isLocked).toBe(false)

    securityStore.isLocked = true
    securityStore.security.pinVal = '9999'
    const retryWrapper = mount(LockScreen)
    await nextTick()
    await retryWrapper.findAll('button').find(button => button.text() === 'pin')?.trigger('click')
    const retryButtons = retryWrapper.findAll('button').filter(button => /^\d$/.test(button.text()))
    for (const button of [retryButtons[0], retryButtons[0], retryButtons[0], retryButtons[0]]) {
      await button.trigger('click')
    }

    await vi.advanceTimersByTimeAsync(250)

    expect(retryWrapper.text()).toContain('PIN yang Anda masukkan salah.')
  })

  it('verifies the pattern grid and can simulate biometric success', async () => {
    securityStore.security.patternEnabled = true
    securityStore.security.patternVal = '1-2-3'

    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'pattern')?.trigger('click')

    const dots = wrapper.findAll('circle')
    await dots[0].trigger('click')
    await dots[1].trigger('click')
    await dots[2].trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Verifikasi Pola')!.trigger('click')

    await nextTick()

    expect(securityStore.isLocked).toBe(false)

    securityStore.isLocked = true
    securityStore.security.patternEnabled = false
    securityStore.security.passwordEnabled = false
    securityStore.security.pinEnabled = false
    securityStore.security.fingerprintEnabled = true

    const biometricWrapper = mount(LockScreen)
    await nextTick()

    const biometricButton = biometricWrapper.findAll('div').find(node => node.classes().includes('w-20') && node.classes().includes('h-20'))
    await biometricButton!.trigger('click')
    await vi.advanceTimersByTimeAsync(800)

    expect(securityStore.isLocked).toBe(false)
  })
})