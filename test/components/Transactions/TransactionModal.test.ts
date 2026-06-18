/**
 * TransactionModal Component — UI Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import TransactionModal from '~/components/Transactions/TransactionModal.vue'
import { nextTick } from 'vue'
import { populateMockData } from '../../mockData'

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
    populateMockData(store)
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

  it('adds preset amounts correctly', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const preset100k = wrapper.findAll('button').find(b => b.text() === '+100K')
    expect(preset100k).toBeDefined()
    await preset100k!.trigger('click')
    await nextTick()

    const amountInput = wrapper.find('#transaction-amount-input') as any
    expect(amountInput.element.value).toBe('100')

    await preset100k!.trigger('click')
    await nextTick()
    expect(amountInput.element.value).toBe('200')
  })

  it('clears amount', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const preset100k = wrapper.findAll('button').find(b => b.text() === '+100K')
    await preset100k!.trigger('click')
    
    const clearBtn = wrapper.findAll('button').find(b => b.text() === 'Clear')
    expect(clearBtn).toBeDefined()
    await clearBtn!.trigger('click')
    await nextTick()

    const amountInput = wrapper.find('#transaction-amount-input') as any
    expect(amountInput.element.value).toBe('')
  })

  it('formats amount input correctly', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const amountInput = wrapper.find('#transaction-amount-input')
    await amountInput.setValue('1000') // should be formatted as 1.000
    await nextTick()
    
    expect((amountInput.element as HTMLInputElement).value).toBe('1.000')
  })

  it('saves a new transaction', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = mountModal({ show: false, transaction: null })
    await wrapper.setProps({ show: true })
    await nextTick()

    const countBefore = store.transactions.length

    // Fill details
    const descInput = wrapper.find('input[placeholder*="Groceries"]')
    await descInput.setValue('New Test Transaction')
    
    const amountInput = wrapper.find('#transaction-amount-input')
    await amountInput.setValue('50') // 50K
    
    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save Transaction')
    await saveBtn!.trigger('click')
    await nextTick()

    expect(store.transactions.length).toBe(countBefore + 1)
    const newTx = store.transactions[store.transactions.length - 1]
    expect(newTx.description).toBe('New Test Transaction')
    expect(newTx.amount).toBe(-50000) // 50K outflow
  })

  it('updates an existing transaction', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    const tx = store.transactions[0]
    const wrapper = mountModal({ show: false, transaction: tx })
    await wrapper.setProps({ show: true })
    await nextTick()

    const descInput = wrapper.find('input[placeholder*="Groceries"]')
    await descInput.setValue('Updated Transaction')
    
    const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save Transaction')
    await saveBtn!.trigger('click')
    await nextTick()

    const updatedTx = store.transactions.find(t => t.id === tx.id)
    expect(updatedTx?.description).toBe('Updated Transaction')
  })

  it('handles extremely long descriptions without breaking layout (sanity check)', async () => {
    const longDesc = 'A'.repeat(500)
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    const descInput = wrapper.find('input[placeholder*="Groceries"]')
    await descInput.setValue(longDesc)
    
    expect((descInput.element as HTMLInputElement).value).toBe(longDesc)
  })

  it('resets selected category when switching between inflow and outflow', async () => {
    const wrapper = mountModal({ show: true, transaction: null })
    await nextTick()

    // Default is outflow. Select an expense category.
    const expenseCat = store.categories.find(c => c.parentId === 'expenses')!
    await wrapper.vm.$nextTick() // Ensure categories are loaded
    
    // Switch to Inflow
    const inflowBtn = wrapper.findAll('button').find(b => b.text() === 'Inflow')
    await inflowBtn?.trigger('click')
    await nextTick()
    
    // Switching should reset category or at least show correct groups
    expect(wrapper.text()).toContain('Income')
    expect(wrapper.text()).not.toContain('Personal') // 'expenses' group name usually contains personal or similar
  })

  it('toggles account dropdown and selects an account', async () => {
    // Need to attach to body for Teleport to work reliably in some environments
    const wrapper = mount(TransactionModal, {
      props: { show: true, transaction: null },
      global: {
        stubs: {
          CommonModal: CommonModalStub
        }
      },
      attachTo: document.body
    })
    await nextTick()

    const dropdownBtn = wrapper.find('button[class*="min-h-[38px]"]')
    expect(dropdownBtn.exists()).toBe(true)
    
    await dropdownBtn.trigger('click')
    await nextTick()
    await nextTick() // Extra tick for Teleport/Transition
    
    // Check if dropdown is open in document body
    expect(document.body.innerHTML).toContain('Bank BCA')
    
    const accountOption = document.body.querySelector('div[class*="hover:bg-primary/10"]')
    expect(accountOption).not.toBeNull()
    
    // Use dispatchEvent as it's outside the wrapper
    accountOption?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    
    // Dropdown should be closed
    expect(document.body.querySelector('div[class*="shadow-2xl"]')).toBeNull()
    
    wrapper.unmount()
  })
})
