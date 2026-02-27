import { httpClient } from '@/core/api/httpClient';
import type { CreateDebtRequest, DebtResponse, UpdateDebtRequest } from '../types/debt.types';
const BASE_URL = '/debts';

export const debtService = {
  async create(payload: CreateDebtRequest) {
    const { data } = await httpClient.post<DebtResponse>(`${BASE_URL}`, payload);
    return data;
  },

  async get() {
    const { data } = await httpClient.get<DebtResponse[]>(`${BASE_URL}`);
    return data;
  },

  async update(id: string, payload: UpdateDebtRequest) {
    const { data } = await httpClient.put<DebtResponse>(`${BASE_URL}/${id}`, payload);
    return data;
  },
};
