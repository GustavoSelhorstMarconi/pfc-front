<template>
  <div class="chart-card">
    <h3 class="chart-title">Evolução dos Investimentos</h3>
    <div v-if="props.data.length === 0" class="empty-state">
      Nenhum dado de investimento no período
    </div>
    <VueApexCharts v-else type="area" height="320" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatCurrencyCompact } from '@/shared/utils/formatters';
import type { ApexOptions } from 'apexcharts';
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import type { InvestmentEvolutionResponse } from '../types/dashboard.types';

const props = defineProps<{
  data: InvestmentEvolutionResponse[];
}>();

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const sorted = computed(() =>
  [...props.data].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  )
);

const categories = computed(() =>
  sorted.value.map(({ month, year }) => `${MONTH_NAMES[month - 1]}/${String(year).slice(2)}`)
);

const series = computed(() => [
  {
    name: 'Patrimônio',
    data: sorted.value.map(({ investmentValue }) => Number(investmentValue)),
  },
]);

const chartOptions = computed((): ApexOptions => ({
  chart: {
    type: 'area',
    background: 'transparent',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  theme: { mode: 'dark' },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
    },
  },
  colors: ['#709de6'],
  xaxis: {
    categories: categories.value,
    labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
    axisBorder: { color: '#334155' },
    axisTicks: { color: '#334155' },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '12px' },
      formatter: formatCurrencyCompact,
    },
  },
  grid: {
    borderColor: '#1e293b',
    strokeDashArray: 4,
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: formatCurrency },
  },
  legend: {
    labels: { colors: '#94a3b8' },
  },
  markers: {
    size: 4,
    colors: ['#709de6'],
    strokeColors: '#0f172a',
    strokeWidth: 2,
    hover: { size: 6 },
  },
}));
</script>

<style scoped>
.chart-card {
  width: 100%;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
  font-size: 14px;
}
</style>
