/**
 * Sidebar Component — UI Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import Sidebar from '~/components/Common/Sidebar.vue'
import { populateMockData } from '../../mockData'

// Mock #imports to control useRoute
vi.mock('#imports', () => ({
  useRoute: () => ({ path: '/', params: {}, query: {}, name: 'index' })
}))

const iconStub = { template: '<span />' }

describe('Sidebar.vue', () => {
  let store: ReturnType<typeof useBudgetStore>
  let settingsStore: ReturnType<typeof useSettingsStore>

  const mountSidebar = () => {
    return mount(Sidebar, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to" :class="$attrs.class"><slot /></a>',
            props: ['to']
          },
          LayoutDashboard: iconStub,
          Wallet: iconStub,
          Receipt: iconStub,
          Landmark: iconStub,
          Settings: iconStub,
          HelpCircle: iconStub
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

  it('renders app name "Capital Flow"', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Capital Flow')
  })

  it('renders all 4 navigation links', () => {
    const wrapper = mountSidebar()
    const links = wrapper.findAll('a')
    const navLinks = links.filter(l => {
      const href = l.attributes('href')
      return href === '/' || href === '/planner' || href === '/transactions' || href === '/accounts'
    })
    expect(navLinks.length).toBe(4)
  })

  it('renders navigation items text', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Budget Planner')
    expect(wrapper.text()).toContain('Transactions')
    expect(wrapper.text()).toContain('Accounts')
  })

  it('renders K-Mode toggle button', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Redenomination (K)')
    // Find toggle area
    const toggleArea = wrapper.find('.rounded-full')
    expect(toggleArea.exists()).toBe(true)
  })

  it('clicking K-Mode toggle calls settingsStore.toggleKMode()', async () => {
    const wrapper = mountSidebar()
    expect(settingsStore.kMode).toBe(true)

    // Find the toggle button specifically
    const buttons = wrapper.findAll('button')
    const toggleBtn = buttons.find(b => b.classes().some(c => c.includes('rounded-full')))
    expect(toggleBtn).toBeDefined()

    await toggleBtn!.trigger('click')
    expect(settingsStore.kMode).toBe(false)
    })

  it('renders tooltips and hides labels when collapsed', async () => {
    settingsStore.isSidebarCollapsed = true
    const wrapper = mountSidebar()
    await nextTick()

    // Labels should be hidden (v-if="!settingsStore.isSidebarCollapsed")
    // They are spans with transition-opacity class
    expect(wrapper.find('span.transition-opacity').exists()).toBe(false)

    // Tooltips should be present
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Settings')
  })
    })
