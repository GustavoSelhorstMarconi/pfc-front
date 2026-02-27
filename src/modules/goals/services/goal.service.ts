import { httpClient } from '@/core/api/httpClient';
import type {
  CreateGoalRequest,
  GoalResponse,
  UpdateGoalRequest
} from '../types/goal.types';
const BASE_URL = '/goals';

export const goalService = {
  async create(payload: CreateGoalRequest) {
    const { data } = await httpClient.post<GoalResponse>(`${BASE_URL}`, payload);
    return data;
  },

  async get() {
    const { data } = await httpClient.get<GoalResponse[]>(`${BASE_URL}`);
    return data;
  },

  async update(id: string, payload: UpdateGoalRequest) {
    const { data } = await httpClient.put<GoalResponse>(`${BASE_URL}/${id}`, payload);
    return data;
  },
};
