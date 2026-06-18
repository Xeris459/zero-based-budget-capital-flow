<template>
  <div class="glass-panel rounded-xl p-4 sm:p-5 flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-on-surface">Accounts Summary</h3>
      <span class="text-[10px] font-semibold text-primary hover:underline cursor-pointer" @click="navigateToAccounts">Manage</span>
    </div>
    
    <div class="flex flex-col gap-3">
      <!-- First 2 Accounts (Always Visible) -->
      <div
        v-for="acc in visibleAccounts"
        :key="acc.id"
        class="flex items-center justify-between p-3 rounded-lg bg-surface-variant/30 border border-[#464554]/30"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="[
              acc.type === 'checking' ? 'bg-secondary/15 text-secondary' :
              acc.type === 'savings' ? 'bg-primary/15 text-primary' :
              acc.type === 'credit_card' ? 'bg-error/15 text-error' :
              'bg-on-surface-variant/15 text-on-surface-variant'
            ]"
          >
            <CreditCard v-if="acc.type === 'credit_card'" class="w-4 h-4" />
            <PiggyBank v-else-if="acc.type === 'savings'" class="w-4 h-4" />
            <Landmark v-else class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-on-surface">{{ acc.name }}</span>
            <span class="text-[10px] text-on-surface-variant font-medium">{{ getBankCode(acc.bankId) }}</span>
          </div>
        </div>
        <span
          class="text-xs font-extrabold"
          :class="[acc.balance < 0 ? 'text-error' : 'text-on-surface']"
        >
          {{ settingsStore.formatIndonesianHuman(acc.balance) }}
        </span>
      </div>

      <!-- Collapsible Remaining Accounts (Accordion) -->
      <Transition name="expand">
        <div v-show="isExpanded" class="flex flex-col gap-3">
          <div
            v-for="acc in remainingAccounts"
            :key="acc.id"
            class="flex items-center justify-between p-3 rounded-lg bg-surface-variant/30 border border-[#464554]/30"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="[
                  acc.type === 'checking' ? 'bg-secondary/15 text-secondary' :
                  acc.type === 'savings' ? 'bg-primary/15 text-primary' :
                  acc.type === 'credit_card' ? 'bg-error/15 text-error' :
                  'bg-on-surface-variant/15 text-on-surface-variant'
                ]"
              >
                <CreditCard v-if="acc.type === 'credit_card'" class="w-4 h-4" />
                <PiggyBank v-else-if="acc.type === 'savings'" class="w-4 h-4" />
                <Landmark v-else class="w-4 h-4" />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">{{ acc.name }}</span>
                <span class="text-[10px] text-on-surface-variant font-medium">{{ getBankCode(acc.bankId) }}</span>
              </div>
            </div>
            <span
              class="text-xs font-extrabold"
              :class="[acc.balance < 0 ? 'text-error' : 'text-on-surface']"
            >
              {{ settingsStore.formatIndonesianHuman(acc.balance) }}
            </span>
          </div>
        </div>
      </Transition>

      <!-- Show More / Less Toggle Button -->
      <button
        v-if="store.accounts.length > 2"
        @click="isExpanded = !isExpanded"
        class="flex items-center justify-center gap-1.5 py-2 mt-1 text-[10px] font-bold text-on-surface-variant bg-surface-container/20 border border-[#464554]/20 rounded-lg hover:bg-surface-bright/20 transition-all cursor-pointer"
      >
        <span>{{ isExpanded ? 'Tampilkan Lebih Sedikit' : `Lihat ${remainingAccounts.length} Rekening Lainnya` }}</span>
        <component :is="isExpanded ? ChevronUp : ChevronDown" class="w-3.5 h-3.5 animate-pulse" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { useRouter } from '#imports'
import { Landmark, PiggyBank, CreditCard, ChevronDown, ChevronUp } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const isExpanded = ref(false)

const visibleAccounts = computed(() => {
  return store.accounts.slice(0, 2)
})

const remainingAccounts = computed(() => {
  return store.accounts.slice(2)
})

const navigateToAccounts = () => {
  router.push('/accounts')
}

const getBankCode = (bankId) => {
  return store.banks.find(b => b.id === bankId)?.code || 'BANK'
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
