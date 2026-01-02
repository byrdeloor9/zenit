/**
 * Trends API endpoints
 */

import apiClient from '../client'
import type { CategoryTrend, CategoryOverview } from '../../types/models'

export interface TrendsCategoriesResponse {
  categories: CategoryOverview[]
}

export const getTrendCategories = async (): Promise<CategoryOverview[]> => {
  const response = await apiClient.get<TrendsCategoriesResponse>('/trends/')
  return response.data.categories
}

export const getCategoryTrend = async (
  categoryId: number,
  months: number = 6
): Promise<CategoryTrend> => {
  const response = await apiClient.get<CategoryTrend>(`/trends/${categoryId}/`, {
    params: { months }
  })
  return response.data
}

