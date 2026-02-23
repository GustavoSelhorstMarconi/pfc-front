import type { AxiosError } from 'axios'
import { ref } from 'vue'

export function useApi<T>(apiCall: () => Promise<T>) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await apiCall()
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>

      error.value = axiosError.response?.data?.message || axiosError.message || 'Erro inesperado'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}
