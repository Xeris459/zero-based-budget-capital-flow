<template>
  <div>
    <!-- Title Section -->
    <div class="mb-6">
      <h2 class="text-xl font-extrabold text-on-surface tracking-tight">System Settings</h2>
      <p class="text-xs text-on-surface-variant mt-1 font-semibold uppercase tracking-wider">Configure System Preferences & Data Backups</p>
    </div>

    <!-- Settings layout with tabs -->
    <div class="flex flex-col gap-6">
      <!-- Tab Header Ribbon -->
      <div class="flex gap-2 border-b border-[#464554]/30 pb-0.5 overflow-x-auto scrollbar-none">
        <button
          @click="activeTab = 'preferences'"
          class="px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap"
          :class="[
            activeTab === 'preferences'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          ]"
        >
          <Settings class="w-4 h-4" />
          General Preferences
        </button>
        <button
          @click="activeTab = 'banks_categories'"
          class="px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap"
          :class="[
            activeTab === 'banks_categories'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          ]"
        >
          <Database class="w-4 h-4" />
          Banks & Categories
        </button>
        <button
          @click="activeTab = 'security'"
          class="px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap"
          :class="[
            activeTab === 'security'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          ]"
        >
          <Fingerprint class="w-4 h-4" />
          Security Access
        </button>
        <button
          @click="activeTab = 'backup'"
          class="px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap"
          :class="[
            activeTab === 'backup'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          ]"
        >
          <ShieldAlert class="w-4 h-4" />
          Backup & Recovery
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="min-h-[400px]">
        <!-- 1. Preferences Tab -->
        <div v-if="activeTab === 'preferences'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <!-- Left Panel: Formatting & Toggles -->
          <div class="glass-panel rounded-xl p-6 border border-[#464554]/30 flex flex-col gap-5">
            <h3 class="text-sm font-bold text-on-surface mb-2">Display & Currency</h3>
            
            <!-- Currency Prefix -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold text-on-surface-variant uppercase">Currency Symbol</label>
              <input
                type="text"
                v-model="settingsStore.currencySymbol"
                @change="store.saveState"
                placeholder="Rp"
                class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-24"
              />
              <span class="text-[10px] text-on-surface-variant mt-1">Applies globally across all card amounts and charts.</span>
            </div>

            <!-- Redenomination Toggle -->
            <div class="flex items-center justify-between border-t border-[#464554]/10 pt-4">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-on-surface">Redenomination Mode (K)</span>
                <span class="text-[10px] text-on-surface-variant font-semibold">Abbreviate figures by dividing them by 1.000 (e.g. Rp 5.000K)</span>
              </div>
              <button
                @click="settingsStore.toggleKMode()"
                class="w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                :class="[settingsStore.kMode ? 'bg-primary' : 'bg-surface-variant']"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                  :class="[settingsStore.kMode ? 'right-1' : 'left-1']"
                ></span>
              </button>
            </div>

            <!-- Text Glow Effect -->
            <div class="flex items-center justify-between border-t border-[#464554]/10 pt-4">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-on-surface">Glow Text Accents</span>
                <span class="text-[10px] text-on-surface-variant font-semibold">Apply premium text shadow/neon glowing styling to card totals</span>
              </div>
              <button
                @click="settingsStore.glowEffects = !settingsStore.glowEffects; store.saveState()"
                class="w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                :class="[settingsStore.glowEffects ? 'bg-primary' : 'bg-surface-variant']"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                  :class="[settingsStore.glowEffects ? 'right-1' : 'left-1']"
                ></span>
              </button>
            </div>
          </div>

          <!-- Right Panel: Alerts & Warnings -->
          <div class="glass-panel rounded-xl p-6 border border-[#464554]/30 flex flex-col gap-5">
            <h3 class="text-sm font-bold text-on-surface mb-2">Alerts & Warnings</h3>

            <!-- Warning Threshold -->
            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between items-center mb-1">
                <label class="text-[10px] font-bold text-on-surface-variant uppercase">Category Warning Threshold (%)</label>
                <span class="text-xs font-extrabold text-primary">{{ Math.round(settingsStore.warningThreshold * 100) }}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                v-model.number="settingsStore.warningThreshold"
                @change="store.saveState"
                class="w-full accent-primary bg-surface-variant h-1 rounded-lg cursor-pointer"
              />
              <span class="text-[10px] text-on-surface-variant mt-2 leading-relaxed">
                Set the percentage limit when subcategories trigger a <strong>"Near Limit"</strong> warning flag. (Standard value is 80%).
              </span>
            </div>

            <!-- Cash Flow Notification Settings -->
            <div class="border-t border-[#464554]/10 pt-4 flex flex-col gap-4">
              <!-- CC Debt Alert Limit -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-bold text-on-surface-variant uppercase">Max Credit Card Debt Limit</label>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-on-surface-variant">{{ settingsStore.currencySymbol }}</span>
                  <input
                    type="number"
                    v-model.number="settingsStore.maxDebtLimit"
                    @change="store.saveState"
                    placeholder="5.000.000"
                    class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                  />
                </div>
                <span class="text-[10px] text-on-surface-variant">Trigger a warning when credit card debt exceeds this amount.</span>
              </div>

              <!-- Savings Rate Limit -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-bold text-on-surface-variant uppercase">Min Savings Rate Target (%)</label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    v-model.number="settingsStore.minSavingsRate"
                    @change="store.saveState"
                    placeholder="10"
                    min="0"
                    max="100"
                    class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-24"
                  />
                  <span class="text-xs font-bold text-on-surface-variant">%</span>
                </div>
                <span class="text-[10px] text-on-surface-variant">Trigger an alarm when actual savings rate is below this target.</span>
              </div>

              <!-- Low Wallet Cash Limit -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-bold text-on-surface-variant uppercase">Low Wallet Cash Threshold</label>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-on-surface-variant">{{ settingsStore.currencySymbol }}</span>
                  <input
                    type="number"
                    v-model.number="settingsStore.lowCashThreshold"
                    @change="store.saveState"
                    placeholder="100.000"
                    class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                  />
                </div>
                <span class="text-[10px] text-on-surface-variant">Trigger a warning when cash wallet falls below this amount.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Banks & Categories Tab -->
        <div v-if="activeTab === 'banks_categories'" class="flex flex-col gap-6 animate-fade-in">
          <!-- Banks section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Banks list -->
            <div class="glass-panel rounded-xl p-5 border border-[#464554]/20">
              <h4 class="text-xs font-bold text-on-surface-variant uppercase mb-4">Active Banks</h4>
              <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div
                  v-for="b in store.banks"
                  :key="b.id"
                  class="flex items-center justify-between p-3 bg-surface-container-high/40 border border-[#464554]/10 rounded-lg hover:bg-surface-bright/5 transition-all"
                >
                  <div class="flex items-center gap-3">
                    <span class="w-4 h-4 rounded-full border border-[#464554]/30 flex-shrink-0" :style="{ backgroundColor: b.color }"></span>
                    <span class="text-xs font-bold text-on-surface">{{ b.name }}</span>
                    <span class="px-2 py-0.5 text-[9px] font-extrabold bg-[#13131b] border border-[#464554]/40 rounded-full text-on-surface-variant">{{ b.code }}</span>
                  </div>
                  <!-- Delete custom banks only -->
                  <button
                    @click="deleteBank(b.id)"
                    class="text-on-surface-variant hover:text-error transition-colors p-1"
                    title="Delete Bank Provider"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Add custom bank form -->
            <div class="glass-panel rounded-xl p-5 border border-[#464554]/20">
              <h4 class="text-xs font-bold text-on-surface-variant uppercase mb-4">Add Custom Bank</h4>
              <form @submit.prevent="addCustomBank" class="space-y-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-bold text-on-surface-variant uppercase">Bank Provider Name</label>
                  <input
                    type="text"
                    v-model="newBankName"
                    placeholder="e.g. Gopay Wallet"
                    class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                    required
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-on-surface-variant uppercase">Short Code</label>
                    <input
                      type="text"
                      v-model="newBankCode"
                      placeholder="e.g. GOPAY"
                      class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full uppercase"
                      required
                    />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-on-surface-variant uppercase">Color Tag</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="color"
                        v-model="newBankColor"
                        class="bg-transparent border border-[#464554]/40 rounded cursor-pointer w-8 h-8 p-0"
                      />
                      <input
                        type="text"
                        v-model="newBankColor"
                        class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-1.5 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  class="w-full py-2 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Plus class="w-4 h-4" />
                  Add Bank Provider
                </button>
              </form>
            </div>
          </div>

          <!-- Categories Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-[#464554]/20 pt-6">
            <!-- Categories list -->
            <div class="glass-panel rounded-xl p-5 border border-[#464554]/20 flex flex-col">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-xs font-bold text-on-surface-variant uppercase">Active Subcategories</h4>
                <select
                  v-model="selectedParentId"
                  class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none appearance-none"
                >
                  <option value="income">Income Sources</option>
                  <option value="expenses">Expenses</option>
                  <option value="savings">Savings Goals</option>
                  <option value="debt">Debt Payoffs</option>
                </select>
              </div>

              <div class="space-y-2 max-h-64 overflow-y-auto pr-1 flex-1">
                <div
                  v-for="c in categoriesList"
                  :key="c.id"
                  class="flex items-center justify-between p-3 bg-surface-container-high/40 border border-[#464554]/10 rounded-lg hover:bg-surface-bright/5 transition-all"
                >
                  <span class="text-xs font-bold text-on-surface">{{ c.name }}</span>
                  <button
                    @click="deleteCategory(c.id)"
                    class="text-on-surface-variant hover:text-error transition-colors p-1"
                    title="Delete Category"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Add category form -->
            <div class="glass-panel rounded-xl p-5 border border-[#464554]/20">
              <h4 class="text-xs font-bold text-on-surface-variant uppercase mb-4">Add Subcategory</h4>
              <form @submit.prevent="addCategory" class="space-y-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-bold text-on-surface-variant uppercase">Subcategory Name</label>
                  <input
                    type="text"
                    v-model="newCategoryName"
                    placeholder="e.g. WiFi Bills, Gym Membership"
                    class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                    required
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-bold text-on-surface-variant uppercase">Parent Group</label>
                  <select
                    v-model="selectedParentId"
                    class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                  >
                    <option value="income">Income Sources</option>
                    <option value="expenses">Expenses</option>
                    <option value="savings">Savings Goals</option>
                    <option value="debt">Debt Payoffs</option>
                  </select>
                </div>
                <button
                  type="submit"
                  class="w-full py-2 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Plus class="w-4 h-4" />
                  Add Subcategory
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- 3. Security tab -->
        <div v-if="activeTab === 'security'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <!-- Left Column: Universal fallback methods -->
          <div class="glass-panel rounded-xl p-6 border border-[#464554]/30 flex flex-col gap-5">
            <div>
              <h3 class="text-sm font-bold text-on-surface">Universal Security Methods</h3>
              <p class="text-[10px] text-on-surface-variant mt-0.5">Configure fallback verification credentials</p>
            </div>

            <!-- Validation Error Alert Banner -->
            <div v-if="securityWarningMsg" class="p-3 bg-warning/15 border border-warning/30 text-warning text-[10.5px] font-bold rounded-lg leading-relaxed flex items-start gap-2">
              <ShieldAlert class="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{{ securityWarningMsg }}</span>
            </div>

            <!-- Password Configuration -->
            <div class="flex items-center justify-between p-3.5 bg-surface-container-high/20 border border-[#464554]/10 rounded-lg">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-on-surface">Password Lock</span>
                <span class="text-[10px] text-on-surface-variant font-semibold" v-if="securityStore.security.passwordEnabled">Password is active</span>
                <span class="text-[10px] text-on-surface-variant font-semibold" v-else>Not configured</span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  v-if="securityStore.security.passwordEnabled"
                  @click="openConfigurePassword"
                  class="px-2 py-1 rounded bg-[#13131b] hover:bg-surface-bright/20 border border-[#464554]/40 text-[10px] font-bold text-primary transition-colors"
                >
                  Configure
                </button>
                <button
                  @click="handlePasswordToggle"
                  class="w-11 h-6 rounded-full relative transition-colors focus:outline-none"
                  :class="[securityStore.security.passwordEnabled ? 'bg-primary' : 'bg-surface-variant']"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                    :class="[securityStore.security.passwordEnabled ? 'right-1' : 'left-1']"
                  ></span>
                </button>
              </div>
            </div>

            <!-- PIN Configuration -->
            <div class="flex items-center justify-between p-3.5 bg-surface-container-high/20 border border-[#464554]/10 rounded-lg">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-on-surface">4-Digit PIN Lock</span>
                <span class="text-[10px] text-on-surface-variant font-semibold" v-if="securityStore.security.pinEnabled">PIN is active (****)</span>
                <span class="text-[10px] text-on-surface-variant font-semibold" v-else>Not configured</span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  v-if="securityStore.security.pinEnabled"
                  @click="openConfigurePin"
                  class="px-2 py-1 rounded bg-[#13131b] hover:bg-surface-bright/20 border border-[#464554]/40 text-[10px] font-bold text-primary transition-colors"
                >
                  Configure
                </button>
                <button
                  @click="handlePinToggle"
                  class="w-11 h-6 rounded-full relative transition-colors focus:outline-none"
                  :class="[securityStore.security.pinEnabled ? 'bg-primary' : 'bg-surface-variant']"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                    :class="[securityStore.security.pinEnabled ? 'right-1' : 'left-1']"
                  ></span>
                </button>
              </div>
            </div>

            <!-- Pattern configuration -->
            <div class="flex items-center justify-between p-3.5 bg-surface-container-high/20 border border-[#464554]/10 rounded-lg">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-on-surface">Pattern Grid Lock</span>
                <span class="text-[10px] text-on-surface-variant font-semibold" v-if="securityStore.security.patternEnabled">Pattern is active ({{ securityStore.security.patternVal }})</span>
                <span class="text-[10px] text-on-surface-variant font-semibold" v-else>Not configured</span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  v-if="securityStore.security.patternEnabled"
                  @click="openConfigurePattern"
                  class="px-2 py-1 rounded bg-[#13131b] hover:bg-surface-bright/20 border border-[#464554]/40 text-[10px] font-bold text-primary transition-colors"
                >
                  Configure
                </button>
                <button
                  @click="handlePatternToggle"
                  class="w-11 h-6 rounded-full relative transition-colors focus:outline-none"
                  :class="[securityStore.security.patternEnabled ? 'bg-primary' : 'bg-surface-variant']"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                    :class="[securityStore.security.patternEnabled ? 'right-1' : 'left-1']"
                  ></span>
                </button>
              </div>
            </div>

            <!-- Lock Application Button (if security is active) -->
            <div v-if="hasUniversalEnabled" class="border-t border-[#464554]/15 pt-4 mt-2">
              <button
                @click="lockAppNow"
                class="w-full py-2.5 rounded-lg bg-warning/10 hover:bg-warning hover:text-on-primary text-xs font-bold text-warning border border-warning/30 transition-all flex items-center justify-center gap-2"
              >
                <Lock class="w-4 h-4" />
                Lock Application Now (Kunci Aplikasi)
              </button>
            </div>
          </div>

          <!-- Right Column: Biometric settings (with "warna mati" disabled features) -->
          <div class="glass-panel rounded-xl p-6 border border-[#464554]/30 flex flex-col justify-between gap-6">
            <div class="flex flex-col gap-5">
              <div>
                <h3 class="text-sm font-bold text-on-surface">Biometric Security</h3>
                <p class="text-[10px] text-on-surface-variant mt-0.5">Utilize hardware verifications to unlock system</p>
              </div>

              <!-- Fingerprint (Sidik Jari) Configuration -->
              <div
                class="flex items-center justify-between p-3.5 border rounded-lg transition-all"
                :class="[
                  isFingerprintSupported 
                    ? 'bg-surface-container-high/20 border-[#464554]/10' 
                    : 'opacity-40 pointer-events-none select-none grayscale bg-surface-container/20 border-[#464554]/5'
                ]"
              >
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-on-surface">Fingerprint Scan (Sidik Jari)</span>
                    <span v-if="!isFingerprintSupported" class="px-1.5 py-0.5 text-[8px] font-extrabold bg-error/10 border border-error/20 rounded-full text-error">Tidak Didukung</span>
                  </div>
                  <span class="text-[10px] text-on-surface-variant font-semibold">Verify identity using your device's fingerprint scanner</span>
                </div>
                <button
                  @click="toggleBiometric('fingerprint')"
                  :disabled="!isFingerprintSupported"
                  class="w-11 h-6 rounded-full relative transition-colors focus:outline-none"
                  :class="[
                    securityStore.security.fingerprintEnabled ? 'bg-primary' : 'bg-surface-variant',
                    !isFingerprintSupported ? 'opacity-50 cursor-not-allowed' : ''
                  ]"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                    :class="[securityStore.security.fingerprintEnabled ? 'right-1' : 'left-1']"
                  ></span>
                </button>
              </div>

              <!-- Face Recognition Configuration -->
              <div
                class="flex items-center justify-between p-3.5 border rounded-lg transition-all"
                :class="[
                  isFaceSupported 
                    ? 'bg-surface-container-high/20 border-[#464554]/10' 
                    : 'opacity-40 pointer-events-none select-none grayscale bg-surface-container/20 border-[#464554]/5'
                ]"
              >
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-on-surface">Face Recognition</span>
                    <span v-if="!isFaceSupported" class="px-1.5 py-0.5 text-[8px] font-extrabold bg-error/10 border border-error/20 rounded-full text-error">Tidak Didukung</span>
                  </div>
                  <span class="text-[10px] text-on-surface-variant font-semibold">Verify identity using device front-facing camera scan</span>
                </div>
                <button
                  @click="toggleBiometric('face')"
                  :disabled="!isFaceSupported"
                  class="w-11 h-6 rounded-full relative transition-colors focus:outline-none"
                  :class="[
                    securityStore.security.faceEnabled ? 'bg-primary' : 'bg-surface-variant',
                    !isFaceSupported ? 'opacity-50 cursor-not-allowed' : ''
                  ]"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-background rounded-full transition-all duration-200"
                    :class="[securityStore.security.faceEnabled ? 'right-1' : 'left-1']"
                  ></span>
                </button>
              </div>
            </div>

            <!-- Simulation switch at the bottom for dev testing -->
            <div class="p-3 bg-[#13131b]/60 border border-[#464554]/25 rounded-lg flex items-center justify-between">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-bold text-on-surface">Simulate Biometric Hardware Support</span>
                <span class="text-[9px] text-on-surface-variant">Toggle this to simulate device biometric support capability locally.</span>
              </div>
              <button
                @click="toggleDevMock"
                class="w-8 h-4 rounded-full relative transition-colors focus:outline-none"
                :class="[devMockBiometric ? 'bg-primary' : 'bg-surface-variant']"
              >
                <span
                  class="absolute top-0.5 w-3 h-3 bg-background rounded-full transition-all duration-200"
                  :class="[devMockBiometric ? 'right-0.5' : 'left-0.5']"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Backup & Recovery Tab -->
        <div v-if="activeTab === 'backup'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <!-- Backup recovery actions panel -->
          <div class="glass-panel rounded-xl p-6 border border-[#464554]/30 flex flex-col gap-6">
            <h3 class="text-sm font-bold text-on-surface flex items-center gap-2 mb-2">
              <Database class="w-5 h-5 text-primary" />
              Backup Manager
            </h3>

            <!-- Export Backup -->
            <div class="flex items-center justify-between bg-surface-container-high/40 p-4 border border-[#464554]/15 rounded-xl">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-on-surface">Export Data Backup</span>
                <span class="text-[10px] text-on-surface-variant font-medium">Download entire system state as a JSON backup file.</span>
              </div>
              <button
                @click="exportBackup"
                :disabled="isExporting"
                class="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-on-primary transition-all flex items-center gap-2 shadow-lg disabled:opacity-55 disabled:cursor-not-allowed"
              >
                <RefreshCw v-if="isExporting" class="w-4 h-4 animate-spin" />
                <Download v-else class="w-4 h-4" />
                {{ isExporting ? 'Exporting...' : 'Export JSON' }}
              </button>
            </div>

            <!-- Import Backup -->
            <div class="flex flex-col gap-3 bg-surface-container-high/40 p-4 border border-[#464554]/15 rounded-xl">
              <div class="flex justify-between items-center">
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs font-bold text-on-surface">Import Data Backup</span>
                  <span class="text-[10px] text-on-surface-variant font-medium">Upload previously exported JSON backup file to overwrite current database.</span>
                </div>
                <button
                  @click="triggerFileInput"
                  :disabled="isImporting"
                  class="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface border border-[#464554]/40 transition-all flex items-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  <RefreshCw v-if="isImporting" class="w-4 h-4 animate-spin" />
                  <Upload v-else class="w-4 h-4" />
                  {{ isImporting ? 'Importing...' : 'Select File' }}
                </button>
                <input
                  type="file"
                  ref="fileInput"
                  accept=".json"
                  class="hidden"
                  @change="handleFileImport"
                />
              </div>

              <!-- Success & Error Banners -->
              <div v-if="importSuccess" class="p-2.5 rounded bg-secondary/15 border border-secondary/35 text-[10px] font-bold text-secondary text-center">
                Backup successfully imported and applied!
              </div>
              <div v-if="importError" class="p-2.5 rounded bg-error/15 border border-error/35 text-[10px] font-bold text-error text-center">
                {{ importError }}
              </div>
            </div>
          </div>

          <!-- Danger Zone Panel -->
          <div class="glass-panel rounded-xl p-6 border border-error/20 flex flex-col justify-between">
            <div class="flex flex-col gap-4">
              <h3 class="text-sm font-bold text-error flex items-center gap-2 mb-2">
                <ShieldAlert class="w-5 h-5 text-error" />
                Danger Zone
              </h3>
              <p class="text-xs text-on-surface-variant leading-relaxed">
                Resetting the database will wipe your transaction ledger, allocations, customized subcategories, and bank accounts. The database will reload with Capital Flow default starting seed values.
              </p>
              <p class="text-[10px] font-bold text-error uppercase mt-1 leading-snug">
                Warning: This action is instantaneous and cannot be undone!
              </p>
            </div>

            <button
              @click="resetDatabase"
              :disabled="isResetting"
              class="w-full py-3 rounded-lg bg-error/10 hover:bg-error text-xs font-extrabold text-error hover:text-on-primary border border-error/30 transition-all flex items-center justify-center gap-2 mt-8 shadow-sm disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isResetting }" />
              {{ isResetting ? 'Resetting Database...' : 'Reset System Database' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================================================== -->
    <!-- MODALS SECTION FOR ACCESS CREDENTIALS -->
    <!-- ==================================================== -->

    <!-- Password Modal -->
    <CommonModal :show="showPasswordModal" @close="showPasswordModal = false">
      <template #header>Set Password Lock</template>
      <template #body>
        <form class="space-y-4 pt-2" @submit.prevent="savePasswordModal">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">New Password</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="tempPassword"
                placeholder="Enter password"
                class="bg-[#13131b] border border-[#464554]/40 rounded-lg pl-3 pr-9 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
                required
                v-focus
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase">Confirm Password</label>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="tempConfirmPassword"
              placeholder="Confirm password"
              class="bg-[#13131b] border border-[#464554]/40 rounded-lg px-3 py-2 text-xs font-bold text-on-surface focus:border-primary focus:ring-0 focus:outline-none w-full"
              required
            />
          </div>
        </form>
      </template>
      <template #footer>
        <button
          @click="showPasswordModal = false"
          class="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
        >
          Cancel
        </button>
        <button
          @click="savePasswordModal"
          class="px-4 py-2 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
        >
          Save Password
        </button>
      </template>
    </CommonModal>

    <!-- PIN Modal -->
    <CommonModal :show="showPinModal" @close="showPinModal = false">
      <template #header>Set 4-Digit PIN</template>
      <template #body>
        <form class="space-y-4 pt-2" @submit.prevent="savePinModal">
          <div class="flex flex-col gap-1.5 items-center">
            <label class="text-xs font-bold text-on-surface-variant uppercase mb-4 text-center">Enter 4-Digit Numeric PIN</label>
            <div class="flex gap-2 sm:gap-3 justify-center items-center">
              <input
                v-for="(digit, idx) in pinDigits"
                :key="idx"
                ref="pinInputs"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="1"
                v-model="pinDigits[idx]"
                @input="onPinInput(idx, $event)"
                @keydown="onPinKeyDown(idx, $event)"
                @paste="onPinPaste($event)"
                class="w-10 h-10 sm:w-12 sm:h-12 bg-[#13131b] border-2 border-[#464554]/40 rounded-xl text-center text-lg sm:text-xl font-extrabold text-on-surface focus:border-primary focus:outline-none transition-all"
                :class="{ 'border-primary shadow-[0_0_8px_rgba(99,102,241,0.2)]': pinDigits[idx] }"
              />
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button
          @click="showPinModal = false"
          class="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
        >
          Cancel
        </button>
        <button
          @click="savePinModal"
          class="px-4 py-2 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
        >
          Save PIN
        </button>
      </template>
    </CommonModal>

    <!-- Pattern Modal -->
    <CommonModal :show="showPatternModal" @close="showPatternModal = false">
      <template #header>Draw Pattern Lock</template>
      <template #body>
        <div class="flex flex-col items-center gap-4 pt-2">
          <span class="text-xs text-on-surface-variant font-medium text-center max-w-[280px]">
            Click the dots in sequence to draw your custom security path pattern:
          </span>
          
          <!-- SVG interactive dots -->
          <svg class="w-44 h-44 bg-[#13131b]/60 border border-[#464554]/30 rounded-xl p-3 select-none mx-auto" viewBox="0 0 120 120">
            <!-- Lines connecting path -->
            <line
              v-for="(dot, idx) in tempPattern"
              v-if="idx > 0"
              :key="`line-${idx}`"
              :x1="getDotCoords(tempPattern[idx - 1]).x"
              :y1="getDotCoords(tempPattern[idx - 1]).y"
              :x2="getDotCoords(dot).x"
              :y2="getDotCoords(dot).y"
              stroke="#6366f1"
              stroke-width="3.5"
              stroke-linecap="round"
            />
            <!-- Circles grid -->
            <circle
              v-for="i in 9"
              :key="`dot-${i}`"
              :cx="getDotCoords(i).x"
              :cy="getDotCoords(i).y"
              r="8"
              :fill="tempPattern.includes(i) ? '#6366f1' : '#2d2d38'"
              :stroke="tempPattern.includes(i) ? '#8083ff' : '#464554'"
              stroke-width="1.5"
              class="cursor-pointer transition-colors"
              @click="handleTempDotClick(i)"
            />
            <!-- Dot labels -->
            <text
              v-for="i in 9"
              :key="`text-${i}`"
              :x="getDotCoords(i).x"
              :y="getDotCoords(i).y + 2"
              font-size="6"
              font-weight="bold"
              fill="#ffffff"
              text-anchor="middle"
              class="pointer-events-none select-none text-[6px] font-sans"
            >
              {{ i }}
            </text>
          </svg>

          <div v-if="tempPattern.length > 0" class="text-[10px] text-secondary font-bold text-center mt-1">
            Current Path: {{ tempPattern.join(' → ') }}
          </div>
          <div v-else class="text-[10px] text-on-surface-variant/40 font-bold text-center mt-1 italic">
            No path drawn yet
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <button
            @click="resetTempPattern"
            class="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
          >
            Clear Grid
          </button>
          <div class="flex gap-2">
            <button
              @click="showPatternModal = false"
              class="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-bold text-on-surface transition-all border border-[#464554]/40"
            >
              Cancel
            </button>
            <button
              @click="savePatternModal"
              class="px-4 py-2.5 rounded-lg bg-primary text-xs font-bold text-on-primary hover:bg-primary/95 transition-all"
              :disabled="tempPattern.length < 2"
              :class="{ 'opacity-50 cursor-not-allowed': tempPattern.length < 2 }"
            >
              Save Pattern
            </button>
          </div>
        </div>
      </template>
    </CommonModal>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md max-w-sm w-full"
        :class="{
          'bg-[#1a2a1a]/90 border-[#4edea3]/30 text-[#4edea3]': toast.type === 'success',
          'bg-[#2a1a1a]/90 border-[#ff4444]/30 text-[#ff8080]': toast.type === 'error',
          'bg-[#2a2a1a]/90 border-[#ffb95f]/30 text-[#ffb95f]': toast.type === 'warning',
        }"
      >
        <!-- Icon -->
        <div class="mt-0.5 shrink-0">
          <svg v-if="toast.type === 'success'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
          </svg>
        </div>
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold tracking-wide">{{ toast.title }}</p>
          <p class="text-[11px] mt-0.5 opacity-80 break-all leading-relaxed">{{ toast.message }}</p>
        </div>
        <!-- Close -->
        <button @click="toast.show = false" class="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useBudgetStore } from '~/stores/budget'
import { useSettingsStore } from '~/stores/settings'
import { useSecurityStore } from '~/stores/security'
import { ref, computed, onMounted } from 'vue'
import { Settings, ShieldAlert, Database, Plus, Trash2, Download, Upload, RefreshCw, Fingerprint, Eye, EyeOff, Lock } from '@lucide/vue'

const store = useBudgetStore()
const settingsStore = useSettingsStore()
const securityStore = useSecurityStore()
const activeTab = ref('preferences')

// ----------------------------------------------------
// Toast notification system
// ----------------------------------------------------
const toast = ref({ show: false, type: 'success', title: '', message: '' })
let toastTimer = null

const showToast = (type, title, message, duration = 4000) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, type, title, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, duration)
}

async function safeInvoke(cmd, args) {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      return await invoke(cmd, args)
    } catch (e) {
      console.error(`Tauri invoke error for ${cmd}:`, e)
      throw e
    }
  }
  return null
}

// ----------------------------------------------------
// 1. Tab General Preferences
// ----------------------------------------------------
// (Direct bindings, no local variables required)

// ----------------------------------------------------
// 2. Tab Banks & Categories
// ----------------------------------------------------
const newBankName = ref('')
const newBankCode = ref('')
const newBankColor = ref('#8083ff')

const addCustomBank = () => {
  if (!newBankName.value.trim() || !newBankCode.value.trim()) {
    alert('Please enter bank name and code.')
    return
  }
  store.addBank(newBankName.value.trim(), newBankCode.value.trim().toUpperCase(), newBankColor.value)
  newBankName.value = ''
  newBankCode.value = ''
  newBankColor.value = '#8083ff'
}

const deleteBank = (id) => {
  const success = store.deleteBank(id)
  if (!success) {
    alert('Cannot delete this bank provider because it has linked accounts.')
  }
}

const selectedParentId = ref('expenses')
const newCategoryName = ref('')

const categoriesList = computed(() => {
  return store.categories.filter(c => c.parentId === selectedParentId.value)
})

const addCategory = () => {
  if (!newCategoryName.value.trim()) return
  store.addCategory(newCategoryName.value.trim(), selectedParentId.value)
  newCategoryName.value = ''
}

const deleteCategory = (id) => {
  if (confirm('Are you sure you want to delete this subcategory? All planned allocations will be removed.')) {
    store.deleteCategory(id)
  }
}

// ----------------------------------------------------
// 3. Tab Security Access
// ----------------------------------------------------
const showPassword = ref(false)

// Modals Visibility
const showPasswordModal = ref(false)
const showPinModal = ref(false)
const showPatternModal = ref(false)

// Temp inputs inside modals
const tempPassword = ref('')
const tempConfirmPassword = ref('')
const tempPin = ref('')
const tempPattern = ref([])
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])

// Hardware biometrics detection states
const devMockBiometric = ref(true) // Default to true for testing and demos
const hardwareBiometricAvailable = ref(false)

onMounted(async () => {
  if (typeof window !== 'undefined' && window.PublicKeyCredential) {
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      hardwareBiometricAvailable.value = available
    } catch (e) {
      hardwareBiometricAvailable.value = false
    }
  }
})

const isFingerprintSupported = computed(() => hardwareBiometricAvailable.value || devMockBiometric.value)
const isFaceSupported = computed(() => hardwareBiometricAvailable.value || devMockBiometric.value)

const toggleDevMock = () => {
  devMockBiometric.value = !devMockBiometric.value
  if (!devMockBiometric.value && !hardwareBiometricAvailable.value) {
    securityStore.security.fingerprintEnabled = false
    securityStore.security.faceEnabled = false
    store.saveState()
  }
}

// Validation logic
const hasBiometricsEnabled = computed(() => {
  return securityStore.security.fingerprintEnabled || securityStore.security.faceEnabled
})

const hasUniversalEnabled = computed(() => {
  return (securityStore.security.passwordEnabled && securityStore.security.passwordVal && securityStore.security.passwordVal.trim() !== '') ||
         (securityStore.security.pinEnabled && securityStore.security.pinVal && securityStore.security.pinVal.trim() !== '') ||
         (securityStore.security.patternEnabled && securityStore.security.patternVal && securityStore.security.patternVal.trim() !== '')
})

const securityWarningMsg = computed(() => {
  if (hasBiometricsEnabled.value && !hasUniversalEnabled.value) {
    return 'Metode Universal Diperlukan: Anda wajib mengaktifkan minimal 1 Metode Keamanan Universal (Password, PIN, atau Pola) sebagai cadangan/backup saat biometrik aktif.'
  }
  return ''
})

// Toggle password handlers
const handlePasswordToggle = () => {
  const enabled = securityStore.security.passwordEnabled
  if (enabled) {
    // Turning off validation rule check
    const activeUniversalCount = ((securityStore.security.passwordEnabled && securityStore.security.passwordVal && securityStore.security.passwordVal.trim() !== '') ? 1 : 0) + 
                                 ((securityStore.security.pinEnabled && securityStore.security.pinVal && securityStore.security.pinVal.trim() !== '') ? 1 : 0) + 
                                 ((securityStore.security.patternEnabled && securityStore.security.patternVal && securityStore.security.patternVal.trim() !== '') ? 1 : 0)
    if (activeUniversalCount === 1 && hasBiometricsEnabled.value) {
      alert('Gagal menonaktifkan. Anda tidak boleh mematikan metode keamanan universal terakhir jika metode biometrik Anda masih aktif.')
      return
    }
    securityStore.security.passwordEnabled = false
    store.saveState()
  } else {
    // Open modal to configure new password
    tempPassword.value = ''
    tempConfirmPassword.value = ''
    showPasswordModal.value = true
  }
}

const openConfigurePassword = () => {
  tempPassword.value = securityStore.security.passwordVal
  tempConfirmPassword.value = securityStore.security.passwordVal
  showPasswordModal.value = true
}

const savePasswordModal = async () => {
  if (!tempPassword.value.trim()) {
    alert('Password tidak boleh kosong.')
    return
  }
  if (tempPassword.value !== tempConfirmPassword.value) {
    alert('Konfirmasi password tidak cocok.')
    return
  }
  
  if (settingsStore.isTauri) {
    try {
      const hash = await safeInvoke('hash_credential', { plain: tempPassword.value.trim() })
      securityStore.security.passwordVal = hash
    } catch (e) {
      console.error('Failed to hash password:', e)
      alert('Gagal memproses password secara aman.')
      return
    }
  } else {
    securityStore.security.passwordVal = tempPassword.value.trim()
  }
  
  securityStore.security.passwordEnabled = true
  store.saveState()
  showPasswordModal.value = false
}

// Toggle PIN handlers
const handlePinToggle = () => {
  const enabled = securityStore.security.pinEnabled
  if (enabled) {
    // Turning off validation rule check
    const activeUniversalCount = ((securityStore.security.passwordEnabled && securityStore.security.passwordVal && securityStore.security.passwordVal.trim() !== '') ? 1 : 0) + 
                                 ((securityStore.security.pinEnabled && securityStore.security.pinVal && securityStore.security.pinVal.trim() !== '') ? 1 : 0) + 
                                 ((securityStore.security.patternEnabled && securityStore.security.patternVal && securityStore.security.patternVal.trim() !== '') ? 1 : 0)
    if (activeUniversalCount === 1 && hasBiometricsEnabled.value) {
      alert('Gagal menonaktifkan. Anda tidak boleh mematikan metode keamanan universal terakhir jika metode biometrik Anda masih aktif.')
      return
    }
    securityStore.security.pinEnabled = false
    store.saveState()
  } else {
    // Open modal to configure PIN
    tempPin.value = ''
    pinDigits.value = ['', '', '', '']
    showPinModal.value = true
    focusFirstPinInput()
  }
}

const openConfigurePin = () => {
  tempPin.value = securityStore.security.pinVal
  if (securityStore.security.pinVal && securityStore.security.pinVal.length === 4) {
    pinDigits.value = securityStore.security.pinVal.split('')
  } else {
    pinDigits.value = ['', '', '', '']
  }
  showPinModal.value = true
  focusFirstPinInput()
}

const focusFirstPinInput = () => {
  setTimeout(() => {
    if (pinInputs.value && pinInputs.value[0]) {
      pinInputs.value[0].focus()
    }
  }, 100)
}

const onPinInput = (index, event) => {
  const value = event.target.value
  const cleanVal = value.replace(/\D/g, '')
  pinDigits.value[index] = cleanVal

  if (cleanVal && index < 3) {
    pinInputs.value[index + 1]?.focus()
  }
  tempPin.value = pinDigits.value.join('')
}

const onPinKeyDown = (index, event) => {
  if (event.key === 'Backspace') {
    if (!pinDigits.value[index] && index > 0) {
      pinDigits.value[index - 1] = ''
      pinInputs.value[index - 1]?.focus()
    } else {
      pinDigits.value[index] = ''
    }
    tempPin.value = pinDigits.value.join('')
  }
}

const onPinPaste = (event) => {
  const pasteData = event.clipboardData?.getData('text') || ''
  const cleanData = pasteData.replace(/\D/g, '').slice(0, 4)
  if (cleanData) {
    const digits = cleanData.split('')
    for (let i = 0; i < 4; i++) {
      pinDigits.value[i] = digits[i] || ''
    }
    tempPin.value = pinDigits.value.join('')
    const focusIndex = Math.min(cleanData.length, 3)
    pinInputs.value[focusIndex]?.focus()
  }
  event.preventDefault()
}

const savePinModal = () => {
  if (tempPin.value.length !== 4) {
    alert('PIN harus terdiri dari 4 digit angka.')
    return
  }
  securityStore.security.pinVal = tempPin.value
  securityStore.security.pinEnabled = true
  store.saveState()
  showPinModal.value = false
}

const lockAppNow = () => {
  securityStore.isLocked = true
}

// Toggle Pattern handlers
const handlePatternToggle = () => {
  const enabled = securityStore.security.patternEnabled
  if (enabled) {
    // Turning off validation rule check
    const activeUniversalCount = ((securityStore.security.passwordEnabled && securityStore.security.passwordVal && securityStore.security.passwordVal.trim() !== '') ? 1 : 0) + 
                                 ((securityStore.security.pinEnabled && securityStore.security.pinVal && securityStore.security.pinVal.trim() !== '') ? 1 : 0) + 
                                 ((securityStore.security.patternEnabled && securityStore.security.patternVal && securityStore.security.patternVal.trim() !== '') ? 1 : 0)
    if (activeUniversalCount === 1 && hasBiometricsEnabled.value) {
      alert('Gagal menonaktifkan. Anda tidak boleh mematikan metode keamanan universal terakhir jika metode biometrik Anda masih aktif.')
      return
    }
    securityStore.security.patternEnabled = false
    store.saveState()
  } else {
    // Open modal to draw pattern
    tempPattern.value = []
    showPatternModal.value = true
  }
}

const openConfigurePattern = () => {
  if (securityStore.security.patternVal) {
    tempPattern.value = securityStore.security.patternVal.split('-').map(Number)
  } else {
    tempPattern.value = []
  }
  showPatternModal.value = true
}

const getDotCoords = (index) => {
  const xCoords = [25, 60, 95]
  const yCoords = [25, 60, 95]
  const idx = index - 1
  return { x: xCoords[idx % 3], y: yCoords[Math.floor(idx / 3)] }
}

const handleTempDotClick = (index) => {
  if (tempPattern.value.includes(index)) {
    if (tempPattern.value[tempPattern.value.length - 1] === index) {
      tempPattern.value.pop()
    }
  } else {
    tempPattern.value.push(index)
  }
}

const resetTempPattern = () => {
  tempPattern.value = []
}

const savePatternModal = async () => {
  if (tempPattern.value.length < 2) {
    alert('Pola harus menghubungkan minimal 2 titik.')
    return
  }
  
  const patternStr = tempPattern.value.join('-')
  if (settingsStore.isTauri) {
    try {
      const hash = await safeInvoke('hash_credential', { plain: patternStr })
      securityStore.security.patternVal = hash
    } catch (e) {
      console.error('Failed to hash pattern:', e)
      alert('Gagal memproses pola secara aman.')
      return
    }
  } else {
    securityStore.security.patternVal = patternStr
  }
  
  securityStore.security.patternEnabled = true
  store.saveState()
  showPatternModal.value = false
}

// Toggle biometric handlers
const toggleBiometric = async (method) => {
  const currentVal = securityStore.security[`${method}Enabled`]
  
  if (!currentVal) {
    // Turning on validation check
    if (!hasUniversalEnabled.value) {
      alert('Gagal mengaktifkan. Silakan aktifkan minimal satu metode keamanan universal (Password, PIN, atau Pola) terlebih dahulu sebagai backup.')
      return
    }
  }
  
  await securityStore.setBiometricEnabled(method, !currentVal)
}

// Directives
const vFocus = {
  mounted: (el) => el.focus()
}

// ----------------------------------------------------
// 4. Tab Backup & Recovery
// ----------------------------------------------------
const isExporting = ref(false)
const isImporting = ref(false)
const isResetting = ref(false)

const exportBackup = async () => {
  isExporting.value = true
  try {
    // Artificial small delay to allow loading spinner to render
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const payload = {
      banks: store.banks,
      accounts: store.accounts,
      categories: store.categories,
      budgets: store.budgets,
      transactions: store.transactions,
      kMode: settingsStore.kMode,
      currentMonth: settingsStore.currentMonth,
      currentYear: settingsStore.currentYear,
      currencySymbol: settingsStore.currencySymbol,
      warningThreshold: settingsStore.warningThreshold,
      glowEffects: settingsStore.glowEffects,
      maxDebtLimit: settingsStore.maxDebtLimit,
      minSavingsRate: settingsStore.minSavingsRate,
      lowCashThreshold: settingsStore.lowCashThreshold,
      security: {
        ...securityStore.security,
        passwordVal: '',
        pinVal: '',
        patternVal: ''
      }
    }

    const jsonContent = JSON.stringify(payload, null, 2)
    const defaultFileName = `capital_flow_backup_${new Date().toISOString().split('T')[0]}.json`

    // In Tauri: show native save dialog
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      const { save } = await import('@tauri-apps/plugin-dialog')
      const { writeTextFile } = await import('@tauri-apps/plugin-fs')

      const filePath = await save({
        title: 'Save Capital Flow Backup',
        defaultPath: defaultFileName,
        filters: [{ name: 'JSON Backup', extensions: ['json'] }]
      })

      if (!filePath) return // User cancelled the dialog

      await writeTextFile(filePath, jsonContent)
      showToast('success', 'Backup Exported', `File saved to: ${filePath}`)
      return
    }

    // Browser fallback: trigger native download
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultFileName
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', 'Backup Downloaded', `File "${defaultFileName}" has been downloaded.`)
  } catch (err) {
    console.error('Export failed:', err)
    showToast('error', 'Export Failed', err?.message || 'Could not save the backup file.')
  } finally {
    isExporting.value = false
  }
}

const fileInput = ref(null)
const importError = ref('')
const importSuccess = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  isImporting.value = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      // Small delay to allow visual spinner to render
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const parsed = JSON.parse(e.target.result)
      const res = await store.importState(parsed)
      if (res.success) {
        showToast('success', 'Backup Imported', 'All data has been restored from the backup file.')
        importError.value = ''
      } else {
        importError.value = res.error
        showToast('error', 'Import Failed', res.error)
      }
    } catch (err) {
      importError.value = 'Failed to parse JSON backup file structure.'
      showToast('error', 'Import Failed', 'Invalid JSON backup file.')
    } finally {
      isImporting.value = false
      event.target.value = ''
    }
  }
  reader.onerror = () => {
    showToast('error', 'Import Failed', 'Failed to read backup file.')
    isImporting.value = false
    event.target.value = ''
  }
  reader.readAsText(file)
}

const resetDatabase = async () => {
  if (confirm('Are you absolutely sure you want to restore the Capital Flow system to factory defaults? All custom banks, transactions, and categories will be deleted!')) {
    isResetting.value = true
    try {
      // Small delay to show visual feedback
      await new Promise((resolve) => setTimeout(resolve, 600))
      await store.resetDatabase()
      showToast('success', 'Database Reset', 'All data has been cleared. The app is now in a clean state.')
    } catch (err) {
      console.error('Reset failed:', err)
      showToast('error', 'Reset Failed', err?.message || 'Could not reset the database.')
    } finally {
      isResetting.value = false
    }
  }
}
</script>

<style scoped>
/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
