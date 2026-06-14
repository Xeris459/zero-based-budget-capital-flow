<template>
  <div class="flex flex-col gap-5">
    <div
      v-for="group in groups"
      :key="group.id"
      class="glass-panel rounded-xl overflow-hidden border border-[#464554]/30"
    >
      <!-- Accordion Header -->
      <div
        @click="toggleExpand(group)"
        class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-bright/20 transition-all select-none border-b border-[#464554]/20"
      >
        <div class="flex items-center gap-3">
          <component :is="group.expanded ? ChevronDown : ChevronRight" class="w-4 h-4 text-on-surface-variant" />
          <h3 class="text-sm font-bold text-on-surface tracking-wide">{{ group.name }}</h3>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-on-surface-variant uppercase font-bold block">Annual Total</span>
          <span class="text-xs font-bold text-on-surface">{{ settingsStore.formatValue(getGroupAnnualTotal(group.id)) }}</span>
        </div>
      </div>

      <!-- Accordion Grid Content -->
      <div
        v-show="group.expanded"
        :ref="el => { if (el) tableScrollRefs[group.id] = el }"
        class="p-5 overflow-x-auto bg-surface-container-lowest/30"
        @scroll="handleScroll($event, group.id)"
      >
        <table class="w-full text-left border-collapse min-w-[1690px]">
          <thead>
            <tr class="border-b border-[#464554]/25 bg-surface-container-low/40">
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-3 py-2 border-r border-[#464554]/30 min-w-[240px]">Category</th>
              <th
                v-for="(label, idx) in monthLabels"
                :key="idx"
                class="text-[10px] text-on-surface-variant uppercase font-bold px-2 py-2 text-right border-r border-[#464554]/30 w-[110px] min-w-[110px] max-w-[110px]"
              >
                {{ label }} ({{ settingsStore.currencySymbol }})
              </th>
              <th class="text-[10px] text-on-surface-variant uppercase font-bold px-3 py-2 text-right w-[130px] min-w-[130px] max-w-[130px]">Total ({{ settingsStore.currencySymbol }})</th>
            </tr>
          </thead>
          <tbody>
            <!-- Row for each category -->
            <tr
              v-for="cat in getCategories(group.id)"
              :key="cat.id"
              class="border-b border-[#464554]/10 hover:bg-surface-bright/5 transition-colors group"
            >
              <!-- Category Name -->
              <td class="px-3 py-2 text-xs text-on-surface border-r border-[#464554]/30 min-w-[240px]">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 flex-1">
                    <span v-if="editingCatId !== cat.id" class="font-bold whitespace-nowrap">{{ cat.name }}</span>
                    <input
                      v-else
                      v-model="editingCatName"
                      @blur="saveCategoryName(cat.id)"
                      @keyup.enter="saveCategoryName(cat.id)"
                      class="bg-surface-dim border border-primary/50 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none w-full text-on-surface"
                      v-focus
                    />
                  </div>
                  <div class="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                    <button
                      v-if="editingCatId !== cat.id"
                      @click="startEditCategory(cat.id, cat.name)"
                      class="text-on-surface-variant hover:text-primary transition-colors p-0.5 cursor-pointer"
                      title="Rename Subcategory"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      v-if="editingCatId !== cat.id"
                      @click="deleteCategory(cat.id)"
                      class="text-on-surface-variant hover:text-error transition-colors p-0.5 cursor-pointer"
                      title="Delete Subcategory"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </td>

              <!-- 12 Month Cells -->
              <td
                v-for="m in months"
                :key="m"
                class="px-2 py-1 border-r border-[#464554]/30 w-[110px] min-w-[110px] max-w-[110px]"
              >
                <div class="flex items-center justify-end gap-1">
                  <input
                    type="text"
                    :value="getPlannedValue(cat.id, m)"
                    @input="handlePlannedInput"
                    @blur="updatePlanned(cat.id, m, $event.target.value)"
                    @keyup.enter="$event.target.blur()"
                    class="bg-transparent border border-transparent focus:border-primary hover:border-[#464554]/20 focus:bg-[#13131b] text-right text-xs font-extrabold text-on-surface focus:ring-0 focus:outline-none w-full px-1 py-0.5 rounded-sm transition-all"
                  />
                  <span v-if="settingsStore.kMode" class="text-[10px] text-on-surface-variant font-bold select-none">K</span>
                </div>
              </td>

              <!-- Annual Total -->
              <td class="px-3 py-2 font-extrabold text-xs text-primary whitespace-nowrap w-[130px] min-w-[130px] max-w-[130px]">
                <div class="flex items-center justify-end gap-1">
                  <span>{{ formatGridValue(getCategoryAnnualTotal(cat.id)) }}</span>
                  <span v-if="settingsStore.kMode" class="text-[10px] text-on-surface-variant font-bold select-none">K</span>
                </div>
              </td>
            </tr>

            <!-- Add Subcategory Row -->
            <tr class="border-b border-[#464554]/10 bg-surface-container-lowest/5">
              <td colspan="14" class="px-3 py-2 border-r border-[#464554]/30">
                <div v-if="addingGroupId === group.id" class="flex items-center gap-2">
                  <input
                    v-model="newCatName"
                    placeholder="Subcategory Name (e.g. WiFi Bill)"
                    @keyup.enter="saveNewCategory(group.id)"
                    class="bg-[#13131b] border border-primary/50 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none w-56 text-on-surface"
                    v-focus
                  />
                  <button
                    @click="saveNewCategory(group.id)"
                    class="px-2.5 py-1 rounded bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    @click="addingGroupId = null"
                    class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <button
                  v-else
                  @click="addingGroupId = group.id; newCatName = ''"
                  class="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors p-0.5 cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Subcategory</span>
                </button>
              </td>
            </tr>

            <!-- Column Totals Footer -->
            <tr class="bg-surface-container-low/20 font-extrabold text-xs">
              <td class="px-3 py-3 text-on-surface-variant border-r border-[#464554]/30 min-w-[240px]">Total</td>
              <td
                v-for="m in months"
                :key="m"
                class="px-2 py-3 border-r border-[#464554]/30 w-[110px] min-w-[110px] max-w-[110px]"
              >
                <div class="flex items-center justify-end gap-1">
                  <span class="text-on-surface">{{ formatGridValue(getGroupMonthTotal(group.id, m)) }}</span>
                  <span v-if="settingsStore.kMode" class="text-[10px] text-on-surface-variant font-bold select-none">K</span>
                </div>
              </td>
              <td class="px-3 py-3 w-[130px] min-w-[130px] max-w-[130px]">
                <div class="flex items-center justify-end gap-1">
                  <span class="text-primary">{{ formatGridValue(getGroupAnnualTotal(group.id)) }}</span>
                  <span v-if="settingsStore.kMode" class="text-[10px] text-on-surface-variant font-bold select-none">K</span>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const groups = ref([
  { id: 'income', name: 'Income Sources', expanded: true },
  { id: 'expenses', name: 'Expenses Categories', expanded: true },
  { id: 'savings', name: 'Savings Goals', expanded: true },
  { id: 'debt', name: 'Debt Payoffs', expanded: true }
])

const editingCatId = ref(null)
const editingCatName = ref('')
const addingGroupId = ref(null)
const newCatName = ref('')

const toggleExpand = (group) => {
  group.expanded = !group.expanded
}

const getCategories = (groupId) => {
  return store.categories.filter(c => c.parentId === groupId)
}

const formatGridValue = (value) => {
  const val = settingsStore.kMode ? value / 1000 : value
  return val.toLocaleString('id-ID')
}

const getPlannedValue = (categoryId, monthStr) => {
  const activeMonthStr = `${settingsStore.currentYear}-${monthStr}`
  const budget = store.budgets.find(b => b.month === activeMonthStr && b.categoryId === categoryId)
  if (!budget) return '0'
  const val = settingsStore.kMode ? budget.planned / 1000 : budget.planned
  return val.toLocaleString('id-ID')
}

const updatePlanned = (categoryId, monthStr, value) => {
  const targetMonth = `${settingsStore.currentYear}-${monthStr}`
  const cleanValue = String(value).replace(/\./g, '')
  const parsedValue = parseFloat(cleanValue) || 0
  const absoluteValue = settingsStore.kMode ? parsedValue * 1000 : parsedValue
  store.setBudgetPlanned(categoryId, absoluteValue, targetMonth)
}

const handlePlannedInput = (event) => {
  const inputVal = event.target.value
  const clean = inputVal.replace(/\D/g, '')
  if (!clean) {
    event.target.value = ''
    return
  }
  const num = parseInt(clean, 10)
  event.target.value = num.toLocaleString('id-ID')
}

const getCategoryAnnualTotal = (categoryId) => {
  return store.budgets
    .filter(b => b.month.startsWith(settingsStore.currentYear) && b.categoryId === categoryId)
    .reduce((sum, b) => sum + b.planned, 0)
}

const getGroupMonthTotal = (groupId, monthStr) => {
  const activeMonthStr = `${settingsStore.currentYear}-${monthStr}`
  return store.budgets
    .filter(b => b.month === activeMonthStr)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat?.parentId === groupId
    })
    .reduce((sum, b) => sum + b.planned, 0)
}

const getGroupAnnualTotal = (groupId) => {
  return store.budgets
    .filter(b => b.month.startsWith(settingsStore.currentYear))
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat?.parentId === groupId
    })
    .reduce((sum, b) => sum + b.planned, 0)
}

const startEditCategory = (id, name) => {
  editingCatId.value = id
  editingCatName.value = name
}

const saveCategoryName = async (id) => {
  if (!editingCatName.value.trim()) {
    editingCatId.value = null
    return
  }
  await store.updateCategory(id, editingCatName.value.trim())
  editingCatId.value = null
}

const deleteCategory = (id) => {
  if (confirm('Are you sure you want to delete this subcategory? All associated budgets will be removed.')) {
    store.deleteCategory(id)
  }
}

const saveNewCategory = (groupId) => {
  if (!newCatName.value.trim()) return
  store.addCategory(newCatName.value.trim(), groupId)
  addingGroupId.value = null
  newCatName.value = ''
}

const vFocus = {
  mounted: (el) => el.focus()
}

// Scroll Synchronization setup
const tableScrollRefs = {}
let lastScrollLeft = 0

const handleScroll = (event, groupId) => {
  const scrollLeft = event.target.scrollLeft
  
  // Update other tables in this component
  Object.keys(tableScrollRefs).forEach(id => {
    if (id !== groupId && tableScrollRefs[id]) {
      if (Math.abs(tableScrollRefs[id].scrollLeft - scrollLeft) > 0.5) {
        tableScrollRefs[id].scrollLeft = scrollLeft
      }
    }
  })
  
  // Dispatch event for ZBB ribbon
  if (Math.abs(lastScrollLeft - scrollLeft) > 0.5) {
    lastScrollLeft = scrollLeft
    window.dispatchEvent(new CustomEvent('sync-yearly-scroll', { 
      detail: { scrollLeft, source: groupId } 
    }))
  }
}

const handleGlobalSync = (event) => {
  const { scrollLeft, source } = event.detail
  if (source === 'zbb' && Math.abs(lastScrollLeft - scrollLeft) > 0.5) {
    lastScrollLeft = scrollLeft
    Object.keys(tableScrollRefs).forEach(id => {
      if (tableScrollRefs[id] && Math.abs(tableScrollRefs[id].scrollLeft - scrollLeft) > 0.5) {
        tableScrollRefs[id].scrollLeft = scrollLeft
      }
    })
  }
}

onMounted(() => {
  window.addEventListener('sync-yearly-scroll', handleGlobalSync)
})

onUnmounted(() => {
  window.removeEventListener('sync-yearly-scroll', handleGlobalSync)
})
</script>
