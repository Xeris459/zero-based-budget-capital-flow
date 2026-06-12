/**
 * ZbbStatusBanner Component — UI Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import ZbbStatusBanner from '~/components/Dashboard/ZbbStatusBanner.vue'

const iconStub = { template: '<span />' }

describe('ZbbStatusBanner.vue', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  const mountBanner = () => {
    return mount(ZbbStatusBanner, {
      global: {
        stubs: {
          CheckCircle: iconStub,
          AlertCircle: iconStub,
          AlertTriangle: iconStub
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

  it('shows balanced state when toAssign === 0', () => {
    // Default seed data is balanced: totalReadyToAssign = totalAssigned = 15M
    expect(store.toAssign).toBe(0)

    const wrapper = mountBanner()
    expect(wrapper.text()).toContain('Every Rupiah Has a Job!')
    expect(wrapper.html()).toContain('border-l-secondary')
  })

  it('shows warning when toAssign > 0 (under-allocated)', async () => {
    // Reduce one expense budget to make toAssign > 0
    await store.setBudgetPlanned('cat-exp-housing', 0) // Remove 5M from assigned

    const wrapper = mountBanner()
    expect(store.toAssign).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Ready to Allocate')
    expect(wrapper.html()).toContain('border-l-tertiary')
  })

  it('shows error when toAssign < 0 (over-allocated)', async () => {
    // Add extra budget allocation to exceed income
    await store.setBudgetPlanned('cat-exp-housing', 20000000) // Set housing to 20M (way over)

    const wrapper = mountBanner()
    expect(store.toAssign).toBeLessThan(0)
    expect(wrapper.text()).toContain('Over Allocated!')
    expect(wrapper.html()).toContain('border-l-error')
  })

  it('displays formatted currency values', () => {
    const wrapper = mountBanner()

    // Check Total Planned Income label and value
    expect(wrapper.text()).toContain('Total Planned Income')
    expect(wrapper.text()).toContain(settingsStore.formatIndonesianHuman(store.totalReadyToAssign))

    // Check Total Assigned label and value
    expect(wrapper.text()).toContain('Total Assigned')
    expect(wrapper.text()).toContain(settingsStore.formatIndonesianHuman(store.totalAssigned))

    // Check To Assign label and value
    expect(wrapper.text()).toContain('To Assign')
    expect(wrapper.text()).toContain(settingsStore.formatIndonesianHuman(store.toAssign))
  })
})
