export interface DashboardSummaryResponse {
  totalBalance: number;
  totalInvestment: number;
  monthIncome: number;
  monthExpense: number;
  monthInvestment: number;
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

export interface TransactionItem {
  id: string;
  accountName: string;
  categoryName: string;
  type: number; // 0 = Income, 1 = Expense
  amount: number;
  date: string;
  description?: string;
  isActive: boolean;
}

export interface TransactionsByMonthResponse {
  year: number;
  month: number;
  transactions: TransactionItem[];
}

export interface InvestmentEvolutionResponse {
  year: number;
  month: number;
  investmentValue: number;
}