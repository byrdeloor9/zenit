/**
 * Accounts API endpoints
 */

import apiClient from '../client'
import type { Account, AccountFormData } from '../../types'

export const getAccounts = async (): Promise<Account[]> => {
  const response = await apiClient.get<Account[]>('/accounts/')
  return response.data
}

export const getAccount = async (id: number): Promise<Account> => {
  const response = await apiClient.get<Account>(`/accounts/${id}/`)
  return response.data
}

export const createAccount = async (data: AccountFormData): Promise<Account> => {
  // User is automatically assigned by backend from JWT token
  const response = await apiClient.post<Account>('/accounts/', data)
  return response.data
}

export const updateAccount = async (id: number, data: Partial<AccountFormData>): Promise<Account> => {
  // User field not needed for updates
  const response = await apiClient.patch<Account>(`/accounts/${id}/`, data)
  return response.data
}

export const deleteAccount = async (id: number): Promise<void> => {
  await apiClient.delete(`/accounts/${id}/`)
}

