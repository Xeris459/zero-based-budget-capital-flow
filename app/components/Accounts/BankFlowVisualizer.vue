<template>
  <div class="glass-panel rounded-xl p-card-padding mb-8 flex flex-col border border-[#464554]/20">
    <h3 class="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
      <ArrowLeftRight class="w-4 h-4 text-primary" />
      Bank Flow Visualizer (Money Transfers)
    </h3>

    <div class="relative w-full h-48 bg-[#0b0f15]/40 rounded-xl border border-[#464554]/20">
      <!-- SVG Canvas for Drawing Connections -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <!-- Glow Filters for arrows -->
          <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <!-- Arrow markers -->
          <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
          </marker>
        </defs>

        <!-- Draw flow connections -->
        <g v-for="flow in store.activeFlows" :key="flow.id">
          <!-- Curve connection -->
          <path
            :d="getSvgCurve(flow.fromX, flow.fromY, flow.toX, flow.toY)"
            fill="none"
            stroke="#6366f1"
            stroke-width="2"
            stroke-dasharray="6, 6"
            class="animate-dash"
            marker-end="url(#arrow)"
            filter="url(#glow-indigo)"
          />
          <!-- Flow amount label backdrop (aligned to peak) -->
          <rect
            :x="getMidpointPercent(flow.fromX, flow.toX) + '%'"
            :y="(getMidpointPercent(flow.fromY, flow.toY) - 8) + '%'"
            width="60"
            height="18"
            rx="4"
            fill="#13131b"
            stroke="#464554"
            stroke-width="1"
            transform="translate(-30, -9)"
          />
          <!-- Flow amount text (aligned to peak) -->
          <text
            :x="getMidpointPercent(flow.fromX, flow.toX) + '%'"
            :y="(getMidpointPercent(flow.fromY, flow.toY) - 8) + '%'"
            fill="#e4e1ed"
            font-size="9"
            font-weight="bold"
            text-anchor="middle"
            transform="translate(0, 3)"
          >
            {{ settingsStore.formatValueRaw(flow.amount) }}
          </text>
        </g>
      </svg>

      <!-- Empty State Guide Overlay (Only if no active flows) -->
      <div v-if="store.activeFlows.length === 0" class="absolute top-3 left-1/2 -translate-x-1/2 z-15 pointer-events-none w-[90%] max-w-sm">
        <div class="bg-[#13131b]/95 border border-[#464554]/30 rounded-lg px-3.5 py-1.5 shadow-xl pointer-events-auto text-center">
          <p class="text-[9px] text-on-surface-variant leading-relaxed">
            <span class="text-primary font-extrabold uppercase tracking-wider mr-1.5">Guide:</span> Click a bank to select **source**, click another (or double-click the same bank) to transfer.
          </p>
        </div>
      </div>

      <!-- Visual Bank Nodes (Absolutely Positioned and Always Perfect Circles) -->
      <div class="absolute inset-0 w-full h-full z-20 pointer-events-none">
        <button
          v-for="node in store.bankNodes"
          :key="node.id"
          :id="`node-${node.id}`"
          @click="handleNodeClick(node.id)"
          class="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border bg-[#1f1f27]/90 shadow-xl border-[#464554]/50 absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
          :class="[
            selectedSourceBankId === node.id 
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#0b0f15] border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105' 
              : 'hover:border-primary/80'
          ]"
          :style="{ borderColor: node.color, left: `${node.x}%`, top: `${node.y}%` }"
        >
          <!-- Mini icon or abbreviation -->
          <Landmark class="w-5 h-5 sm:w-6 sm:h-6 mb-1" :style="{ color: node.color }" />
          <span class="text-[10px] sm:text-xs font-extrabold text-on-surface">{{ node.code }}</span>
          <span class="text-[8px] sm:text-[9px] font-bold text-on-surface-variant mt-0.5">{{ settingsStore.formatValueRaw(node.balance) }}</span>
        </button>
      </div>
    </div>

    <!-- Active Selection Banner / Guide Footnote -->
    <div class="mt-2 text-center">
      <p v-if="selectedSourceBankId" class="text-[10px] text-primary font-bold animate-pulse">
        Selected {{ store.banks.find(b => b.id === selectedSourceBankId)?.name }} as source. Click another bank (or double-click this bank) to select destination.
      </p>
      <p v-else class="text-[10px] text-on-surface-variant italic">
        *Shows cash flow directions based on transfers made between your banks this month. Click nodes directly or use "Transfer" above to move money.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { Landmark, ArrowLeftRight } from '@lucide/vue'
import { ref } from 'vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()

const emit = defineEmits(['initiate-transfer'])

const selectedSourceBankId = ref(null)

const handleNodeClick = (bankId) => {
  const bankAccounts = store.accounts.filter(a => a.bankId === bankId)

  if (selectedSourceBankId.value === bankId) {
    // Clicked the same bank node twice
    if (bankAccounts.length >= 2) {
      const sourceBankId = bankId
      const destBankId = bankId
      selectedSourceBankId.value = null
      emit('initiate-transfer', { sourceBankId, destBankId })
    } else {
      // Deselect if only 1 account
      selectedSourceBankId.value = null
    }
  } else if (!selectedSourceBankId.value) {
    // Select source bank
    selectedSourceBankId.value = bankId
  } else {
    // We have both source and destination bank
    const sourceBankId = selectedSourceBankId.value
    const destBankId = bankId
    selectedSourceBankId.value = null
    emit('initiate-transfer', { sourceBankId, destBankId })
  }
}

const getMidpointPercent = (fromVal, toVal) => {
  const f = parseFloat(fromVal)
  const t = parseFloat(toVal)
  return (f + t) / 2
}

const getSvgCurve = (fromX, fromY, toX, toY) => {
  const fx = parseFloat(fromX)
  const fy = parseFloat(fromY)
  const tx = parseFloat(toX)
  const ty = parseFloat(toY)

  const midX = (fx + tx) / 2
  const midY = ((fy + ty) / 2) - 15

  return `M ${fx}% ${fy}% Q ${midX}% ${midY}% ${tx}% ${ty}%`
}
</script>

<style scoped>
@keyframes dash {
  to {
    stroke-dashoffset: -40;
  }
}
.animate-dash {
  animation: dash 3s linear infinite;
}
</style>
