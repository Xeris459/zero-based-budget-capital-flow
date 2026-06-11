<template>
  <div>
    <!-- Zero-Based Budget Banner -->
    <div class="glass-panel border-l-4 rounded-r-xl rounded-l-sm p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
      :class="[store.toAssign === 0 ? 'border-l-secondary bg-secondary/5' : store.toAssign > 0 ? 'border-l-tertiary bg-tertiary/5' : 'border-l-error bg-error/5']"
    >
      <div class="flex flex-col gap-1 z-10">
        <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Zero-Based Status</span>
        <div class="flex items-center gap-2 mt-1">
          <CheckCircle v-if="store.toAssign === 0" class="w-5 h-5 text-secondary" />
          <AlertCircle v-else-if="store.toAssign > 0" class="w-5 h-5 text-tertiary" />
          <AlertTriangle v-else class="w-5 h-5 text-error" />
          
          <span class="text-lg font-bold"
            :class="[store.toAssign === 0 ? 'text-secondary' : store.toAssign > 0 ? 'text-tertiary' : 'text-error']"
          >
            {{ store.toAssign === 0 ? 'Every Rupiah Has a Job!' : store.toAssign > 0 ? 'Ready to Allocate' : 'Over Allocated!' }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-6 z-10">
        <div class="flex flex-col text-right">
          <span class="text-xs text-on-surface-variant font-medium">Ready to Assign</span>
          <span class="text-sm font-bold text-on-surface mt-1">{{ store.formatValue(store.totalReadyToAssign) }}</span>
        </div>
        <div class="h-8 w-px bg-[#464554]/40"></div>
        <div class="flex flex-col text-right">
          <span class="text-xs text-on-surface-variant font-medium">Allocated</span>
          <span class="text-sm font-bold text-on-surface mt-1">{{ store.formatValue(store.totalAssigned) }}</span>
        </div>
        <div class="h-8 w-px bg-[#464554]/40"></div>
        <div class="flex flex-col text-right">
          <span class="text-xs font-medium" :class="[store.toAssign === 0 ? 'text-secondary' : store.toAssign > 0 ? 'text-tertiary' : 'text-error']">To Assign</span>
          <span class="text-xl font-extrabold mt-1" :class="[store.toAssign === 0 ? 'text-secondary' : store.toAssign > 0 ? 'text-tertiary' : 'text-error']">
            {{ store.formatValue(store.toAssign) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Action Toolbar -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold text-on-surface flex items-center gap-2">
        <CalendarRange class="w-5 h-5 text-primary" />
        Budget Planner
      </h2>
      <div class="flex items-center gap-3">
        <button
          @click="store.copyPreviousMonthPlan()"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright/50 border border-[#464554]/40 text-xs font-semibold text-primary transition-all duration-200"
        >
          <Copy class="w-3.5 h-3.5" />
          Copy Previous Month
        </button>
        <button
          @click="confirmReset"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-error/10 border border-error/30 text-xs font-semibold text-error transition-all duration-200"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Reset Plan
        </button>
      </div>
    </div>

    <!-- Category Groups List -->
    <div class="flex flex-col gap-5">
      <div
        v-for="group in groups"
        :key="group.id"
        class="glass-panel rounded-xl overflow-hidden border border-[#464554]/30"
      >
        <!-- Accordion Header -->
        <div
          @click="toggleGroup(group.id)"
          class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-bright/20 transition-all select-none border-b border-[#464554]/20"
        >
          <div class="flex items-center gap-3">
            <component :is="group.expanded ? ChevronDown : ChevronRight" class="w-4 h-4 text-on-surface-variant" />
            <h3 class="text-sm font-bold text-on-surface tracking-wide">{{ group.name }}</h3>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="text-[10px] text-on-surface-variant uppercase font-bold block">Planned</span>
              <span class="text-xs font-bold text-on-surface">{{ store.formatValue(getGroupPlanned(group.id)) }}</span>
            </div>
            <div class="text-right" v-if="group.id !== 'income'">
              <span class="text-[10px] text-on-surface-variant uppercase font-bold block">Actual Spent</span>
              <span class="text-xs font-bold text-on-surface">{{ store.formatValue(getGroupActual(group.id)) }}</span>
            </div>
          </div>
        </div>

        <!-- Accordion Content -->
        <div v-show="group.expanded" class="p-5 bg-surface-container-lowest/30">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#464554]/20 pb-2">
                <th class="text-[10px] text-on-surface-variant uppercase font-bold pb-2">Category</th>
                <th class="text-[10px] text-on-surface-variant uppercase font-bold pb-2 text-right w-36">Planned Limit</th>
                <th class="text-[10px] text-on-surface-variant uppercase font-bold pb-2 text-right w-36" v-if="group.id !== 'income'">Actual Spent</th>
                <th class="text-[10px] text-on-surface-variant uppercase font-bold pb-2 text-right w-36" v-if="group.id !== 'income'">Difference</th>
                <th class="text-[10px] text-on-surface-variant uppercase font-bold pb-2 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- List Category Items -->
              <tr
                v-for="cat in getCategoriesByGroup(group.id)"
                :key="cat.id"
                class="border-b border-[#464554]/10 last:border-none hover:bg-surface-bright/10 transition-colors"
              >
                <!-- Category Name -->
                <td class="py-3 text-xs font-semibold text-on-surface flex items-center gap-2">
                  <span v-if="editingCatId !== cat.id">{{ cat.name }}</span>
                  <input
                    v-else
                    v-model="editingCatName"
                    @blur="saveCategoryName(cat.id)"
                    @keyup.enter="saveCategoryName(cat.id)"
                    class="bg-surface-dim border border-primary/50 rounded px-2 py-1 text-xs font-semibold focus:outline-none w-48 text-on-surface"
                    v-focus
                  />
                  <button
                    v-if="editingCatId !== cat.id"
                    @click="startEditCategory(cat.id, cat.name)"
                    class="text-on-surface-variant hover:text-primary transition-colors p-1"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                </td>

                <!-- Planned Budget Input -->
                <td class="py-3 text-right">
                  <div class="flex justify-end items-center gap-1.5">
                    <span class="text-xs text-on-surface-variant font-bold">Rp</span>
                    <input
                      type="number"
                      step="any"
                      :value="getPlannedValue(cat.id)"
                      @blur="updatePlanned(cat.id, $event.target.value)"
                      @keyup.enter="$event.target.blur()"
                      class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-2 py-1 text-right text-xs font-bold text-on-surface focus:border-primary focus:ring-0 w-28"
                    />
                    <span v-if="store.kMode" class="text-xs text-on-surface-variant font-bold">K</span>
                  </div>
                </td>

                <!-- Actual Spent (Read Only) -->
                <td class="py-3 text-right text-xs font-bold text-on-surface" v-if="group.id !== 'income'">
                  {{ store.formatValue(getActualSpent(cat.id)) }}
                </td>

                <!-- Difference -->
                <td class="py-3 text-right text-xs font-bold" v-if="group.id !== 'income'"
                  :class="[getDiff(cat.id) < 0 ? 'text-error' : 'text-secondary']"
                >
                  {{ getDiffText(cat.id) }}
                </td>

                <!-- Delete Category -->
                <td class="py-3 text-center">
                  <button
                    @click="deleteCategory(cat.id)"
                    class="text-on-surface-variant hover:text-error transition-colors p-1"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <!-- Add Inline Category Row -->
              <tr>
                <td colspan="5" class="pt-3">
                  <div v-if="addingToGroupId === group.id" class="flex items-center gap-3">
                    <input
                      v-model="newCatName"
                      placeholder="Category Name (e.g. WiFi Bill)"
                      class="bg-[#13131b] border border-primary/50 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none w-56 text-on-surface"
                      v-focus
                    />
                    <button
                      @click="saveNewCategory(group.id)"
                      class="px-3 py-1.5 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
                    >
                      Add
                    </button>
                    <button
                      @click="addingToGroupId = null"
                      class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    v-else
                    @click="addingToGroupId = group.id; newCatName = ''"
                    class="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1"
                  >
                    <Plus class="w-4 h-4" />
                    Add Subcategory
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { ref, computed } from 'vue'
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  Copy,
  RotateCcw
} from '@lucide/vue'

const store = useBudgetStore()

const groups = ref([
  { id: 'income', name: 'Income Sources', expanded: true },
  { id: 'expenses', name: 'Expenses Categories', expanded: true },
  { id: 'savings', name: 'Savings Goals', expanded: true },
  { id: 'debt', name: 'Debt Payoffs', expanded: true }
])

const toggleGroup = (id) => {
  const g = groups.value.find(item => item.id === id)
  if (g) g.expanded = !g.expanded
}

const getCategoriesByGroup = (parentId) => {
  return store.categories.filter(c => c.parentId === parentId)
}

// Display planned value depending on K-mode (divided by 1000 if true)
const getPlannedValue = (categoryId) => {
  const activeMonthStr = `${store.currentYear}-${store.currentMonth}`
  const budget = store.budgets.find(b => b.month === activeMonthStr && b.categoryId === categoryId)
  if (!budget) return 0
  return store.kMode ? budget.planned / 1000 : budget.planned
}

// Update planned values from input
const updatePlanned = (categoryId, value) => {
  const parsedValue = parseFloat(value) || 0
  const absoluteValue = store.kMode ? parsedValue * 1000 : parsedValue
  store.setBudgetPlanned(categoryId, absoluteValue)
}

// Group summaries
const getGroupPlanned = (groupId) => {
  const activeMonthStr = `${store.currentYear}-${store.currentMonth}`
  return store.budgets
    .filter(b => b.month === activeMonthStr)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat?.parentId === groupId
    })
    .reduce((sum, b) => sum + b.planned, 0)
}

const getGroupActual = (groupId) => {
  return store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat?.parentId === groupId
    })
    .reduce((sum, t) => sum - t.amount, 0) // absolute value
}

// Category Specifics
const getActualSpent = (categoryId) => {
  return store.periodTransactions
    .filter(t => t.categoryId === categoryId)
    .reduce((sum, t) => sum - t.amount, 0)
}

const getDiff = (categoryId) => {
  const activeMonthStr = `${store.currentYear}-${store.currentMonth}`
  const planned = store.budgets.find(b => b.month === activeMonthStr && b.categoryId === categoryId)?.planned || 0
  const actual = getActualSpent(categoryId)
  return planned - actual
}

const getDiffText = (categoryId) => {
  const diff = getDiff(categoryId)
  if (diff < 0) {
    return `-${store.formatValue(Math.abs(diff))}`
  }
  return store.formatValue(diff)
}

// Inline additions
const addingToGroupId = ref(null)
const newCatName = ref('')

const saveNewCategory = (groupId) => {
  if (!newCatName.value.trim()) return
  store.addCategory(newCatName.value.trim(), groupId)
  addingToGroupId.value = null
  newCatName.value = ''
}

// Inline Renaming
const editingCatId = ref(null)
const editingCatName = ref('')

const startEditCategory = (id, name) => {
  editingCatId.value = id
  editingCatName.value = name
}

const saveCategoryName = (id) => {
  if (!editingCatName.value.trim()) return
  const cat = store.categories.find(c => c.id === id)
  if (cat) {
    cat.name = editingCatName.value.trim()
    store.saveState()
  }
  editingCatId.value = null
}

const deleteCategory = (id) => {
  if (confirm('Are you sure you want to delete this subcategory? All associated budgets will be removed.')) {
    store.deleteCategory(id)
  }
}

const confirmReset = () => {
  if (confirm('Are you sure you want to reset current month plan? This clears all planned values for this month.')) {
    store.resetCurrentPlan()
  }
}

// Directives
const vFocus = {
  mounted: (el) => el.focus()
}
</script>
