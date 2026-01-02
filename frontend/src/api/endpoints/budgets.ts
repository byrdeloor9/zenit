/**
 * Budgets API endpoints
 */

import apiClient from '../client'
import type { Budget, BudgetHistory } from '../../types/models'

export interface BudgetFormData {
  category: number
  amount: string
  months: number | null  // Number of months or null for custom/indefinite
  start_date: string
  end_date: string | null  // Null for indefinite budgets
  is_indefinite?: boolean  // For UI control
  is_recurring?: boolean
  status?: 'Active' | 'Paused' | 'Archived'
  change_reason?: string  // For history tracking (when editing)
}

export interface BudgetWithProgress extends Budget {
  // All fields from Budget plus calculated progress fields
  spent: number
  remaining: number
  percentage: number
}

export const getBudgets = async (): Promise<BudgetWithProgress[]> => {
  const response = await apiClient.get<BudgetWithProgress[]>('/budgets/')
  return response.data
}

export const createBudget = async (data: BudgetFormData): Promise<Budget> => {
  // Transform frontend field names to match backend model
  // User is automatically assigned by backend from JWT token
  const payload = {
    category: data.category,
    amount: data.amount,
    period_start: data.start_date,
    period_end: data.end_date || null,  // null if indefinite
    is_recurring: data.is_recurring || false,
    status: data.status || 'Active',
  }
  const response = await apiClient.post<Budget>('/budgets/', payload)
  return response.data
}

export const updateBudget = async (id: number, data: Partial<BudgetFormData>): Promise<Budget> => {
  // Transform frontend field names to match backend model
  const payload: Record<string, unknown> = {}
  
  if (data.category !== undefined) payload.category = data.category
  if (data.amount !== undefined) payload.amount = data.amount
  if (data.start_date !== undefined) payload.period_start = data.start_date
  if (data.end_date !== undefined) payload.period_end = data.end_date || null
  if (data.is_recurring !== undefined) payload.is_recurring = data.is_recurring
  if (data.status !== undefined) payload.status = data.status
  if (data.change_reason !== undefined) payload.change_reason = data.change_reason
  
  const response = await apiClient.patch<Budget>(`/budgets/${id}/`, payload)
  return response.data
}

export const deleteBudget = async (id: number): Promise<void> => {
  await apiClient.delete(`/budgets/${id}/`)
}

export const getBudgetHistory = async (id: number): Promise<BudgetHistory[]> => {
  const response = await apiClient.get<BudgetHistory[]>(`/budgets/${id}/history/`)
  return response.data
}

export const toggleBudgetStatus = async (id: number, status: 'Active' | 'Paused' | 'Archived'): Promise<Budget> => {
  const response = await apiClient.post<Budget>(`/budgets/${id}/toggle_status/`, { status })
  return response.data
}

