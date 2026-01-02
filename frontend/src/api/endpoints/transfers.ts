/**
 * Transfers API endpoints
 */

import apiClient from '../client'

export interface Transfer {
  id: number
  user_id: number
  from_account_id: number
  from_account_name: string
  to_account_id: number
  to_account_name: string
  amount: string
  transfer_date: string
  created_at: string
}

export interface TransferFormData {
  from_account: number
  to_account: number
  amount: string
  transfer_date: string
}

export const getTransfers = async (): Promise<Transfer[]> => {
  const response = await apiClient.get<Transfer[]>('/transfers/')
  return response.data
}

export const createTransfer = async (data: TransferFormData): Promise<Transfer> => {
  // User is automatically assigned by backend from JWT token
  const response = await apiClient.post<Transfer>('/transfers/', data)
  return response.data
}

export const deleteTransfer = async (id: number): Promise<void> => {
  await apiClient.delete(`/transfers/${id}/`)
}

