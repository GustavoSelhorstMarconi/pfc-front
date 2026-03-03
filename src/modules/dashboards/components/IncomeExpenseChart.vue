<template>
  <div class="chart-card">
    <h3 class="chart-title">Histórico de Receitas e Despesas</h3>
    <VueApexCharts type="area" height="350" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { formatCurrency, formatCurrencyCompact } from '@/shared/utils/formatters';
import type { MonthlyIncomeExpenseResponse } from '../types/dashboard.types';

const props = defineProps<{
  data: MonthlyIncomeExpenseResponse[];
}>();

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const categories = computed(() =>
  props.data.map(({ month, year }) => `${MONTH_NAMES[month - 1]}/${String(year).slice(2)}`)
);

const series = computed(() => [
  {
    name: 'Receita',
    data: props.data.map(({ income }) => Number(income)),
  },
  {
    name: 'Despesa',
    data: props.data.map(({ expense }) => Number(expense)),
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
      opacityFrom: 0.4,
      opacityTo: 0.05,
    },
  },
  colors: ['#22c55e', '#ef4444'],
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
</style>
