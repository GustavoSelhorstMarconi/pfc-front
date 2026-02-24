import type { AxiosError } from 'axios'
import { ref } from 'vue'

export interface ErrorResponse {
  status: string
  title: string
  detail: string
  type: string
}

export function useApi<T>(apiCall: () => Promise<T>) {
  const loading = ref(false)
  const error = ref<ErrorResponse | null>(null)
  const data = ref<T | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await apiCall()
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>

      if (axiosError.response?.data) {
        error.value = axiosError.response.data
      } else {
        error.value = {
          status: '500',
          title: 'Erro inesperado',
          detail: axiosError.message,
          type: 'unexpected-error',
        }
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}
