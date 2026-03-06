import type { TransactionType } from "@/modules/transactions/types/transaction.types";

export interface CreateCategoryRequest {
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isActive: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  isActive: boolean;
}
