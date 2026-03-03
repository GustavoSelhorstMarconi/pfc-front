export interface DashboardSummaryResponse {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthResult: number;
}

export interface MonthlyIncomeExpenseResponse {
  month: number;
  year: number;
  income: number;
  expense: number;
}

export interface DashboardFilter {
  fromDate: string | null;
  toDate: string | null;
}

export interface CategoryTotalItem {
  categoryName: string;
  color: string;
  total: number;
}

export interface CategoryTotalsResponse {
  incomeTotals: CategoryTotalItem[];
  expenseTotals: CategoryTotalItem[];
}