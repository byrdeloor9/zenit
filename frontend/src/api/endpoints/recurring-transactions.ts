/**
 * Recurring Transactions API endpoints
 */

import apiClient from '../client'
import type { RecurringTransaction, IncomeProjection } from '../../types'

export interface RecurringTransactionFormData {
  name: string
  transaction_type: 'Income' | 'Expense'
  amount: string
  frequency: 'monthly' | 'biweekly' | 'weekly'
  day_of_period: number
  account: number
  category: number | null
  start_date: string
  end_date: string | null
  is_active: boolean
  notes: string | null
}

export interface ProjectionsResponse {
  projections: IncomeProjection[]
  total_monthly_income: number
  total_monthly_expenses: number
  average_net_balance: number
}

export const getRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
  const response = await apiClient.get<RecurringTransaction[]>('/recurring-transactions/')
  return response.data
}

export const createRecurringTransaction = async (data: RecurringTransactionFormData): Promise<RecurringTransaction> => {
  // User is automatically assigned by backend from JWT token
  const response = await apiClient.post<RecurringTransaction>('/recurring-transactions/', data)
  return response.data
}

export const updateRecurringTransaction = async (id: number, data: Partial<RecurringTransactionFormData>): Promise<RecurringTransaction> => {
  const response = await apiClient.patch<RecurringTransaction>(`/recurring-transactions/${id}/`, data)
  return response.data
}

export const deleteRecurringTransaction = async (id: number): Promise<void> => {
  await apiClient.delete(`/recurring-transactions/${id}/`)
}

export const toggleActiveRecurringTransaction = async (id: number): Promise<RecurringTransaction> => {
  const response = await apiClient.post<RecurringTransaction>(`/recurring-transactions/${id}/toggle_active/`)
  return response.data
}

export const generateNowRecurringTransaction = async (id: number): Promise<{
  recurring_transaction: RecurringTransaction
  transaction_id: number
  message: string
}> => {
  const response = await apiClient.post(`/recurring-transactions/${id}/generate_now/`)
  return response.data
}

export const getIncomeProjections = async (months: number = 12): Promise<ProjectionsResponse> => {
  const response = await apiClient.get<ProjectionsResponse>('/recurring-transactions/projections/', {
    params: { months }
  })
  return response.data
}



