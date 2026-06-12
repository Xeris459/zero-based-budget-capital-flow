<template>
  <div>
    <!-- Zero-Based Status Banner -->
    <DashboardZbbStatusBanner />

    <!-- KPI Metric Ribbon -->
    <DashboardKpiRibbon />

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-gutter">
      <DashboardDoughnutChart type="spending" />
      <DashboardDoughnutChart type="savings" />
    </div>

    <!-- Budget Tracking Chart & Side panels -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <!-- 6-Month Budget Tracking SVG Chart -->
      <div class="lg:col-span-8 flex flex-col">
        <DashboardBudgetTrendChart />
      </div>

      <!-- Right Column: Income Overview & Accounts Summary -->
      <div class="lg:col-span-4 flex flex-col gap-gutter">
        <DashboardIncomeOverview />
        <DashboardAccountsSummary />
      </div>
    </div>

    <!-- Unified Cash Flow Summary Table -->
    <div class="mt-gutter">
      <DashboardSummaryTable />
    </div>
  </div>
</template>

<script setup>
// Page shell utilizing auto-imported components
</script>
