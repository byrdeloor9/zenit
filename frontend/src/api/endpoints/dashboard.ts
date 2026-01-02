/**
 * Dashboard API endpoints
 */

import apiClient from '../client'
import type { DashboardStats } from '../../types'

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/')
  return response.data
}

export const checkHealth = async (): Promise<{ status: string; message: string }> => {
  const response = await apiClient.get<{ status: string; message: string }>('/health/')
  return response.data
}


