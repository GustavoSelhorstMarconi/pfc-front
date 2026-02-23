import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'
import { authService } from '../../modules/auth/service/auth.service'
import { environment } from '../config/environment'

export const httpClient = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()

    if (error.response?.status === 401 && authStore.refreshToken) {
      try {
        const tokens = await authService.refresh({
          refreshToken: authStore.refreshToken,
        })

        authStore.setTokens(tokens.accessToken, tokens.refreshToken)

        error.config.headers.Authorization = `Bearer ${tokens.accessToken}`

        return httpClient(error.config)
      } catch {
        authStore.clearTokens()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)
