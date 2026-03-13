import { httpClient } from '@/core/api/httpClient';
import type { PagedRequest, PagedResponse } from '@/shared/types/paged.types';
import type {
  ConfirmImportItem,
  ConfirmImportResponse,
  CreateTransactionRequest,
  GenerateTransactionFromRecurrenceRequest,
  ImportPreviewResponse,
  TransactionResponse,
  UpdateTransactionRequest,
} from '../types/transaction.types';

const BASE_URL = '/transactions';

export const transactionService = {
  async create(payload: CreateTransactionRequest) {
    const { data } = await httpClient.post<TransactionResponse>(`${BASE_URL}`, payload);
    return data;
  },

  async get(params?: { month?: number; year?: number }) {
    const { data } = await httpClient.get<TransactionResponse[]>(`${BASE_URL}`, { params });
    return data;
  },

  async getPaged(params: PagedRequest & { month?: number; year?: number }) {
    const { data } = await httpClient.get<PagedResponse<TransactionResponse>>(`${BASE_URL}/paged`, { params });
    return data;
  },

  async update(id: string, payload: UpdateTransactionRequest) {
    const { data } = await httpClient.put<TransactionResponse>(`${BASE_URL}/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    const { data } = await httpClient.delete(`${BASE_URL}/${id}`);
    return data;
  },

  async generateFromRecurrences(payload: GenerateTransactionFromRecurrenceRequest[]) {
    const { data } = await httpClient.post<TransactionResponse[]>(`${BASE_URL}/from-recurrences`, payload);
    return data;
  },

  async previewImport(file: File) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await httpClient.post<ImportPreviewResponse>(`${BASE_URL}/import/preview`, form, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  async confirmImport(items: ConfirmImportItem[]) {
    const { data } = await httpClient.post<ConfirmImportResponse>(`${BASE_URL}/import/confirm`, { items });
    return data;
  },
};
