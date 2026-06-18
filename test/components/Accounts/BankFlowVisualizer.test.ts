/**
 * BankFlowVisualizer Component — UI Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import BankFlowVisualizer from '~/components/Accounts/BankFlowVisualizer.vue'
import { nextTick } from 'vue'
import { populateMockData } from '../../mockData'

describe('BankFlowVisualizer.vue', () => {
  let store: ReturnType<typeof useBudgetStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    populateMockData(store)
  })

  it('renders bank nodes', async () => {
    const wrapper = mount(BankFlowVisualizer)
    await nextTick()

    const nodes = wrapper.findAll('button')
    expect(nodes.length).toBe(store.banks.length)

    // Check if bank codes are rendered
    store.banks.forEach(bank => {
      expect(wrapper.text()).toContain(bank.code)
    })
  })

  it('handles node clicks to initiate transfer', async () => {
    const wrapper = mount(BankFlowVisualizer)
    await nextTick()

    const nodes = wrapper.findAll('button')
    
    // Click first node (BCA)
    await nodes[0].trigger('click')
    expect(wrapper.text()).toContain('Selected Bank BCA as source')

    // Click second node (Jago)
    await nodes[1].trigger('click')
    
    // Should emit initiate-transfer
    expect(wrapper.emitted('initiate-transfer')).toBeTruthy()
    const eventPayload = wrapper.emitted('initiate-transfer')![0][0] as any
    expect(eventPayload.sourceBankId).toBe(store.banks[0].id)
    expect(eventPayload.destBankId).toBe(store.banks[1].id)
  })

  it('handles double click on same node to transfer between accounts in same bank', async () => {
    // Need a bank with multiple accounts
    store.accounts.push({
      id: 'acc-savings-bca',
      name: 'Savings BCA',
      type: 'savings',
      bankId: 'bank-bca',
      startingBalance: 1000,
      balance: 1000
    })
    
    const wrapper = mount(BankFlowVisualizer)
    await nextTick()

    const nodes = wrapper.findAll('button')
    // Find the BCA node
    const bcaNode = nodes.find(n => n.text().includes('BCA'))!

    // Click once
    await bcaNode.trigger('click')
    // Click again
    await bcaNode.trigger('click')

    expect(wrapper.emitted('initiate-transfer')).toBeTruthy()
    const eventPayload = wrapper.emitted('initiate-transfer')![0][0] as any
    expect(eventPayload.sourceBankId).toBe('bank-bca')
    expect(eventPayload.destBankId).toBe('bank-bca')
  })

  it('renders flow connections when activeFlows exist', async () => {
    // Manually add a transfer to trigger activeFlows
    const transferId = 'test-transfer-1'
    store.transactions.push({
      id: 'tx-source',
      date: '2026-06-10',
      description: 'Transfer Out',
      amount: -500000,
      accountId: 'acc-checking', // Bank BCA
      categoryId: '',
      transferId,
      shiftToNextMonth: false
    })
    store.transactions.push({
      id: 'tx-dest',
      date: '2026-06-10',
      description: 'Transfer In',
      amount: 500000,
      accountId: 'acc-savings', // Bank Jago
      categoryId: '',
      transferId,
      shiftToNextMonth: false
    })

    const wrapper = mount(BankFlowVisualizer)
    await nextTick()

    // Check for SVG path (curve)
    const path = wrapper.find('path.animate-dash')
    expect(path.exists()).toBe(true)

    // Check for amount text
    expect(wrapper.text()).toContain('500')
  })

  it('deselects bank node if clicked twice and only has one account', async () => {
    // Bank Jago only has one account in mockData
    const wrapper = mount(BankFlowVisualizer)
    await nextTick()

    const nodes = wrapper.findAll('button')
    const jagoNode = nodes.find(n => n.text().includes('Jago'))!

    // Click once to select
    await jagoNode.trigger('click')
    expect(wrapper.text()).toContain('Selected Bank Jago as source')

    // Click again to deselect
    await jagoNode.trigger('click')
    expect(wrapper.text()).not.toContain('Selected Bank Jago as source')
    expect(wrapper.emitted('initiate-transfer')).toBeFalsy()
  })
})
