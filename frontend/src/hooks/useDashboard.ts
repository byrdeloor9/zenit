/**
 * Hook for dashboard data management
 */

import { useApi } from './useApi'
import { getDashboardStats } from '../api/endpoints'
import type { DashboardStats } from '../types'

/**
 * Hook to fetch and manage dashboard statistics
 */
export function useDashboard() {
  return useApi<DashboardStats>(getDashboardStats, [])
}

