import { httpClient } from '@/core/api/httpClient';
import type { DashboardSummaryResponse } from '../types/dashboard.types';
const BASE_URL = '/dashboard';

export const dashboardService = {
  async getSummary(date: string | null) {
    const url = date ? `${BASE_URL}/summary?date=${date}` : `${BASE_URL}/summary`;

    const { data } = await httpClient.get<DashboardSummaryResponse>(url);
    return data;
  },
};
