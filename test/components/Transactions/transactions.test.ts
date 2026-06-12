import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import TransactionsPage from '~/pages/transactions.vue'
import { nextTick } from 'vue'

const TransactionsTransactionModalStub = {
  template: '<div />',
  props: ['show', 'transaction']
}

describe('Transactions Page - Running Balance', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    settingsStore = useSettingsStore()
    
    // Seed default configuration/stores
    store.loadDefaults()
  })

  const mountPage = () => {
    return mount(TransactionsPage, {
      global: {
        stubs: {
          TransactionsTransactionModal: TransactionsTransactionModalStub
        }
      }
    })
  }

  it('calculates running balances in correct chronological order', async () => {
    // Override transactions to a simple controlled set
    store.transactions = [
      {
        id: 'tx-1',
        date: '2026-06-01',
        description: 'Salary Inflow',
        amount: 10000000, // +10M
        accountId: 'acc-checking',
        categoryId: 'cat-inc-salary',
        shiftToNextMonth: false
      },
      {
        id: 'tx-2',
        date: '2026-06-05',
        description: 'Rent Outflow',
        amount: -2500000, // -2.5M
        accountId: 'acc-checking',
        categoryId: 'cat-exp-housing',
        shiftToNextMonth: false
      }
    ]

    const wrapper = mountPage()
    await nextTick()

    // Retrieve the computed property or inspect the DOM
    const balanceCells = wrapper.findAll('tbody tr td:nth-child(6)')
    // On the desktop view table:
    // Columns are: Date (1), Description (2), Bank & Account (3), Category (4), Amount (5), Balance (6), Shift (7), Actions (8)
    
    // Check that we have cells
    expect(balanceCells.length).toBeGreaterThanOrEqual(2)

    // Note: Table renders newest transactions first (descending order)
    // So row 0 is tx-2 (June 5th) and row 1 is tx-1 (June 1st)
    // Starting balance of acc-checking is 12.5M (12,500,000)
    // tx-1 (June 1st) brings it to: 12.5M + 10M = 22.5M
    // tx-2 (June 5th) brings it to: 22.5M - 2.5M = 20M
    expect(balanceCells[0].text()).toContain(settingsStore.formatValue(20000000))
    expect(balanceCells[1].text()).toContain(settingsStore.formatValue(22500000))
  })

  it('correctly recalculates running balance when a transaction is input late (out of order)', async () => {
    // Start with:
    // acc-checking Starting balance = 12.5M
    // tx-1 (June 1st): +10M
    // tx-2 (June 5th): -2.5M
    store.transactions = [
      {
        id: 'tx-1',
        date: '2026-06-01',
        description: 'Salary Inflow',
        amount: 10000000,
        accountId: 'acc-checking',
        categoryId: 'cat-inc-salary',
        shiftToNextMonth: false
      },
      {
        id: 'tx-2',
        date: '2026-06-05',
        description: 'Rent Outflow',
        amount: -2500000,
        accountId: 'acc-checking',
        categoryId: 'cat-exp-housing',
        shiftToNextMonth: false
      }
    ]

    const wrapper = mountPage()
    await nextTick()

    // Add a late transaction (dated June 3rd, amount -500,000)
    // Chronological order should become:
    // 1. June 1st (+10M) -> Balance: 22.5M
    // 2. June 3rd (-500K) -> Balance: 22M
    // 3. June 5th (-2.5M) -> Balance: 19.5M
    store.transactions.push({
      id: 'tx-late',
      date: '2026-06-03',
      description: 'Groceries (Late Input)',
      amount: -500000,
      accountId: 'acc-checking',
      categoryId: 'cat-exp-food',
      shiftToNextMonth: false
    })

    await nextTick()

    // Rendered list is sorted descending:
    // Row 0: June 5th (Rent, tx-2) -> Expected Running Balance: 19.5M
    // Row 1: June 3rd (Groceries, tx-late) -> Expected Running Balance: 22.0M
    // Row 2: June 1st (Salary, tx-1) -> Expected Running Balance: 22.5M
    const balanceCells = wrapper.findAll('tbody tr td:nth-child(6)')
    expect(balanceCells.length).toBe(3)

    expect(balanceCells[0].text()).toContain(settingsStore.formatValue(19500000))
    expect(balanceCells[1].text()).toContain(settingsStore.formatValue(22000000))
    expect(balanceCells[2].text()).toContain(settingsStore.formatValue(22500000))
  })

  it('handles same-day transactions in descending visual order and ascending math order', async () => {
    store.transactions = [
      {
        id: 'tx-1',
        date: '2026-06-01',
        description: 'Salary Inflow',
        amount: 10000000,
        accountId: 'acc-checking',
        categoryId: 'cat-inc-salary',
        shiftToNextMonth: false
      },
      {
        id: 'tx-2',
        date: '2026-06-02',
        description: 'Rent Outflow (First input)',
        amount: -2205000,
        accountId: 'acc-checking',
        categoryId: 'cat-exp-housing',
        shiftToNextMonth: false
      },
      {
        id: 'tx-3',
        date: '2026-06-02',
        description: 'makan (Second input)',
        amount: -25000000, // -25M
        accountId: 'acc-checking',
        categoryId: 'cat-exp-food',
        shiftToNextMonth: false
      }
    ]

    const wrapper = mountPage()
    await nextTick()

    // Retrieve display order (expecting newest/highest index first for equal dates):
    // Row 0: June 2nd (makan, tx-3, LATER) -> Expected Running Balance: 12.5M starting + 10M salary = 22.5M -> -2.205M rent = 20.295M -> -25M makan = -4.705M
    // Row 1: June 2nd (Rent, tx-2, EARLIER) -> Expected Running Balance: 12.5M starting + 10M salary = 22.5M -> -2.205M rent = 20.295M
    // Row 2: June 1st (Salary, tx-1) -> Expected Running Balance: 22.5M
    
    // Check table descriptions to verify correct display sort order
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3)
    
    expect(rows[0].text()).toContain('makan (Second input)')
    expect(rows[1].text()).toContain('Rent Outflow (First input)')
    expect(rows[2].text()).toContain('Salary Inflow')

    const balanceCells = wrapper.findAll('tbody tr td:nth-child(6)')
    expect(balanceCells[0].text()).toContain(settingsStore.formatValue(-4705000))
    expect(balanceCells[1].text()).toContain(settingsStore.formatValue(20295000))
    expect(balanceCells[2].text()).toContain(settingsStore.formatValue(22500000))
  })
})
