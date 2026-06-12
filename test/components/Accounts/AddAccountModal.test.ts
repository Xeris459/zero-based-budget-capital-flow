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
})
