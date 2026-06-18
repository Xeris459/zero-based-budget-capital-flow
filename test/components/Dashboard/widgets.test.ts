import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import AccountsSummary from '~/components/Dashboard/AccountsSummary.vue'
import IncomeOverview from '~/components/Dashboard/IncomeOverview.vue'
import BudgetTrendChart from '~/components/Dashboard/BudgetTrendChart.vue'
import DoughnutChart from '~/components/Dashboard/DoughnutChart.vue'
import DetailModal from '~/components/Dashboard/DetailModal.vue'
import { populateMockData } from '../../mockData'

const testState = vi.hoisted(() => ({
  push: vi.fn()
}))

vi.mock('#imports', () => ({
  useRouter: () => ({ push: testState.push })
}))

const CommonModalStub = {
  template: '<div><slot name="header" /><slot name="body" /><slot name="footer" /></div>',
  props: ['show']
}

describe('Dashboard Widgets', () => {
  let budgetStore: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    budgetStore = useBudgetStore()
    settingsStore = useSettingsStore()
    populateMockData(budgetStore)
    testState.push.mockReset()
  })

  it('renders account summary and navigates to accounts', async () => {
    const wrapper = mount(AccountsSummary)

    expect(wrapper.text()).toContain('Accounts Summary')
    expect(wrapper.text()).toContain('Checking Account')

    await wrapper.findAll('span').find(node => node.text() === 'Manage')?.trigger('click')
    expect(testState.push).toHaveBeenCalledWith('/accounts')
  })

  it('renders income overview and navigates to planner', async () => {
    const wrapper = mount(IncomeOverview)

    expect(wrapper.text()).toContain('Income Overview')
    expect(wrapper.text()).toContain('Primary Salary')

    await wrapper.findAll('span').find(node => node.text() === 'Manage')?.trigger('click')
    expect(testState.push).toHaveBeenCalledWith('/planner')
  })

  it('renders budget trend chart and toggles the scrollable view', async () => {
    const wrapper = mount(BudgetTrendChart)

    expect(wrapper.text()).toContain(`Budget Tracking (May - Dec ${settingsStore.currentYear})`)

    const toggleButton = wrapper.find('button')
    expect(toggleButton.exists()).toBe(true)

    expect(wrapper.html()).toContain('min-w-[480px]')

    await toggleButton.trigger('click')
    expect(wrapper.html()).toContain('w-full gap-1.5 sm:gap-2 px-1')
  })

  it('renders spending and savings doughnut charts with hover details', async () => {
    const spendingWrapper = mount(DoughnutChart, {
      props: { type: 'spending' }
    })

    expect(spendingWrapper.text()).toContain('Spending Breakdown')

    const spendingSlices = spendingWrapper.findAll('circle').filter(node => node.attributes('stroke') && node.attributes('stroke') !== '#1f1f27')
    await spendingSlices[0].trigger('mouseenter')
    expect(spendingWrapper.text()).toMatch(/%/)

    const savingsWrapper = mount(DoughnutChart, {
      props: { type: 'savings' }
    })

    expect(savingsWrapper.text()).toContain('Savings Breakdown')
  })

  it('renders detail modal content for net worth and annual expenses', async () => {
    const netWorthWrapper = mount(DetailModal, {
      props: { show: true, type: 'net_worth' },
      global: { stubs: { CommonModal: CommonModalStub } }
    })

    expect(netWorthWrapper.text()).toContain('Net Worth Breakdown')
    expect(netWorthWrapper.text()).toContain('Total Net Worth')

    await netWorthWrapper.find('button').trigger('click')
    expect(netWorthWrapper.emitted('close')).toBeTruthy()

    settingsStore.filterType = 'yearly'
    const yearlyWrapper = mount(DetailModal, {
      props: { show: true, type: 'budget_spent' },
      global: { stubs: { CommonModal: CommonModalStub } }
    })

    expect(yearlyWrapper.text()).toContain('Annual Expenses Ledger')
    expect(yearlyWrapper.text()).toContain('Total Spending')
  })

  it('BudgetTrendChart shows tooltip on mouse events', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 500, height: 500, bottom: 500, right: 500, x: 0, y: 0, toJSON: () => {}
    })
    
    const wrapper = mount(BudgetTrendChart)
    
    // Find an income bar
    const incomeBar = wrapper.findAll('div[class*="cursor-pointer"]').find(b => b.html().includes('bg-secondary'))
    expect(incomeBar).toBeDefined()
    
    await incomeBar!.trigger('mouseenter')
    await incomeBar!.trigger('mousemove', { clientX: 100, clientY: 100 })
    
    expect(wrapper.text()).toContain('Income')
    
    // Find spending bar
    const spendingBar = wrapper.findAll('div[class*="cursor-pointer"]').find(b => b.html().includes('bg-primary'))
    await spendingBar!.trigger('mouseenter')
    expect(wrapper.text()).toContain('Spending')
    
    // Find savings bar
    const savingsBar = wrapper.findAll('div[class*="cursor-pointer"]').find(b => b.html().includes('bg-tertiary'))
    await savingsBar!.trigger('mouseenter')
    expect(wrapper.text()).toContain('Savings')
    
    await savingsBar!.trigger('mouseleave')
    expect(wrapper.find('div[class*="absolute bg-[#1f1f27]/95"]').exists()).toBe(false)
  })
})