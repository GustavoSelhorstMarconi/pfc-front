export interface CreateDebtRequest {
  name: string;
  totalAmount: number;
  interestRate?: number;
  dueDate?: string;
}

export interface UpdateDebtRequest extends CreateDebtRequest {
  id: string;
  isActive: boolean;
}

export interface DebtResponse {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  dueDate?: string;
  isActive: boolean;
}