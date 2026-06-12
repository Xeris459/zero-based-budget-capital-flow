/**
 * SummaryTable Component — UI Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import SummaryTable from '~/components/Dashboard/SummaryTable.vue'
import { populateMockData } from '../../mockData'

const iconStub = { template: '<span />' }

describe('SummaryTable.vue', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  const mountTable = () => {
    return mount(SummaryTable, {
      global: {
        stubs: {
          TrendingUp: iconStub,
          BarChart2: iconStub,
          PiggyBank: iconStub,
          CreditCard: iconStub,
          ChevronDown: iconStub,
          ChevronRight: iconStub
        }
      }
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    settingsStore = useSettingsStore()
    populateMockData(store)
  })

  it('renders all 4 core cash flows', () => {
    const wrapper = mountTable()
    
    // Check rows headers/names
    expect(wrapper.text()).toContain('Income')
    expect(wrapper.text()).toContain('Spending')
    expect(wrapper.text()).toContain('Savings')
    expect(wrapper.text()).toContain('Debt Payments')
  })

  it('calculates correct values and differences in K-Mode', () => {
    const wrapper = mountTable()
    
    // Assert K-Mode formatting for values:
    // Income: Planned 15M (Rp 15.000K), Actual 13.375M (Rp 13.375K), Diff -1.625M (-Rp 1.625K)
    expect(wrapper.text()).toContain('Rp 15.000K')
    expect(wrapper.text()).toContain('Rp 13.375K')
    expect(wrapper.text()).toContain('-Rp 1.625K')
    
    // Spending: Planned 10M (Rp 10.000K), Actual 4.662M (Rp 4.662K), Diff 5.338M (+Rp 5.338K)
    expect(wrapper.text()).toContain('Rp 10.000K')
    expect(wrapper.text()).toContain('Rp 4.662K')
    expect(wrapper.text()).toContain('+Rp 5.338K')
  })

  it('changes values dynamically when K-Mode is toggled', async () => {
    const wrapper = mountTable()
    
    // Turn K-Mode off
    settingsStore.kMode = false
    await wrapper.vm.$nextTick()
    
    // Output should show full raw numbers
    expect(wrapper.text()).toContain('Rp 15.000.000')
    expect(wrapper.text()).toContain('Rp 13.375.000')
    expect(wrapper.text()).toContain('-Rp 1.625.000')
    
    expect(wrapper.text()).toContain('Rp 10.000.000')
    expect(wrapper.text()).toContain('Rp 4.662.000')
    expect(wrapper.text()).toContain('+Rp 5.338.000')
  })

  it('renders subcategories by default and collapses them on click', async () => {
    const wrapper = mountTable()
    
    // Default seed has 'Primary Salary' under Income, and 'Housing' under Spending
    expect(wrapper.text()).toContain('Primary Salary')
    expect(wrapper.text()).toContain('Housing')
    
    // Find parent rows
    const trElements = wrapper.findAll('tr')
    const incomeRow = trElements.find(tr => tr.text().includes('Income'))
    expect(incomeRow).toBeDefined()
    
    // Collapse Income
    await incomeRow!.trigger('click')
    
    // Primary Salary (income detail) should be hidden, but Housing (spending detail) should remain
    expect(wrapper.text()).not.toContain('Primary Salary')
    expect(wrapper.text()).toContain('Housing')
    
    // Expand Income again
    await incomeRow!.trigger('click')
    expect(wrapper.text()).toContain('Primary Salary')
  })
})
