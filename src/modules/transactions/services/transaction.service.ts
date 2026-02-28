import { httpClient } from '@/core/api/httpClient';
import type { CreateTransactionRequest, TransactionResponse, UpdateTransactionRequest } from '../types/transaction.types';
const BASE_URL = '/transactions';

export const transactionService = {
  async create(payload: CreateTransactionRequest) {
    const { data } = await httpClient.post<TransactionResponse>(`${BASE_URL}`, payload);
    return data;
  },

  async get() {
    const { data } = await httpClient.get<TransactionResponse[]>(`${BASE_URL}`);
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
};
