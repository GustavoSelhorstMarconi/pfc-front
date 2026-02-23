import { httpClient } from '@/core/api/httpClient'
import type {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
} from '../types/auth.types'

export const authService = {
  async login(payload: LoginRequest) {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterRequest) {
    const { data } = await httpClient.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async refresh(payload: RefreshRequest) {
    const { data } = await httpClient.post<AuthResponse>('/auth/refresh', payload)
    return data
  },
}
