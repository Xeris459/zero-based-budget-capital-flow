/**
 * PlannerGroupAccordion Component — UI Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import PlannerGroupAccordion from '~/components/Planner/PlannerGroupAccordion.vue'
import { populateMockData } from '../../mockData'

const iconStub = { template: '<span />' }

describe('PlannerGroupAccordion.vue', () => {
  let store: ReturnType<typeof useBudgetStore>

  const mountAccordion = (group = { id: 'expenses', name: 'Expenses Categories', expanded: true }) => {
    return mount(PlannerGroupAccordion, {
      props: { group },
      global: {
        stubs: {
          ChevronDown: iconStub,
          ChevronRight: iconStub,
          Edit2: iconStub,
          Trash2: iconStub,
          Plus: iconStub
        },
        directives: {
          focus: { mounted: () => {} }
        }
      }
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBudgetStore()
    populateMockData(store)
  })

  it('renders group name', () => {
    const wrapper = mountAccordion({ id: 'expenses', name: 'Expenses Categories', expanded: true })
    expect(wrapper.text()).toContain('Expenses Categories')
  })

  it('lists subcategories belonging to the group', () => {
    const wrapper = mountAccordion({ id: 'expenses', name: 'Expenses Categories', expanded: true })
    // Expense categories: Housing, Food, Utilities, Entertainment
    expect(wrapper.text()).toContain('Housing')
    expect(wrapper.text()).toContain('Food')
    expect(wrapper.text()).toContain('Utilities')
    expect(wrapper.text()).toContain('Entertainment')
  })

  it('displays planned amounts for each category', () => {
    const wrapper = mountAccordion({ id: 'expenses', name: 'Expenses Categories', expanded: true })
    // Check that Rp prefix appears
    expect(wrapper.text()).toContain('Rp')
    // Check that planned input fields exist
    const inputs = wrapper.findAll('input[type="text"]')
    expect(inputs.length).toBeGreaterThanOrEqual(4) // 4 expense categories
  })

  it('expand/collapse toggle works', async () => {
    const wrapper = mountAccordion({ id: 'expenses', name: 'Expenses Categories', expanded: true })

    // Initially expanded - content should be visible
    const contentDiv = wrapper.find('.p-5')
    expect(contentDiv.attributes('style') || '').not.toContain('display: none')

    // Click header to collapse
    const header = wrapper.find('.cursor-pointer')
    await header.trigger('click')

    // After collapse, content should be hidden (v-show)
    expect(contentDiv.attributes('style') || '').toContain('display: none')

    // Click again to expand
    await header.trigger('click')
    expect(contentDiv.attributes('style') || '').not.toContain('display: none')
  })

  it('shows "Add Subcategory" button text when expanded', () => {
    const wrapper = mountAccordion({ id: 'expenses', name: 'Expenses Categories', expanded: true })
    expect(wrapper.text()).toContain('Add Subcategory')
  })
})
