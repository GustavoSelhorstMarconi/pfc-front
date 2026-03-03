<template>
  <div class="dashboard-view">
    <div class="header">
      <div class="title-group">
        <h1>Dashboard</h1>
        <p class="subtitle">Visão geral do seu financeiro</p>
      </div>

      <div class="date-filter">
        <label>Data Base</label>
        <input type="month" v-model="baseDate" @change="handleDateChange" />
      </div>
    </div>

    <div class="dashboard-grid">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div class="dashboard-card total">
          <h3>Saldo Total</h3>
          <p class="amount total">
            {{ formatCurrency(dashboardSummary?.totalBalance || 0) }}
          </p>
        </div>

        <div class="dashboard-card income">
          <h3>Receitas do Mês</h3>
          <p class="amount income">
            {{ formatCurrency(dashboardSummary?.monthIncome || 0) }}
          </p>
        </div>

        <div class="dashboard-card expense">
          <h3>Despesas do Mês</h3>
          <p class="amount expense">
            {{ formatCurrency(dashboardSummary?.monthExpense || 0) }}
          </p>
        </div>

        <div class="dashboard-card result">
          <h3>Resultado do Mês</h3>
          <p class="amount"
            :class="dashboardSummary?.monthResult && dashboardSummary?.monthResult >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(dashboardSummary?.monthResult || 0) }}
          </p>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardSummaryResponse } from '../types/dashboard.types';

const baseDate = ref();

const {
  execute: getDashboardSummary,
  data: dashboardSummary,
  error: errorGetDashboardSummary,
  loading,
} = useApi<DashboardSummaryResponse, string | null>((date) => dashboardService.getSummary(date));

const handleGetDashboardSummary = async (date: string | null) => {
  await getDashboardSummary(date);

  if (errorGetDashboardSummary.value) {
    toast.error('Erro ao carregar resumo do dashboard: ' + (errorGetDashboardSummary.value?.detail ?? 'Erro desconhecido'));
  }
};

const handleDateChange = async () => {
  await handleGetDashboardSummary(baseDate.value);
};

onMounted(async () => {
  await handleGetDashboardSummary(null);
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
</script>

<style scoped>
.dashboard-view {
  padding: 2rem;
  color: #cbd5e1;
  width: 100%;
}

h1 {
  color: #3b82f6;
  margin-bottom: 6px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.date-filter label {
  font-size: 12px;
  color: #94a3b8;
}

.date-filter input {
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 12px;
  color: #cbd5e1;
  font-size: 14px;
  outline: none;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.date-filter input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.subtitle {
  color: #94a3b8;
  margin: 0;
}

.dashboard-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.dashboard-card {
  width: 280px;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.dashboard-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
}

.amount {
  font-size: 24px;
  font-weight: 700;
}

.amount.total {
  color: #3b82f6;
}

.amount.income {
  color: #22c55e;
}

.amount.expense {
  color: #ef4444;
}

.amount.positive {
  color: #22c55e;
}

.amount.negative {
  color: #ef4444;
}
</style>