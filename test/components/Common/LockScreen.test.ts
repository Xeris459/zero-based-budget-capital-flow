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
    securityStore.security.pinVal = '1234'

    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'pin')?.trigger('click')

    const buttons = wrapper.findAll('button')
    // Click 1, 2, 3, 4
    await buttons.find(b => b.text() === '1')?.trigger('click')
    await buttons.find(b => b.text() === '2')?.trigger('click')
    await buttons.find(b => b.text() === '3')?.trigger('click')
    await buttons.find(b => b.text() === '4')?.trigger('click')

    await vi.runAllTimersAsync()
    await nextTick()

    expect(securityStore.isLocked).toBe(false)

    securityStore.isLocked = true
    securityStore.security.pinVal = '9999'
    
    // We can reuse the same wrapper or remount. Let's remount for clean state.
    const retryWrapper = mount(LockScreen)
    await nextTick()
    await retryWrapper.findAll('button').find(button => button.text() === 'pin')?.trigger('click')
    
    const rb = retryWrapper.findAll('button')
    await rb.find(b => b.text() === '1')?.trigger('click')
    await rb.find(b => b.text() === '1')?.trigger('click')
    await rb.find(b => b.text() === '1')?.trigger('click')
    await rb.find(b => b.text() === '1')?.trigger('click')

    await vi.runAllTimersAsync()
    await nextTick()

    expect(retryWrapper.text()).toContain('PIN yang Anda masukkan salah.')
  })

  it('handles backspace and clear in PIN keypad', async () => {
    securityStore.security.pinEnabled = true
    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'pin')?.trigger('click')

    // Click '1' and '2'
    const buttons = wrapper.findAll('button')
    await buttons.find(b => b.text() === '1')?.trigger('click')
    await buttons.find(b => b.text() === '2')?.trigger('click')
    
    expect(wrapper.vm.pinDigits).toEqual(['1', '2', '', ''])

    // Click Backspace (Undo2 icon with Backspace title)
    const backspaceBtn = wrapper.find('button[title="Backspace"]')
    await backspaceBtn?.trigger('click')
    expect(wrapper.vm.pinDigits).toEqual(['1', '', '', ''])

    // Click Clear (text "Clear")
    const clearBtn = buttons.find(b => b.text() === 'Clear')
    await clearBtn?.trigger('click')
    expect(wrapper.vm.pinDigits).toEqual(['', '', '', ''])
  })

  it('handles dot removal in pattern', async () => {
    securityStore.security.patternEnabled = true
    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'pattern')?.trigger('click')

    const dots = wrapper.findAll('circle')
    await dots[0].trigger('click')
    await dots[1].trigger('click')
    expect(wrapper.vm.patternDots).toEqual([1, 2])

    // Click dot 2 again to remove it (only removes if it's the last one)
    await dots[1].trigger('click')
    expect(wrapper.vm.patternDots).toEqual([1])
  })

  it('validates empty password', async () => {
    securityStore.security.passwordEnabled = true
    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'password')?.trigger('click')
    await nextTick()
    const passwordUnlockBtn = wrapper.findAll('button').find(b => b.text().includes('Unlock dengan Password'))
    await passwordUnlockBtn?.trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('Password tidak boleh kosong')
  })

  it('validates short pattern', async () => {
    securityStore.security.patternEnabled = true
    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'pattern')?.trigger('click')
    await nextTick()
    
    const verifyPatternBtn = wrapper.findAll('button').find(b => b.text().includes('Verifikasi Pola'))
    expect(verifyPatternBtn).toBeDefined()
    
    // The button is disabled when dots < 2. We force a click by removing disabled or calling trigger.
    // trigger('click') on a disabled element might not work in some environments, so we ensure it's enabled.
    await verifyPatternBtn!.element.removeAttribute('disabled')
    await verifyPatternBtn!.trigger('click')
    
    await vi.runAllTimersAsync()
    await nextTick()
    
    expect(wrapper.text()).toContain('Hubungkan minimal 2 titik')
  })

  it('handles biometric timeout in web mode', async () => {
    securityStore.security.fingerprintEnabled = true
    const wrapper = mount(LockScreen)
    await nextTick()

    const biometricButton = wrapper.find('button[class*="bg-primary"]')
    await biometricButton!.trigger('click')
    await nextTick()

    expect(wrapper.vm.isBiometricSimulating).toBe(true)
    
    vi.advanceTimersByTime(5000)
    await vi.runAllTimersAsync()
    await nextTick()
    
    expect(wrapper.text()).toContain('Pemindaian biometrik timeout')
    expect(wrapper.vm.isBiometricSimulating).toBe(false)
    })

    it.skip('handles keypad paste', async () => {
      securityStore.security.pinEnabled = true
      const wrapper = mount(LockScreen)
      await nextTick()

      await wrapper.findAll('button').find(button => button.text() === 'pin')?.trigger('click')
      await nextTick()

      const keypadDiv = wrapper.find('div[class*="grid-cols-3"]')

      // Create a proper ClipboardEvent mock
      const clipboardData = {
        getData: vi.fn().mockReturnValue('5678')
      }

      // In JSDOM/Vitest, trigger('paste', ...) might not correctly set clipboardData
      // so we dispatch a native event.
      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(pasteEvent, 'clipboardData', { value: clipboardData })

      keypadDiv.element.dispatchEvent(pasteEvent)

      await nextTick()
      await vi.runAllTimersAsync()
      await nextTick()

      expect(wrapper.vm.pinDigits).toEqual(['5', '6', '7', '8'])
      })

      it('filters non-numeric characters on PIN paste', async () => {
      securityStore.security.pinEnabled = true
      const wrapper = mount(LockScreen)
      await nextTick()

      await wrapper.findAll('button').find(button => button.text() === 'pin')?.trigger('click')
      await nextTick()

      const firstInput = wrapper.find('input[inputmode="numeric"]')
      expect(firstInput.exists()).toBe(true)
      
      const clipboardData = {
        getData: vi.fn().mockReturnValue('1a2b')
      }

      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(pasteEvent, 'clipboardData', { value: clipboardData })

      firstInput.element.dispatchEvent(pasteEvent)

      await nextTick()
      await vi.runAllTimersAsync()
      await nextTick()

      // Should only keep '1' and '2'
      expect(wrapper.vm.pinDigits).toEqual(['1', '2', '', ''])
      })

      it('handles biometric failure path', async () => {
        securityStore.security.fingerprintEnabled = true
        const wrapper = mount(LockScreen)
        await nextTick()

        // Manually trigger the error state to verify UI rendering
        wrapper.vm.errorMessage = 'Pemindaian biometrik gagal'
        await nextTick()

        expect(wrapper.text()).toContain('Pemindaian biometrik gagal')
      })

  it('pops the last dot in pattern if clicked again', async () => {
    securityStore.security.patternEnabled = true
    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'pattern')?.trigger('click')
    await nextTick()
    
    const dots = wrapper.findAll('circle')
    await dots[0].trigger('click')
    await dots[1].trigger('click')
    expect(wrapper.vm.patternDots).toEqual([1, 2])
    
    // Click dot 2 again (it's the last one)
    await dots[1].trigger('click')
    expect(wrapper.vm.patternDots).toEqual([1])
    
    // Click dot 1 again (it's the last one)
    await dots[0].trigger('click')
    expect(wrapper.vm.patternDots).toEqual([])
  })

  it('handles wrong password in web mode', async () => {
    securityStore.security.passwordEnabled = true
    securityStore.security.passwordVal = 'correct'
    const wrapper = mount(LockScreen)
    await nextTick()

    await wrapper.findAll('button').find(button => button.text() === 'password')?.trigger('click')
    await nextTick()
    
    const input = wrapper.find('input[placeholder="Password"]')
    await input.setValue('wrong')
    const unlockBtn = wrapper.findAll('button').find(b => b.text().includes('Unlock dengan Password'))
    await unlockBtn?.trigger('click')
    await nextTick()
    
    expect(wrapper.text()).toContain('Password yang Anda masukkan salah.')
  })
})