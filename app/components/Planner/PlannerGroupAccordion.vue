<template>
  <div class="glass-panel rounded-xl overflow-hidden border border-[#464554]/30">
    <!-- Accordion Header -->
    <div
      @click="toggleExpand"
      class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-bright/20 transition-all select-none border-b border-[#464554]/20"
    >
      <div class="flex items-center gap-3">
        <component :is="expanded ? ChevronDown : ChevronRight" class="w-4 h-4 text-on-surface-variant" />
        <h3 class="text-sm font-bold text-on-surface tracking-wide">{{ group.name }}</h3>
      </div>
      <div class="flex items-center gap-6">
        <div class="text-right">
          <span class="text-[10px] text-on-surface-variant uppercase font-bold block">Planned</span>
          <span class="text-xs font-bold text-on-surface">{{ settingsStore.formatValue(groupPlanned) }}</span>
        </div>
        <div class="text-right" v-if="group.id !== 'income'">
          <span class="text-[10px] text-on-surface-variant uppercase font-bold block">Actual Spent</span>
          <span class="text-xs font-bold text-on-surface">{{ settingsStore.formatValue(groupActual) }}</span>
        </div>
      </div>
    </div>

    <!-- Accordion Content -->
    <div v-show="expanded" class="p-5 bg-surface-container-lowest/30">
      <!-- Desktop Table View -->
      <table class="hidden md:table w-full text-left border-collapse">
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
            v-for="cat in categories"
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
                  type="text"
                  :value="getPlannedValue(cat.id)"
                  @input="handlePlannedInput(cat.id, $event)"
                  @blur="updatePlanned(cat.id, $event.target.value)"
                  @keyup.enter="$event.target.blur()"
                  class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-2 py-1 text-right text-xs font-bold text-on-surface focus:border-primary focus:ring-0 w-28"
                />
                <span v-if="settingsStore.kMode" class="text-xs text-on-surface-variant font-bold">K</span>
              </div>
            </td>

            <!-- Actual Spent (Read Only) -->
            <td class="py-3 text-right text-xs font-bold text-on-surface" v-if="group.id !== 'income'">
              {{ settingsStore.formatValue(getActualSpent(cat.id)) }}
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
              <div v-if="addingCategory" class="flex items-center gap-3">
                <input
                  v-model="newCatName"
                  placeholder="Category Name (e.g. WiFi Bill)"
                  class="bg-[#13131b] border border-primary/50 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none w-56 text-on-surface"
                  v-focus
                />
                <button
                  @click="saveNewCategory"
                  class="px-3 py-1.5 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
                >
                  Add
                </button>
                <button
                  @click="addingCategory = false"
                  class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
                >
                  Cancel
                </button>
              </div>
              <button
                v-else
                @click="addingCategory = true; newCatName = ''"
                class="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1"
              >
                <Plus class="w-4 h-4" />
                Add Subcategory
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card List View -->
      <div class="block md:hidden space-y-4">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="glass-panel p-3.5 rounded-lg border border-[#464554]/20 flex flex-col gap-3"
        >
          <!-- Header: Title & Edit/Delete actions -->
          <div class="flex items-center justify-between border-b border-[#464554]/10 pb-2">
            <div class="flex items-center gap-2 flex-1 mr-2">
              <span v-if="editingCatId !== cat.id" class="text-xs font-bold text-on-surface">{{ cat.name }}</span>
              <input
                v-else
                v-model="editingCatName"
                @blur="saveCategoryName(cat.id)"
                @keyup.enter="saveCategoryName(cat.id)"
                class="bg-surface-dim border border-primary/50 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none w-full text-on-surface"
                v-focus
              />
              <button
                v-if="editingCatId !== cat.id"
                @click="startEditCategory(cat.id, cat.name)"
                class="text-on-surface-variant hover:text-primary transition-colors p-1"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              @click="deleteCategory(cat.id)"
              class="text-on-surface-variant hover:text-error transition-colors p-1"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Planned limit input row -->
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-on-surface-variant uppercase font-bold">Planned Limit</span>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-on-surface-variant font-bold">Rp</span>
              <input
                type="text"
                :value="getPlannedValue(cat.id)"
                @input="handlePlannedInput(cat.id, $event)"
                @blur="updatePlanned(cat.id, $event.target.value)"
                @keyup.enter="$event.target.blur()"
                class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-2 py-1 text-right text-xs font-bold text-on-surface focus:border-primary focus:ring-0 w-32"
              />
              <span v-if="settingsStore.kMode" class="text-xs text-on-surface-variant font-bold">K</span>
            </div>
          </div>

          <!-- Actual & Diff grid (only for non-income) -->
          <div v-if="group.id !== 'income'" class="grid grid-cols-2 gap-2 bg-surface-dim/40 p-2 rounded-md border border-[#464554]/10">
            <div class="flex flex-col">
              <span class="text-[9px] text-on-surface-variant uppercase font-semibold">Actual Spent</span>
              <span class="text-xs font-bold text-on-surface mt-0.5">
                {{ settingsStore.formatValue(getActualSpent(cat.id)) }}
              </span>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-[9px] text-on-surface-variant uppercase font-semibold">Difference</span>
              <span
                class="text-xs font-bold mt-0.5"
                :class="[getDiff(cat.id) < 0 ? 'text-error' : 'text-secondary']"
              >
                {{ getDiffText(cat.id) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Add Subcategory Row for Mobile -->
        <div class="pt-2">
          <div v-if="addingCategory" class="flex flex-col gap-2 bg-surface-dim/35 p-3 rounded-lg border border-primary/20">
            <input
              v-model="newCatName"
              placeholder="Category Name (e.g. WiFi Bill)"
              class="bg-[#13131b] border border-primary/50 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none w-full text-on-surface"
              v-focus
            />
            <div class="flex gap-2 justify-end">
              <button
                @click="addingCategory = false"
                class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
              >
                Cancel
              </button>
              <button
                @click="saveNewCategory"
                class="px-3 py-1.5 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
              >
                Add
              </button>
            </div>
          </div>
          <button
            v-else
            @click="addingCategory = true; newCatName = ''"
            class="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1"
          >
            <Plus class="w-4 h-4" />
            Add Subcategory
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ref, computed } from 'vue'
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Plus
} from '@lucide/vue'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const expanded = ref(props.group.expanded)
const toggleExpand = () => {
  expanded.value = !expanded.value
}

// Categories list in group
const categories = computed(() => {
  return store.categories.filter(c => c.parentId === props.group.id)
})

// Planned/actual summaries for group
const groupPlanned = computed(() => {
  const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
  return store.budgets
    .filter(b => b.month === activeMonthStr)
    .filter(b => {
      const cat = store.categories.find(c => c.id === b.categoryId)
      return cat?.parentId === props.group.id
    })
    .reduce((sum, b) => sum + b.planned, 0)
})

const groupActual = computed(() => {
  return store.periodTransactions
    .filter(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)
      return cat?.parentId === props.group.id
    })
    .reduce((sum, t) => sum - t.amount, 0)
})

// Individual category details
const getPlannedValue = (categoryId) => {
  const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
  const budget = store.budgets.find(b => b.month === activeMonthStr && b.categoryId === categoryId)
  if (!budget) return '0'
  const val = settingsStore.kMode ? budget.planned / 1000 : budget.planned
  return val.toLocaleString('id-ID')
}

const updatePlanned = (categoryId, value) => {
  const cleanValue = String(value).replace(/\./g, '')
  const parsedValue = parseFloat(cleanValue) || 0
  const absoluteValue = settingsStore.kMode ? parsedValue * 1000 : parsedValue
  store.setBudgetPlanned(categoryId, absoluteValue)
}

const handlePlannedInput = (categoryId, event) => {
  const inputVal = event.target.value
  const clean = inputVal.replace(/\D/g, '')
  if (!clean) {
    event.target.value = ''
    return
  }
  const num = parseInt(clean, 10)
  event.target.value = num.toLocaleString('id-ID')
}

const getActualSpent = (categoryId) => {
  return store.periodTransactions
    .filter(t => t.categoryId === categoryId)
    .reduce((sum, t) => sum - t.amount, 0)
}

const getDiff = (categoryId) => {
  const activeMonthStr = `${settingsStore.currentYear}-${settingsStore.currentMonth}`
  const planned = store.budgets.find(b => b.month === activeMonthStr && b.categoryId === categoryId)?.planned || 0
  const actual = getActualSpent(categoryId)
  return planned - actual
}

const getDiffText = (categoryId) => {
  const diff = getDiff(categoryId)
  if (diff < 0) {
    return `-${settingsStore.formatValue(Math.abs(diff))}`
  }
  return settingsStore.formatValue(diff)
}

// Inline Subcategory addition
const addingCategory = ref(false)
const newCatName = ref('')

const saveNewCategory = () => {
  if (!newCatName.value.trim()) return
  store.addCategory(newCatName.value.trim(), props.group.id)
  addingCategory.value = false
  newCatName.value = ''
}

// Inline Renaming
const editingCatId = ref(null)
const editingCatName = ref('')

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

// Deletion
const deleteCategory = (id) => {
  if (confirm('Are you sure you want to delete this subcategory? All associated budgets will be removed.')) {
    store.deleteCategory(id)
  }
}

// Directives
const vFocus = {
  mounted: (el) => el.focus()
}
</script>
