import { httpClient } from '@/core/api/httpClient'
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types'

const BASE_URL = '/categories'

export const categoryService = {
  async create(payload: CreateCategoryRequest) {
    const { data } = await httpClient.post<CategoryResponse>(`${BASE_URL}`, payload)
    return data
  },

  async get() {
    const { data } = await httpClient.get<CategoryResponse[]>(`${BASE_URL}`)
    return data
  },

  async update(id: string, payload: UpdateCategoryRequest) {
    const { data } = await httpClient.put<CategoryResponse>(`${BASE_URL}/${id}`, payload)
    return data
  },
}
