/**
 * AddAccountModal Component — UI Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import AddAccountModal from '~/components/Accounts/AddAccountModal.vue'
import { nextTick } from 'vue'
import { populateMockData } from '../../mockData'

const CommonModalStub = {
  template: '<div><slot name="header"/><slot name="body"/><slot name="footer"/></div>',
  props: ['show']
}

describe('AddAccountModal.vue', () => {
  let store: ReturnType<typeof useBudgetStore>

  const mountModal = (props = {}) => {
    return mount(AddAccountModal, {
      props: { show: true, selectedBankId: 'bank-bca', ...props },
      global: {
        stubs: {
          CommonModal: CommonModalStub
        }
      }
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    populateMockData(store)
  })

  it('renders all form fields', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    // Account Name text input
    const textInputs = wrapper.findAll('input[type="text"]')
    expect(textInputs.length).toBeGreaterThanOrEqual(2) // name + balance

    // Account Type select
    const selects = wrapper.findAll('select')
    expect(selects.length).toBe(2) // type + bank

    // Check labels
    expect(wrapper.text()).toContain('Account Name')
    expect(wrapper.text()).toContain('Account Type')
    expect(wrapper.text()).toContain('Bank Provider')
    expect(wrapper.text()).toContain('Starting Balance')
  })

  it('pre-selects bank from selectedBankId prop', async () => {
    const wrapper = mountModal({ show: true, selectedBankId: 'bank-jago' })
    await nextTick()

    // The bank select should have bank-jago selected
    const bankSelect = wrapper.findAll('select')[1] // second select is bank
    expect((bankSelect.element as HTMLSelectElement).value).toBe('bank-jago')
  })

  it('Create Account button adds account to store', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    const countBefore = store.accounts.length

    // Fill in the name input
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Test Account')

    // Click the Create Account button
    const createBtn = wrapper.findAll('button').find(b => b.text() === 'Create Account')
    expect(createBtn).toBeDefined()
    await createBtn!.trigger('click')

    expect(store.accounts.length).toBe(countBefore + 1)
    expect(store.accounts[store.accounts.length - 1].name).toBe('Test Account')
  })

  it('validation: shows alert when name is empty', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const wrapper = mountModal({ show: true })
    await nextTick()

    // Click Create Account without filling name
    const createBtn = wrapper.findAll('button').find(b => b.text() === 'Create Account')
    await createBtn!.trigger('click')

    expect(alertMock).toHaveBeenCalledWith('Please enter an account name.')
    alertMock.mockRestore()
  })

  it('Cancel button emits close event', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    expect(cancelBtn).toBeDefined()
    await cancelBtn!.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('handles negative starting balance input', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    const input = wrapper.find('#starting-balance-input')
    await input.setValue('-1000')
    await input.trigger('input')
    await nextTick()

    expect((input.element as HTMLInputElement).value).toBe('-1.000')
  })

  it('toggles balance sign', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    const input = wrapper.find('#starting-balance-input')
    await input.setValue('500')
    await input.trigger('input')
    await nextTick()

    const toggleBtn = wrapper.findAll('button').find(b => b.text().includes('+/-'))
    expect(toggleBtn).toBeDefined()
    await toggleBtn!.trigger('click')
    await nextTick()

    expect((input.element as HTMLInputElement).value).toBe('-500')

    await toggleBtn!.trigger('click')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('500')
  })

  it('adds presets correctly with current sign', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    const input = wrapper.find('#starting-balance-input')
    const preset100k = wrapper.findAll('button').find(b => b.text() === '+100K')
    await preset100k?.trigger('click')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('100')

    // Toggle to negative
    const toggleBtn = wrapper.findAll('button').find(b => b.text().includes('+/-'))
    await toggleBtn?.trigger('click')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('-100')

    // Add another 100K (should be added as -100K to the magnitude)
    await preset100k?.trigger('click')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('-200')
  })

  it('clears balance', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    const input = wrapper.find('#starting-balance-input')
    await input.setValue('100')
    await input.trigger('input')

    const clearBtn = wrapper.findAll('button').find(b => b.text() === 'Clear')
    await clearBtn?.trigger('click')
    await nextTick()

    expect((input.element as HTMLInputElement).value).toBe('0')
  })

  it('filters non-numeric characters from balance input', async () => {
    const wrapper = mountModal({ show: true })
    await nextTick()

    const input = wrapper.find('#starting-balance-input')
    // Attempt to type alphabets
    await input.setValue('12abc34')
    await input.trigger('input')
    await nextTick()
    
    // Should only keep digits: 1.234
    expect((input.element as HTMLInputElement).value).toBe('1.234')
  })

  it('focuses input when clicking container', async () => {
    const wrapper = mount(AddAccountModal, {
      props: { show: true },
      global: {
        stubs: {
          CommonModal: CommonModalStub
        }
      },
      attachTo: document.body
    })
    await nextTick()

    const input = document.getElementById('starting-balance-input')
    // Find the container div that has @click="focusBalanceInput"
    // It's the one with class containing glass-panel and cursor-text
    const container = wrapper.find('div[class*="cursor-text"]')
    expect(container.exists()).toBe(true)

    await container.trigger('click')
    expect(document.activeElement).toBe(input)

    wrapper.unmount()
  })

  it('shows error if account name is missing on save', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mountModal({ show: true })
    await nextTick()

    const saveBtn = wrapper.findAll('button').find(b => b.text().includes('Create Account'))
    await saveBtn?.trigger('click')
    await nextTick()

    expect(window.alert).toHaveBeenCalledWith('Please enter an account name.')
  })
  })
