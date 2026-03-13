import { httpClient } from '@/core/api/httpClient';
import type { PagedRequest, PagedResponse } from '@/shared/types/paged.types';
import type { CreateRecurrenceRequest, PendingRecurrenceOcurrenceDto, RecurrenceResponse, UpdateRecurrenceRequest } from '../types/recurrence.types';
const BASE_URL = '/recurrences';

export const recurrenceService = {
  async create(payload: CreateRecurrenceRequest) {
    const { data } = await httpClient.post<RecurrenceResponse>(`${BASE_URL}`, payload);
    return data;
  },

  async get() {
    const { data } = await httpClient.get<RecurrenceResponse[]>(`${BASE_URL}`);
    return data;
  },

  async getPaged(params: PagedRequest) {
    const { data } = await httpClient.get<PagedResponse<RecurrenceResponse>>(`${BASE_URL}/paged`, { params });
    return data;
  },

  async update(id: string, payload: UpdateRecurrenceRequest) {
    const { data } = await httpClient.put<RecurrenceResponse>(`${BASE_URL}/${id}`, payload);
    return data;
  },

  async getPending(untilDate: string) {
    const { data } = await httpClient.get<PendingRecurrenceOcurrenceDto[]>(`${BASE_URL}/pending?untilDate=${untilDate}`);
    return data;
  },
};
