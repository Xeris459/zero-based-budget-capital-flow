/**
 * TransactionModal Component — UI Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import TransactionModal from '~/components/Transactions/TransactionModal.vue'
import { nextTick } from 'vue'

const iconStub = { template: '<span />' }

const CommonModalStub = {
  template: '<div><slot name="header"/><slot name="body"/><slot name="footer"/></div>',
  props: ['show']
}

describe('TransactionModal.vue', () => {
  let store: ReturnType<typeof useBudgetStore>

  const mountModal = (props = {}) => {
    return mount(TransactionModal, {
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
    store.loadDefaults()
  })

  it('renders "Add New Transaction" title when no transaction prop', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()
    expect(wrapper.text()).toContain('Add New Transaction')
  })

  it('renders "Edit Transaction" title when transaction prop is provided', async () => {
    const tx = store.transactions[0]
    const wrapper = mountModal({ show: true, transaction: tx })
    await nextTick()
    expect(wrapper.text()).toContain('Edit Transaction')
  })

  it('Expense (Outflow) button is active by default in create mode', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const outflowBtn = wrapper.findAll('button').find(b => b.text().includes('Expense (Outflow)'))
    expect(outflowBtn).toBeDefined()
    expect(outflowBtn!.classes()).toContain('bg-error/15')
  })

  it('switching to Inflow activates the Inflow button', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const inflowBtn = wrapper.findAll('button').find(b => b.text().includes('Income (Inflow)'))
    expect(inflowBtn).toBeDefined()
    await inflowBtn!.trigger('click')
    await nextTick()

    expect(inflowBtn!.classes()).toContain('bg-secondary/15')
  })

  it('outflow mode shows expense/savings/debt category groups', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const html = wrapper.html()
    expect(html).toContain('Expenses')
    expect(html).toContain('Savings Goals')
    expect(html).toContain('Debt Payoffs')
  })

  it('"Shift to Next Month" toggle appears only for inflow type', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    // In outflow mode, shift toggle should not be visible
    expect(wrapper.text()).not.toContain('Shift to Next Month')

    // Switch to inflow
    const inflowBtn = wrapper.findAll('button').find(b => b.text().includes('Income (Inflow)'))
    await inflowBtn!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Shift to Next Month')
  })

  it('Cancel button emits close event', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    expect(cancelBtn).toBeDefined()
    await cancelBtn!.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
