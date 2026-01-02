/**
 * Transactions API endpoints
 */

import apiClient from '../client'
import type { Transaction } from '../../types'

export interface TransactionFormData {
  account: number
  category: number | null
  type: 'Income' | 'Expense'
  amount: string
  description: string
  transaction_date: string
}

export const getTransactions = async (params?: Record<string, unknown>): Promise<Transaction[]> => {
  const response = await apiClient.get<Transaction[]>('/transactions/', { params })
  return response.data
}

export const getTransactionsByAccount = async (accountId: number): Promise<Transaction[]> => {
  const response = await apiClient.get<Transaction[]>('/transactions/', {
    params: { account: accountId }
  })
  return response.data
}

export const createTransaction = async (data: TransactionFormData): Promise<Transaction> => {
  // User is automatically assigned by backend from JWT token
  const response = await apiClient.post<Transaction>('/transactions/', data)
  return response.data
}

export const updateTransaction = async (id: number, data: Partial<TransactionFormData>): Promise<Transaction> => {
  const response = await apiClient.patch<Transaction>(`/transactions/${id}/`, data)
  return response.data
}

export const deleteTransaction = async (id: number): Promise<void> => {
  await apiClient.delete(`/transactions/${id}/`)
}

