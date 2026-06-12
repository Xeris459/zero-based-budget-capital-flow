/**
 * KpiRibbon Component — UI Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import KpiRibbon from '~/components/Dashboard/KpiRibbon.vue'

const iconStub = { template: '<span />' }

describe('KpiRibbon.vue', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  const mountKpiRibbon = () => {
    return mount(KpiRibbon, {
      global: {
        stubs: {
          TrendingUp: iconStub,
          ArrowUpRight: iconStub,
          PiggyBank: iconStub,
          BarChart2: iconStub,
          DashboardDetailModal: { name: 'DashboardDetailModal', template: '<div />', props: ['show', 'type'] }
        }
      }
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    settingsStore = useSettingsStore()
    store.loadDefaults()
  })

  it('renders Net Worth card with formatted value', () => {
    const wrapper = mountKpiRibbon()
    expect(wrapper.text()).toContain('Net Worth')
    // Check it contains the formatted netWorth value
    const formatted = settingsStore.formatIndonesianHuman(store.netWorth)
    expect(wrapper.text()).toContain(formatted)
  })

  it('renders Savings Rate card with percentage', () => {
    const wrapper = mountKpiRibbon()
    expect(wrapper.text()).toContain('Savings Rate')
    expect(wrapper.text()).toContain('%')
  })

  it('renders Budget Spent card with progress bar', () => {
    const wrapper = mountKpiRibbon()
    expect(wrapper.text()).toContain('Budget Spent')
    // Progress bar is a div with rounded-full class inside the card
    const progressBars = wrapper.findAll('.rounded-full')
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('Budget Spent card shows error styling when over 100%', async () => {
    // Add a huge expense to exceed budget
    await store.addTransaction({
      date: '2026-06-20',
      description: 'Massive Expense',
      amount: -50000000,
      accountId: 'acc-checking',
      categoryId: 'cat-exp-food',
      shiftToNextMonth: false
    })

    const wrapper = mountKpiRibbon()
    // When budgetSpentPercent > 100, the h2 has 'text-error' class
    const html = wrapper.html()
    expect(html).toContain('text-error')
  })

  it('clicking a KPI card triggers the detail modal', async () => {
    const wrapper = mountKpiRibbon()
    // Find the first glass-panel card (Net Worth) and click it
    const cards = wrapper.findAll('.glass-panel')
    expect(cards.length).toBe(3)

    await cards[0].trigger('click')

    // After click, DashboardDetailModal should receive show=true
    const modal = wrapper.findComponent({ name: 'DashboardDetailModal' })
    expect(modal.props('show')).toBe(true)
  })
})
