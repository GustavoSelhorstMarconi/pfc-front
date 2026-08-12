import type { AxiosError } from 'axios'
import { ref } from 'vue'

export interface ErrorResponse {
  status: string
  title: string
  detail: string
  type: string
}

// Formatos de erro que a API pode retornar no corpo (ProblemDetails, erros simples, etc.)
interface RawErrorBody {
  detail?: string
  message?: string
  error?: string
  title?: string
  status?: string | number
  type?: string
}

const extractDetail = (body: RawErrorBody): string | undefined =>
  body.detail ?? body.message ?? body.error ?? body.title

export function useApi<T, P = void>(apiCall: (params: P) => Promise<T>) {
  const loading = ref(false)
  const error = ref<ErrorResponse | null>(null)
  const data = ref<T | null>(null)

  const execute = async (params: P) => {
    loading.value = true
    error.value = null

    try {
      data.value = await apiCall(params)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<RawErrorBody>
      const body = axiosError.response?.data

      const detail = (body && extractDetail(body)) ?? axiosError.message

      error.value = {
        status: String(body?.status ?? axiosError.response?.status ?? '500'),
        title: body?.title ?? 'Erro inesperado',
        detail,
        type: body?.type ?? 'unexpected-error',
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}
