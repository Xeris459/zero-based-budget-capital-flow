<template>
  <CommonModal :show="show" @close="close">
    <template #header>
      {{ transaction ? 'Edit Transaction' : 'Add New Transaction' }}
    </template>

    <template #body>
      <form class="space-y-4 pt-2">
        <!-- Date -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase">Date</label>
          <input
            type="date"
            v-model="form.date"
            class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            required
          />
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase">Description</label>
          <input
            type="text"
            v-model="form.description"
            placeholder="e.g. Weekly Groceries, Paycheck"
            class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            required
          />
        </div>

        <!-- Inflow / Outflow toggle -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase">Transaction Type</label>
          <div class="grid grid-cols-2 gap-2 bg-[#13131b]/60 p-1 rounded-lg border border-[#464554]/30">
            <button
              type="button"
              @click="setTxType('outflow')"
              class="py-1.5 rounded-md text-xs font-bold transition-all"
              :class="[formType === 'outflow' ? 'bg-error/15 text-error border border-error/20' : 'text-on-surface-variant hover:text-on-surface']"
            >
              Expense (Outflow)
            </button>
            <button
              type="button"
              @click="setTxType('inflow')"
              class="py-1.5 rounded-md text-xs font-bold transition-all"
              :class="[formType === 'inflow' ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'text-on-surface-variant hover:text-on-surface']"
            >
              Income (Inflow)
            </button>
          </div>
        </div>

        <!-- Amount -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase">Amount</label>
          <div class="relative flex items-center">
            <span class="absolute left-3 text-xs font-bold text-on-surface-variant">Rp</span>
            <input
              type="number"
              step="any"
              v-model="formAmount"
              placeholder="0"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg pl-9 pr-8 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
              required
            />
            <span v-if="store.kMode" class="absolute right-3 text-xs font-bold text-on-surface-variant">K</span>
          </div>
        </div>

        <!-- Account -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase">Account</label>
          <select
            v-model="form.accountId"
            class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            required
          >
            <option v-for="acc in store.accounts" :key="acc.id" :value="acc.id">
              {{ acc.name }} ({{ store.formatValueRaw(acc.balance) }})
            </option>
          </select>
        </div>

        <!-- Category -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase">Category</label>
          <select
            v-model="form.categoryId"
            class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
            required
          >
            <!-- Inflow categories -->
            <optgroup label="Income Sources" v-if="formType === 'inflow'">
              <option v-for="cat in incomeCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </optgroup>
            <!-- Outflow categories -->
            <template v-else>
              <optgroup label="Expenses">
                <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </optgroup>
              <optgroup label="Savings Goals">
                <option v-for="cat in savingsCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </optgroup>
              <optgroup label="Debt Payoffs">
                <option v-for="cat in debtCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </optgroup>
            </template>
          </select>
        </div>

        <!-- Shift to Next Month (Only for Inflow) -->
        <div v-if="formType === 'inflow'" class="flex items-center justify-between bg-surface-container-high rounded-xl p-3 border border-[#464554]/20">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-bold text-on-surface">Shift to Next Month</span>
            <span class="text-[10px] text-on-surface-variant font-medium">Use this late income for next month's budget pool</span>
          </div>
          <button
            type="button"
            @click="form.shiftToNextMonth = !form.shiftToNextMonth"
            class="w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50"
            :class="[form.shiftToNextMonth ? 'bg-secondary' : 'bg-surface-variant']"
          >
            <span
              class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
              :class="[form.shiftToNextMonth ? 'right-1' : 'left-1']"
            ></span>
          </button>
        </div>
      </form>
    </template>

    <template #footer>
      <button
        @click="close"
        class="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
      >
        Cancel
      </button>
      <button
        @click="save"
        class="px-4 py-2 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
      >
        Save Transaction
      </button>
    </template>
  </CommonModal>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  transaction: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const store = useBudgetStore()

const form = ref({
  date: '',
  description: '',
  amount: 0,
  accountId: '',
  categoryId: '',
  shiftToNextMonth: false
})

const formAmount = ref('')
const formType = ref('outflow')

// Filter categories
const incomeCategories = computed(() => store.categories.filter(c => c.parentId === 'income'))
const expenseCategories = computed(() => store.categories.filter(c => c.parentId === 'expenses'))
const savingsCategories = computed(() => store.categories.filter(c => c.parentId === 'savings'))
const debtCategories = computed(() => store.categories.filter(c => c.parentId === 'debt'))

const setTxType = (type) => {
  formType.value = type
  
  // Set default category for type
  if (type === 'inflow') {
    if (incomeCategories.value.length) form.value.categoryId = incomeCategories.value[0].id
  } else {
    if (expenseCategories.value.length) form.value.categoryId = expenseCategories.value[0].id
  }
}

// Watch modal trigger
watch(() => props.show, (newShow) => {
  if (newShow) {
    if (props.transaction) {
      // Edit mode
      form.value = { ...props.transaction }
      formType.value = props.transaction.amount > 0 ? 'inflow' : 'outflow'
      
      const rawAmt = Math.abs(props.transaction.amount)
      formAmount.value = store.kMode ? String(rawAmt / 1000) : String(rawAmt)
    } else {
      // Create mode
      form.value = {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        accountId: store.accounts[0]?.id || '',
        categoryId: expenseCategories.value[0]?.id || '',
        shiftToNextMonth: false
      }
      formAmount.value = ''
      formType.value = 'outflow'
    }
  }
})

const close = () => {
  emit('close')
}

const save = () => {
  if (!form.value.description.trim() || !formAmount.value) {
    alert('Please enter all required fields.')
    return
  }

  const amtNum = parseFloat(formAmount.value) || 0
  const absoluteAmount = store.kMode ? amtNum * 1000 : amtNum
  
  // Expenses are stored as negative, inflows as positive
  form.value.amount = formType.value === 'outflow' ? -absoluteAmount : absoluteAmount

  if (props.transaction) {
    store.editTransaction(form.value)
  } else {
    store.addTransaction(form.value)
  }

  close()
}
</script>
