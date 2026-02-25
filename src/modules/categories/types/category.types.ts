export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  color: string
  icon?: string
}

export interface UpdateCategoryRequest {
  id: string
  name: string
  color: string
  icon?: string
  isActive: boolean
}

export interface CategoryResponse {
  id: string
  name: string
  type: CategoryType
  color: string
  icon?: string
  isActive: boolean
}

export enum CategoryType {
  Income,
  Expense,
}
