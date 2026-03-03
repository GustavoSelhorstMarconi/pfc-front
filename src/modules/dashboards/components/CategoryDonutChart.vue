<template>
  <div class="chart-card">
    <h3 class="chart-title">{{ title }}</h3>
    <div v-if="data.length === 0" class="empty-state">
      Nenhum dado no período
    </div>
    <VueApexCharts v-else type="donut" height="320" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { formatCurrency } from '@/shared/utils/formatters';
import type { CategoryTotalItem } from '../types/dashboard.types';

const props = defineProps<{
  title: string;
  data: CategoryTotalItem[];
}>();

const series = computed(() => props.data.map(({ total }) => Number(total)));

const chartOptions = computed((): ApexOptions => ({
  chart: {
    type: 'donut',
    background: 'transparent',
  },
  theme: { mode: 'dark' },
  labels: props.data.map(({ categoryName }) => categoryName),
  colors: props.data.map(({ color }) => color),
  dataLabels: {
    enabled: true,
    style: { fontSize: '12px' },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '60%',
      },
    },
  },
  legend: {
    position: 'bottom',
    labels: { colors: '#94a3b8' },
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: formatCurrency },
  },
  stroke: { width: 0 },
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
