/**
 * PlannerYearlyGrid Component — UI Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import PlannerYearlyGrid from '~/components/Planner/PlannerYearlyGrid.vue'

const iconStub = { template: '<span />' }

describe('PlannerYearlyGrid.vue', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  const mountGrid = () => {
    return mount(PlannerYearlyGrid, {
      global: {
        stubs: {
          ChevronDown: iconStub,
          ChevronRight: iconStub,
          Edit2: iconStub,
          Trash2: iconStub,
          Plus: iconStub
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

  it('renders all 4 budget groups accordions', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).toContain('Income Sources')
    expect(wrapper.text()).toContain('Expenses Categories')
    expect(wrapper.text()).toContain('Savings Goals')
    expect(wrapper.text()).toContain('Debt Payoffs')
  })

  it('populates planned budget inputs correctly', () => {
    const wrapper = mountGrid()
    
    // Default seed has 'Primary Salary' under Income.
    expect(wrapper.text()).toContain('Primary Salary')
    
    // Default seed planned salary for June is 10.000.000. Under K-Mode: 10.000.
    const inputs = wrapper.findAll('input[type="text"]')
    // Let's check if there is an input with value '10.000'
    const matchingInput = inputs.find(i => (i.element as HTMLInputElement).value === '10.000')
    expect(matchingInput).toBeDefined()
  })

  it('triggers store budget update when input cell is blurred', async () => {
    const setBudgetSpy = vi.spyOn(store, 'setBudgetPlanned')
    const wrapper = mountGrid()
    
    // Let's find the first input element (corresponds to Primary Salary, January)
    const inputs = wrapper.findAll('input[type="text"]')
    const firstInput = inputs[0]
    expect(firstInput).toBeDefined()
    
    // Modify input value
    await firstInput.setValue('8.000')
    await firstInput.trigger('blur')
    
    // Should call store.setBudgetPlanned with category id, 8.000.000 (since 8.000K), and month target '2026-01'
    expect(setBudgetSpy).toHaveBeenCalledWith('cat-inc-salary', 8000000, '2026-01')
  })

  it('calls store.addCategory when adding a new subcategory', async () => {
    const addCatSpy = vi.spyOn(store, 'addCategory')
    const wrapper = mountGrid()

    // Find the first "Add Subcategory" button (Income Sources group)
    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Add Subcategory'))
    expect(addBtn).toBeDefined()
    await addBtn!.trigger('click')

    // An input for name should be visible
    const input = wrapper.find('input[placeholder="Subcategory Name (e.g. WiFi Bill)"]')
    expect(input.exists()).toBe(true)

    // Set name and trigger Add
    await input.setValue('Bonus Salary')
    const submitBtn = wrapper.findAll('button').find(b => b.text() === 'Add')
    expect(submitBtn).toBeDefined()
    await submitBtn!.trigger('click')

    expect(addCatSpy).toHaveBeenCalledWith('Bonus Salary', 'income')
  })

  it('allows inline editing of subcategory name', async () => {
    const wrapper = mountGrid()
    const saveStateSpy = vi.spyOn(store, 'saveState')

    // Find Primary Salary category row, hover would trigger edit button
    // Let's trigger startEditCategory action manually by clicking edit button
    const editBtn = wrapper.find('button[title="Rename Subcategory"]')
    expect(editBtn.exists()).toBe(true)
    await editBtn.trigger('click')

    // Input should be rendered inline
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('Primary Salary')

    // Update name
    await input.setValue('Base Salary')
    await input.trigger('blur')

    // The name in store should be updated and saved
    const cat = store.categories.find(c => c.id === 'cat-inc-salary')
    expect(cat?.name).toBe('Base Salary')
    expect(saveStateSpy).toHaveBeenCalled()
  })

  it('calls store.deleteCategory when deleting a subcategory', async () => {
    const deleteCatSpy = vi.spyOn(store, 'deleteCategory')
    vi.spyOn(window, 'confirm').mockImplementation(() => true)

    const wrapper = mountGrid()

    // Click delete button
    const deleteBtn = wrapper.find('button[title="Delete Subcategory"]')
    expect(deleteBtn.exists()).toBe(true)
    await deleteBtn.trigger('click')

    expect(deleteCatSpy).toHaveBeenCalledWith('cat-inc-salary')
  })
})
