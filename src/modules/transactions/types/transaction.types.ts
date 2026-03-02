export interface CreateTransactionRequest {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
  goalId?: string | null;
  debtId?: string | null;
}

export interface UpdateTransactionRequest extends CreateTransactionRequest {
  id: string;
}

export interface TransactionResponse extends CreateTransactionRequest {
  id: string;
  isActive: boolean;
}

export interface GenerateTransactionFromRecurrenceRequest {
  recurrenceId: string;
  occurrenceDate: string;
}

export enum TransactionType {
  Income,
  Expense
}
