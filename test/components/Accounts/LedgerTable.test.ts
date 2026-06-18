/**
 * LedgerTable Component — UI Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import LedgerTable from '~/components/Accounts/LedgerTable.vue'
import { nextTick } from 'vue'
import { populateMockData } from '../../mockData'

describe('LedgerTable.vue', () => {
  let store: ReturnType<typeof useBudgetStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    populateMockData(store)
  })

  it('renders transactions for a selected bank (all accounts)', async () => {
    const wrapper = mount(LedgerTable, {
      props: {
        selectedBankId: 'bank-bca',
        selectedAccountId: 'all'
      }
    })
    await nextTick()

    expect(wrapper.text()).toContain('Bank BCA Consolidated Ledger')
    
    // Each transaction row should be rendered
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('renders transactions for a specific account', async () => {
    const wrapper = mount(LedgerTable, {
      props: {
        selectedBankId: 'bank-bca',
        selectedAccountId: 'acc-checking'
      }
    })
    await nextTick()

    expect(wrapper.text()).toContain('Checking Account Ledger')
  })

  it('renders empty state when no transactions found', async () => {
    const wrapper = mount(LedgerTable, {
      props: {
        selectedBankId: 'bank-non-existent',
        selectedAccountId: 'all'
      }
    })
    await nextTick()

    expect(wrapper.text()).toContain('No ledger transactions found')
  })
})
