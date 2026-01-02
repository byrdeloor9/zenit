/**
 * Categories API endpoints
 */

import apiClient from '../client'
import type { Category } from '../../types'

export interface CategoryFormData {
  name: string
  type: 'Income' | 'Expense'
  icon: string | null
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories/')
  return response.data
}

export const createCategory = async (data: CategoryFormData): Promise<Category> => {
  // User is automatically assigned by backend from JWT token
  const response = await apiClient.post<Category>('/categories/', data)
  return response.data
}

export const updateCategory = async (id: number, data: Partial<CategoryFormData>): Promise<Category> => {
  const response = await apiClient.patch<Category>(`/categories/${id}/`, data)
  return response.data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}/`)
}

