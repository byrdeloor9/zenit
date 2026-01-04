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

export const getGlobalTrends = async (months: number = 12): Promise<import('../../types/models').GlobalTrends> => {
  const response = await apiClient.get<import('../../types/models').GlobalTrends>('/trends/global-trends/', {
    params: { months }
  })
  return response.data
}

export const getCategoryDistribution = async (
  startDate?: string,
  endDate?: string
): Promise<import('../../types/models').CategoryDistribution> => {
  const response = await apiClient.get<import('../../types/models').CategoryDistribution>('/trends/category-distribution/', {
    params: { start_date: startDate, end_date: endDate }
  })
  return response.data
}

export const getSpendingComparison = async (
  period: 'month' | 'year' = 'month'
): Promise<import('../../types/models').SpendingComparison> => {
  const response = await apiClient.get<import('../../types/models').SpendingComparison>('/trends/comparison/', {
    params: { period }
  })
  return response.data
}

