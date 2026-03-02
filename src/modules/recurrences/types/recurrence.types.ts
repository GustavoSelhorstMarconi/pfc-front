import type { TransactionType } from "@/modules/transactions/types/transaction.types";

export interface CreateRecurrenceRequest {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  frequency: RecurrenceFrequency;
  interval: number;
  startDate: string;
  endDate?: string;
  generatesTransaction: boolean;
}

export interface UpdateRecurrenceRequest extends CreateRecurrenceRequest {
  id: string;
  isActive: boolean;
}

export interface RecurrenceResponse extends CreateRecurrenceRequest {
  id: string;
  isActive: boolean;
}

export interface PendingRecurrenceOcurrenceDto {
  recurrenceId: string;
  description: string;
  occurrenceDate: string;
  amount: number;
  accountId: string;
  categoryId: string;
}

export enum RecurrenceFrequency {
  Daily,
  Weekly,
  Monthly,
  Yearly
}