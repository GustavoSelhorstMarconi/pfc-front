import { httpClient } from '@/core/api/httpClient';
import type { CategoryTotalsResponse, DashboardFilter, DashboardSummaryResponse, InvestmentEvolutionResponse, MonthlyIncomeExpenseResponse, TransactionsByMonthResponse } from '../types/dashboard.types';

const BASE_URL = '/dashboard';

export const dashboardService = {
  async getSummary(filter: DashboardFilter) {
    const { data } = await httpClient.get<DashboardSummaryResponse>(`${BASE_URL}/summary`, {
      params: {
        ...(filter.fromDate && { fromDate: filter.fromDate }),
        ...(filter.toDate && { toDate: filter.toDate }),
      },
    });
    return data;
  },

  async getIncomeExpenseHistory(filter: DashboardFilter) {
    const { data } = await httpClient.get<MonthlyIncomeExpenseResponse[]>(`${BASE_URL}/income-expense-history`, {
      params: {
        ...(filter.fromDate && { fromDate: filter.fromDate }),
        ...(filter.toDate && { toDate: filter.toDate }),
      },
    });
    return data;
  },

  async getCategoryTotals(filter: DashboardFilter) {
    const { data } = await httpClient.get<CategoryTotalsResponse>(`${BASE_URL}/category-totals`, {
      params: {
        ...(filter.fromDate && { fromDate: filter.fromDate }),
        ...(filter.toDate && { toDate: filter.toDate }),
      },
    });
    return data;
  },

  async getTransactionsByMonth(filter: DashboardFilter) {
    const { data } = await httpClient.get<TransactionsByMonthResponse[]>(`${BASE_URL}/transactions-by-month`, {
      params: {
        ...(filter.fromDate && { fromDate: filter.fromDate }),
        ...(filter.toDate && { toDate: filter.toDate }),
      },
    });
    return data;
  },

  async getInvestmentEvolution(filter: DashboardFilter) {
    const { data } = await httpClient.get<InvestmentEvolutionResponse[]>(`${BASE_URL}/investment-evolution`, {
      params: {
        ...(filter.fromDate && { fromDate: filter.fromDate }),
        ...(filter.toDate && { toDate: filter.toDate }),
      },
    });
    return data;
  },
};
