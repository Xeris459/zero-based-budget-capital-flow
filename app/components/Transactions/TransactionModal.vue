<template>
  <CommonModal :show="show" size="2xl" @close="close">
    <template #header>
      <div class="flex flex-col">
        <span>{{ transaction ? 'Edit Transaction' : 'Add New Transaction' }}</span>
        <span class="text-[10px] font-semibold text-on-surface-variant normal-case mt-0.5">Record an inflow or outflow transaction in your ledger</span>
      </div>
    </template>

    <template #body>
      <form class="pt-2 pb-1" @submit.prevent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <!-- Left Column: Details -->
          <div class="space-y-4">
            <!-- Transaction Type (Toggle pills) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Transaction Type</label>
              <div class="grid grid-cols-2 gap-2 bg-[#13131b]/60 p-1 rounded-xl border border-[#464554]/30">
                <button
                  type="button"
                  @click="setTxType('outflow')"
                  class="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  :class="[formType === 'outflow' ? 'bg-error/15 text-error border border-error/20' : 'text-on-surface-variant hover:text-on-surface']"
                >
                  Expense (Outflow)
                </button>
                <button
                  type="button"
                  @click="setTxType('inflow')"
                  class="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  :class="[formType === 'inflow' ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'text-on-surface-variant hover:text-on-surface']"
                >
                  Income (Inflow)
                </button>
              </div>
            </div>

            <!-- Date -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Date</label>
              <div class="relative flex items-center">
                <Calendar class="absolute left-3 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type="date"
                  v-model="form.date"
                  class="bg-[#13131b] border border-[#464554]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none w-full"
                  required
                />
              </div>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Description</label>
              <div class="relative flex items-center">
                <Tag class="absolute left-3 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type="text"
                  v-model="form.description"
                  placeholder="e.g. Weekly Groceries, Salary, Cafe"
                  class="bg-[#13131b] border border-[#464554]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none w-full placeholder-[#464554]"
                  required
                />
              </div>
            </div>

            <!-- Account Selector -->
            <div class="flex flex-col gap-1.5" ref="dropdownContainer">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Source/Destination Account</label>
              <div class="relative flex flex-col">
                <!-- Hidden native select for test suites or form integrations -->
                <select
                  v-model="form.accountId"
                  class="hidden"
                  aria-hidden="true"
                >
                  <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
                    {{ getBankCode(acc.bankId) }} — {{ acc.name }} ({{ settingsStore.formatValueRaw(acc.balance) }})
                  </option>
                </select>                <div class="relative flex items-center">
                  <CreditCard class="absolute left-3 w-4 h-4 text-on-surface-variant pointer-events-none z-10" />
                  <button
                    ref="buttonRef"
                    type="button"
                    @click="toggleAccountDropdown"
                    class="w-full bg-[#13131b] border border-[#464554]/40 rounded-xl pl-10 pr-4 py-2.5 text-left transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 relative flex items-center justify-between min-h-[38px] cursor-pointer"
                    :class="{ 'border-primary ring-1 ring-primary/30': accountDropdownOpen }"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <template v-if="selectedAccount">
                        <span
                          class="px-1.5 py-0.5 rounded text-[9px] font-black text-white shadow-sm flex-shrink-0"
                          :style="{ backgroundColor: selectedAccountBankColor }"
                        >
                          {{ selectedAccountBankCode }}
                        </span>
                        <span class="text-xs font-bold text-on-surface truncate">{{ selectedAccount.name }}</span>
                        <span class="text-[10px] text-on-surface-variant font-semibold">({{ settingsStore.formatValueRaw(selectedAccount.balance) }})</span>
                      </template>
                      <span v-else class="text-xs font-semibold text-on-surface-variant">Select Account</span>
                    </div>
                    <ChevronDown class="w-4 h-4 text-on-surface-variant transition-transform duration-250 flex-shrink-0" :class="{ 'rotate-180 text-primary': accountDropdownOpen }" />
                  </button>
                </div>

                <!-- Custom Dropdown Popup (Teleported to body) -->
                <Teleport to="body">
                  <transition name="expand">
                    <div
                      v-if="accountDropdownOpen"
                      ref="dropdownMenuRef"
                      :style="dropdownStyle"
                      class="border border-[#464554]/30 rounded-xl bg-[#171721] shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-[#464554]/15"
                    >
                      <div v-for="group in groupedAccounts" :key="group.bank.id" class="p-1.5">
                        <!-- Group Header with Bank Badge and Name -->
                        <div class="flex items-center gap-2 px-2.5 py-1 text-[9px] font-black uppercase text-on-surface-variant tracking-wider bg-[#13131b]/35 rounded-lg select-none">
                          <span
                            class="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-sm"
                            :style="{ backgroundColor: group.bank.color }"
                          >
                            {{ group.bank.code }}
                          </span>
                          <span>{{ group.bank.name }}</span>
                        </div>

                        <!-- Group Accounts list -->
                        <div class="mt-1 space-y-0.5">
                          <div
                            v-for="acc in group.accounts"
                            :key="acc.id"
                            @click="selectAccount(acc.id)"
                            class="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors group/item"
                            :class="[form.accountId === acc.id ? 'bg-primary/5 text-primary' : 'text-on-surface']"
                          >
                            <span class="text-xs font-bold group-hover/item:text-primary transition-colors truncate">{{ acc.name }}</span>
                            <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span class="text-[10px] font-extrabold text-on-surface-variant">{{ settingsStore.formatValueRaw(acc.balance) }}</span>
                              <Check v-if="form.accountId === acc.id" class="w-3.5 h-3.5 text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </Teleport>
              </div>
            </div>

            <!-- Category Selector -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Budget Category</label>
              <div class="relative flex items-center">
                <Folder class="absolute left-3 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <select
                  v-model="form.categoryId"
                  class="bg-[#13131b] border border-[#464554]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none w-full cursor-pointer"
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
            </div>
          </div>

          <!-- Right Column: Amount & Options -->
          <div class="space-y-4">
            <!-- High-Impact Amount Input -->
            <div 
              @click="focusAmountInput"
              class="glass-panel bg-[#0e0e15]/40 hover:bg-[#0e0e15]/50 border border-[#464554]/20 hover:border-[#464554]/30 rounded-xl p-4 flex flex-col items-center gap-1.5 shadow-inner transition-all cursor-text relative"
            >
              <span class="text-[8px] font-black text-on-surface-variant uppercase tracking-wider">Transaction Amount</span>
              <div class="relative flex items-center justify-center w-full max-w-[240px]">
                <span class="text-lg font-black text-on-surface-variant mr-1.5 select-none">Rp</span>
                <input
                  type="text"
                  :value="formAmount"
                  @input="handleFormAmountInput"
                  placeholder="0"
                  class="bg-transparent border-none text-2xl font-black text-center text-primary focus:ring-0 focus:outline-none w-full placeholder-primary/20 tracking-tight"
                  id="transaction-amount-input"
                  required
                />
                <span v-if="settingsStore.kMode" class="text-lg font-black text-on-surface-variant ml-1.5 select-none">K</span>
              </div>

              <!-- Subtext displaying actual conversion -->
              <div class="text-[10px] font-bold text-on-surface-variant/80 border-t border-[#464554]/15 pt-1.5 w-full text-center select-none">
                Total Amount: <span class="font-black" :class="[formType === 'outflow' ? 'text-error' : 'text-secondary']">{{ actualAmountFormatted }}</span>
              </div>

              <!-- Preset Pills -->
              <div class="flex flex-wrap gap-1.5 justify-center mt-2.5">
                <button
                  type="button"
                  @click.stop="addPresetAmount(50)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +50K
                </button>
                <button
                  type="button"
                  @click.stop="addPresetAmount(100)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +100K
                </button>
                <button
                  type="button"
                  @click.stop="addPresetAmount(500)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +500K
                </button>
                <button
                  type="button"
                  @click.stop="addPresetAmount(1000)"
                  class="px-2.5 py-0.5 rounded-full bg-[#1b1b24] hover:bg-primary/15 hover:text-primary border border-[#464554]/40 hover:border-primary/50 text-[9px] font-bold text-on-surface-variant transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  +1M
                </button>
                <button
                  type="button"
                  @click.stop="clearAmount"
                  class="px-2.5 py-0.5 rounded-full bg-error/10 hover:bg-error/20 hover:text-error border border-error/20 hover:border-error/40 text-[9px] font-bold text-error transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Clear
                </button>
              </div>
            </div>

            <!-- Shift to Next Month (Only for Inflow) -->
            <div v-if="formType === 'inflow'" class="flex items-center justify-between bg-surface-container-high rounded-xl p-3 border border-[#464554]/20 animate-fade-in">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-on-surface">Shift to Next Month</span>
                <span class="text-[10px] text-on-surface-variant font-medium">Use this late income for next month's budget pool</span>
              </div>
              <button
                type="button"
                @click="form.shiftToNextMonth = !form.shiftToNextMonth"
                class="w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer"
                :class="[form.shiftToNextMonth ? 'bg-secondary' : 'bg-surface-variant']"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                  :class="[form.shiftToNextMonth ? 'right-1' : 'left-1']"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <button
        @click="close"
        :disabled="isSaving"
        class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        @click="save"
        :disabled="isSaving"
        class="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-on-primary hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSaving ? 'Saving...' : 'Save Transaction' }}
      </button>
    </template>
  </CommonModal>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Calendar, Tag, Folder, CreditCard, ChevronDown, Check } from '@lucide/vue'

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
const settingsStore = useSettingsStore()

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

const isSaving = ref(false)
const accountDropdownOpen = ref(false)
const dropdownContainer = ref(null)
const buttonRef = ref(null)
const dropdownMenuRef = ref(null)
const dropdownStyle = ref({
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '0px',
  zIndex: '3000'
})

const updateDropdownPosition = () => {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      position: 'absolute',
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      zIndex: '3000'
    }
  }
}

watch(accountDropdownOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      updateDropdownPosition()
    })
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
  } else {
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
})

const toggleAccountDropdown = () => {
  accountDropdownOpen.value = !accountDropdownOpen.value
}

const selectAccount = (accId) => {
  form.value.accountId = accId
  accountDropdownOpen.value = false
}

const selectedAccount = computed(() => {
  return store.accounts.find(a => a.id === form.value.accountId)
})

const selectedAccountBankColor = computed(() => {
  if (!selectedAccount.value) return '#908fa0'
  const bank = store.banks.find(b => b.id === selectedAccount.value.bankId)
  return bank ? bank.color : '#908fa0'
})

const selectedAccountBankCode = computed(() => {
  if (!selectedAccount.value) return ''
  const bank = store.banks.find(b => b.id === selectedAccount.value.bankId)
  return bank ? bank.code : ''
})

const groupedAccounts = computed(() => {
  const list = availableAccounts.value
  const groupsMap = {}
  
  list.forEach(acc => {
    const bank = store.banks.find(b => b.id === acc.bankId)
    const bankId = bank ? bank.id : 'unknown'
    if (!groupsMap[bankId]) {
      groupsMap[bankId] = {
        bank: bank || { id: 'unknown', name: 'Other', code: 'OTHER', color: '#6b7280' },
        accounts: []
      }
    }
    groupsMap[bankId].accounts.push(acc)
  })
  
  const sortedGroups = []
  store.banks.forEach(bank => {
    if (groupsMap[bank.id]) {
      sortedGroups.push(groupsMap[bank.id])
    }
  })
  
  if (groupsMap['unknown']) {
    sortedGroups.push(groupsMap['unknown'])
  }
  
  return sortedGroups
})

const handleOutsideClick = (event) => {
  if (accountDropdownOpen.value) {
    const clickedInsideButton = dropdownContainer.value && dropdownContainer.value.contains(event.target)
    const clickedInsideMenu = dropdownMenuRef.value && dropdownMenuRef.value.contains(event.target)
    if (!clickedInsideButton && !clickedInsideMenu) {
      accountDropdownOpen.value = false
    }
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleOutsideClick)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleOutsideClick)
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
})

const handleFormAmountInput = (event) => {
  const inputVal = event.target.value
  const clean = inputVal.replace(/\D/g, '')
  if (!clean) {
    formAmount.value = ''
    return
  }
  const num = parseInt(clean, 10)
  formAmount.value = num.toLocaleString('id-ID')
}

const addPresetAmount = (valueK) => {
  const addValue = settingsStore.kMode ? valueK : valueK * 1000
  const cleanAmount = String(formAmount.value).replace(/\./g, '')
  const currentVal = parseFloat(cleanAmount) || 0
  const newVal = currentVal + addValue
  formAmount.value = newVal.toLocaleString('id-ID')
}

const clearAmount = () => {
  formAmount.value = ''
}

const focusAmountInput = () => {
  document.getElementById('transaction-amount-input')?.focus()
}

const actualAmountFormatted = computed(() => {
  const cleanAmount = String(formAmount.value).replace(/\./g, '')
  const rawAmt = parseFloat(cleanAmount) || 0
  const absoluteAmount = settingsStore.kMode ? rawAmt * 1000 : rawAmt
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(absoluteAmount)
})

// Filter accounts & categories
const availableAccounts = computed(() => {
  const activeAccs = store.accounts.filter(a => a.active !== false)
  if (props.transaction) {
    const txAcc = store.accounts.find(a => a.id === props.transaction.accountId)
    if (txAcc && txAcc.active === false && !activeAccs.some(a => a.id === txAcc.id)) {
      activeAccs.push(txAcc)
    }
  }
  return activeAccs
})

const getBankCode = (bankId) => {
  const bank = store.banks.find(b => b.id === bankId)
  return bank ? bank.code : ''
}

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
  accountDropdownOpen.value = false
  isSaving.value = false
  if (newShow) {
    if (props.transaction) {
      // Edit mode
      form.value = { ...props.transaction }
      formType.value = props.transaction.amount > 0 ? 'inflow' : 'outflow'
      
      const rawAmt = Math.abs(props.transaction.amount)
      const numVal = settingsStore.kMode ? (rawAmt / 1000) : rawAmt
      formAmount.value = numVal.toLocaleString('id-ID')
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

const save = async () => {
  if (isSaving.value) return
  if (!form.value.description.trim() || !formAmount.value) {
    alert('Please enter all required fields.')
    return
  }

  isSaving.value = true
  try {
    const cleanAmount = String(formAmount.value).replace(/\./g, '')
    const amtNum = parseFloat(cleanAmount) || 0
    const absAmt = settingsStore.kMode ? amtNum * 1000 : amtNum
    
    // Expenses are stored as negative, inflows as positive
    form.value.amount = formType.value === 'outflow' ? -absAmt : absAmt

    if (props.transaction) {
      await store.editTransaction(form.value)
    } else {
      await store.addTransaction(form.value)
    }

    close()
  } catch (error) {
    console.error(error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.25s ease-in-out, opacity 0.2s ease-in-out;
  max-height: 280px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
