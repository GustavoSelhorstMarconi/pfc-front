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

export interface ImportTransactionItem {
  externalId: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  suggestedCategoryId: string | null;
}

export interface ImportPreviewResponse {
  transactions: ImportTransactionItem[];
}

export interface ConfirmImportItem {
  externalId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
}

export interface ConfirmImportResponse {
  importedCount: number;
  failedCount: number;
  errorFileCsvBase64: string | null;
}
