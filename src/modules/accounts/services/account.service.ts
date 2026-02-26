import { httpClient } from '@/core/api/httpClient'
import type {
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../types/account.types'

const BASE_URL = '/accounts'

export const accountService = {
  async create(payload: CreateAccountRequest) {
    const { data } = await httpClient.post<AccountResponse>(`${BASE_URL}`, payload)
    return data
  },

  async get() {
    const { data } = await httpClient.get<AccountResponse[]>(`${BASE_URL}`)
    return data
  },

  async update(id: string, payload: UpdateAccountRequest) {
    const { data } = await httpClient.put<AccountResponse>(`${BASE_URL}/${id}`, payload)
    return data
  },
}
