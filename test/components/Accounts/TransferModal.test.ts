/**
 * TransferModal Component — UI Tests
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import TransferModal from '~/components/Accounts/TransferModal.vue'
import { nextTick } from 'vue'
import { populateMockData } from '../../mockData'

const CommonModalStub = {
  template: '<div><slot name="header"/><slot name="body"/><slot name="footer"/></div>',
  props: ['show']
}

describe('TransferModal.vue', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>
  let alertSpy: any

  const mountModal = (props = {}) => {
    return mount(TransferModal, {
      props: { show: true, ...props },
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
    settingsStore = useSettingsStore()
    populateMockData(store)
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    alertSpy.mockRestore()
  })

  it('renders all fields and defaults to first two accounts when no filters are set', async () => {
    const wrapper = mountModal()
    await nextTick()

    const selects = wrapper.findAll('select')
    expect(selects.length).toBe(2) // Source + Destination Selects

    const sourceSelect = selects[0].element as HTMLSelectElement
    const destSelect = selects[1].element as HTMLSelectElement

    // Should list all 4 accounts in both dropdowns
    expect(selects[0].findAll('option').length).toBe(4)
    expect(selects[1].findAll('option').length).toBe(4)

    // Default selection is first two accounts
    expect(sourceSelect.value).toBe(store.accounts[0].id)
    expect(destSelect.value).toBe(store.accounts[1].id)
  })

  it('filters source and destination accounts based on bank filters', async () => {
    // Let's filter source to 'bank-bca' (1 account) and dest to 'bank-jago' (1 account)
    const wrapper = mountModal({
      sourceBankId: 'bank-bca',
      destBankId: 'bank-jago'
    })
    await nextTick()

    const selects = wrapper.findAll('select')
    const sourceOptions = selects[0].findAll('option')
    const destOptions = selects[1].findAll('option')

    // Source dropdown should only show the BCA account
    expect(sourceOptions.length).toBe(1)
    expect(sourceOptions[0].text()).toContain('Checking Account')

    // Destination dropdown should only show the Jago account
    expect(destOptions.length).toBe(1)
    expect(destOptions[0].text()).toContain('High-Yield Savings')
  })

  it('handles same-bank (intra-bank) filters correctly and selects different accounts if available', async () => {
    // Add another account to bank-bca so we can have an intra-bank transfer
    store.accounts.push({
      id: 'acc-checking-2',
      name: 'Checking Account 2',
      type: 'checking',
      bankId: 'bank-bca',
      startingBalance: 5000000,
      balance: 5000000
    })

    const wrapper = mountModal({
      sourceBankId: 'bank-bca',
      destBankId: 'bank-bca'
    })
    await nextTick()

    const selects = wrapper.findAll('select')
    const sourceSelect = selects[0].element as HTMLSelectElement
    const destSelect = selects[1].element as HTMLSelectElement

    // Both source and destination should list only the two BCA accounts
    expect(selects[0].findAll('option').length).toBe(2)
    expect(selects[1].findAll('option').length).toBe(2)

    // They should automatically select different accounts
    expect(sourceSelect.value).toBe('acc-checking')
    expect(destSelect.value).toBe('acc-checking-2')
  })

  it('submits the transfer using store.transferFunds', async () => {
    const transferSpy = vi.spyOn(store, 'transferFunds').mockImplementation(() => {})
    const wrapper = mountModal({
      initialFromAccountId: 'acc-checking',
      initialToAccountId: 'acc-savings'
    })
    await nextTick()

    // Set amount input
    const amountInput = wrapper.find('input[type="text"]')
    await amountInput.setValue('500000') // 500.000 (without dots in typing, code processes it)
    await nextTick()

    // Set memo
    const memoInput = wrapper.findAll('input')[1] // memo is the second input
    await memoInput.setValue('Test Visualizer Transfer')

    // Trigger executeTransfer
    const confirmBtn = wrapper.findAll('button').find(b => b.text() === 'Confirm Transfer')
    expect(confirmBtn).toBeDefined()
    await confirmBtn!.trigger('click')

    expect(transferSpy).toHaveBeenCalledWith(
      'acc-checking',
      'acc-savings',
      500000000,
      'Test Visualizer Transfer'
    )
  })
})
