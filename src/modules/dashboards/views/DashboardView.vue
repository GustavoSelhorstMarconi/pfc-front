<template>
  <div class="dashboard-view">
    <div class="header">
      <div class="title-group">
        <h1>Dashboard</h1>
        <p class="subtitle">Visão geral do seu financeiro</p>
      </div>

      <div class="date-filter">
        <label>Período</label>
        <div class="date-range">
          <div class="date-range-input">
            <span>De</span>
            <input type="date" v-model="fromDate" @change="handleDateChange" />
          </div>
          <div class="date-range-input">
            <span>Até</span>
            <input type="date" v-model="toDate" @change="handleDateChange" />
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <template v-if="loadingSummary">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div class="dashboard-card total">
          <h3>Saldo Total</h3>
          <p class="amount total">
            {{ formatCurrency(dashboardSummary?.totalBalance || 0) }}
          </p>
        </div>

        <div class="dashboard-card total-investment">
          <h3>Saldo Total de Investimentos</h3>
          <p class="amount total">
            {{ formatCurrency(dashboardSummary?.totalInvestment || 0) }}
          </p>
        </div>

        <div class="dashboard-card income">
          <h3>Receitas do Período</h3>
          <p class="amount income">
            {{ formatCurrency(dashboardSummary?.monthIncome || 0) }}
          </p>
        </div>

        <div class="dashboard-card expense">
          <h3>Despesas do Período</h3>
          <p class="amount expense">
            {{ formatCurrency(dashboardSummary?.monthExpense || 0) }}
          </p>
        </div>

        <div class="dashboard-card result">
          <h3>Resultado do Período</h3>
          <p class="amount"
            :class="dashboardSummary?.monthResult && dashboardSummary?.monthResult >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(dashboardSummary?.monthResult || 0) }}
          </p>
        </div>

        <div class="dashboard-card month-investment">
          <h3>Receitas do Investimento no Período</h3>
          <p class="amount income">
            {{ formatCurrency(dashboardSummary?.monthInvestment || 0) }}
          </p>
        </div>
      </template>
    </div>

    <div class="chart-section">
      <SkeletonCard v-if="loadingHistory" class="chart-skeleton" />
      <IncomeExpenseChart v-else :data="incomeExpenseHistory ?? []" />
    </div>

    <div class="chart-section">
      <SkeletonCard v-if="loadingInvestmentEvolution" class="chart-skeleton" />
      <InvestmentEvolutionChart v-else :data="investmentEvolution ?? []" />
    </div>

    <div class="donut-section">
      <template v-if="loadingCategoryTotals">
        <SkeletonCard class="donut-skeleton" />
        <SkeletonCard class="donut-skeleton" />
      </template>
      <template v-else>
        <CategoryDonutChart title="Receitas por Categoria" :data="categoryTotals?.incomeTotals ?? []" />
        <CategoryDonutChart title="Despesas por Categoria" :data="categoryTotals?.expenseTotals ?? []" />
      </template>
    </div>

    <div class="monthly-table-section">
      <SkeletonCard v-if="loadingTransactionsByMonth" class="table-skeleton" />
      <MonthlyTransactionsTable v-else :data="transactionsByMonth ?? []" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { formatCurrency, formatDateToInput } from '@/shared/utils/formatters';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import CategoryDonutChart from '../components/CategoryDonutChart.vue';
import IncomeExpenseChart from '../components/IncomeExpenseChart.vue';
import InvestmentEvolutionChart from '../components/InvestmentEvolutionChart.vue';
import MonthlyTransactionsTable from '../components/MonthlyTransactionsTable.vue';
import { dashboardService } from '../services/dashboard.service';
import type {
  CategoryTotalsResponse,
  DashboardFilter,
  DashboardSummaryResponse,
  InvestmentEvolutionResponse,
  MonthlyIncomeExpenseResponse,
  TransactionsByMonthResponse,
} from '../types/dashboard.types';

const today = new Date();
const initialFrom = new Date(today);
initialFrom.setMonth(initialFrom.getMonth() - 4);

const fromDate = ref(formatDateToInput(initialFrom));
const toDate = ref(formatDateToInput(today));

const {
  execute: getDashboardSummary,
  data: dashboardSummary,
  error: errorSummary,
  loading: loadingSummary,
} = useApi<DashboardSummaryResponse, DashboardFilter>((filter) => dashboardService.getSummary(filter));

const {
  execute: getIncomeExpenseHistory,
  data: incomeExpenseHistory,
  error: errorHistory,
  loading: loadingHistory,
} = useApi<MonthlyIncomeExpenseResponse[], DashboardFilter>((filter) =>
  dashboardService.getIncomeExpenseHistory(filter)
);

const {
  execute: getCategoryTotals,
  data: categoryTotals,
  error: errorCategoryTotals,
  loading: loadingCategoryTotals,
} = useApi<CategoryTotalsResponse, DashboardFilter>((filter) =>
  dashboardService.getCategoryTotals(filter)
);

const {
  execute: getTransactionsByMonth,
  data: transactionsByMonth,
  error: errorTransactionsByMonth,
  loading: loadingTransactionsByMonth,
} = useApi<TransactionsByMonthResponse[], DashboardFilter>((filter) =>
  dashboardService.getTransactionsByMonth(filter)
);

const {
  execute: getInvestmentEvolution,
  data: investmentEvolution,
  error: errorInvestmentEvolution,
  loading: loadingInvestmentEvolution,
} = useApi<InvestmentEvolutionResponse[], DashboardFilter>((filter) =>
  dashboardService.getInvestmentEvolution(filter)
);

const currentFilter = (): DashboardFilter => ({
  fromDate: fromDate.value,
  toDate: toDate.value,
});

const fetchSummary = async (filter: DashboardFilter) => {
  await getDashboardSummary(filter);
  if (errorSummary.value) {
    toast.error('Erro ao carregar resumo do dashboard: ' + (errorSummary.value?.detail ?? 'Erro desconhecido'));
  }
};

const fetchHistory = async (filter: DashboardFilter) => {
  await getIncomeExpenseHistory(filter);
  if (errorHistory.value) {
    toast.error('Erro ao carregar histórico: ' + (errorHistory.value?.detail ?? 'Erro desconhecido'));
  }
};

const fetchCategoryTotals = async (filter: DashboardFilter) => {
  await getCategoryTotals(filter);
  if (errorCategoryTotals.value) {
    toast.error('Erro ao carregar totais por categoria: ' + (errorCategoryTotals.value?.detail ?? 'Erro desconhecido'));
  }
};

const fetchTransactionsByMonth = async (filter: DashboardFilter) => {
  await getTransactionsByMonth(filter);
  if (errorTransactionsByMonth.value) {
    toast.error('Erro ao carregar transações por mês: ' + (errorTransactionsByMonth.value?.detail ?? 'Erro desconhecido'));
  }
};

const fetchInvestmentEvolution = async (filter: DashboardFilter) => {
  await getInvestmentEvolution(filter);
  if (errorInvestmentEvolution.value) {
    toast.error('Erro ao carregar evolução de investimentos: ' + (errorInvestmentEvolution.value?.detail ?? 'Erro desconhecido'));
  }
};

const handleDateChange = async () => {
  await Promise.all([
    fetchSummary(currentFilter()),
    fetchHistory(currentFilter()),
    fetchCategoryTotals(currentFilter()),
    fetchTransactionsByMonth(currentFilter()),
    fetchInvestmentEvolution(currentFilter()),
  ]);
};

onMounted(async () => {
  await Promise.all([
    fetchSummary(currentFilter()),
    fetchHistory(currentFilter()),
    fetchCategoryTotals(currentFilter()),
    fetchTransactionsByMonth(currentFilter()),
    fetchInvestmentEvolution(currentFilter()),
  ]);
});
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

.subtitle {
  color: #94a3b8;
  margin: 0;
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

.date-range {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-range-input {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-range-input span {
  font-size: 12px;
  color: #64748b;
}

.date-range-input input {
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 12px;
  color: #cbd5e1;
  font-size: 14px;
  outline: none;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.date-range-input input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.dashboard-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
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

.amount.total-investment {
  color: #709de6;
}

.amount.income {
  color: #22c55e;
}

.amount.expense {
  color: #ef4444;
}

.amount.month-investment {
  color: #16a34a;
}

.amount.positive {
  color: #22c55e;
}

.amount.negative {
  color: #ef4444;
}

.chart-section {
  width: 100%;
  margin-top: 24px;
}

.chart-skeleton {
  width: 100% !important;
  height: 350px;
}

.donut-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 24px;
}

.donut-section>* {
  flex: 1;
  min-width: 300px;
}

.donut-skeleton {
  flex: 1;
  min-width: 300px;
  height: 370px;
}

.monthly-table-section {
  margin-top: 24px;
  width: 100%;
}

.table-skeleton {
  width: 100% !important;
  height: 300px;
}
</style>
