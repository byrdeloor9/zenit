import apiClient from '../client'
import type { Investment, InvestmentTransaction } from '../../types/models'

export interface InvestmentFormData {
  investment_type: 'goal' | 'insurance'
  name: string
  account?: number | null
  initial_amount?: string
  current_amount?: string
  target_amount?: string | null
  policy_number?: string
  institution_name?: string
  expected_return_rate?: string
  maturity_term_months?: number | null
  maturity_date?: string | null
  start_date: string
  deadline?: string | null
  notes?: string
}

export interface ContributeData {
  amount: string
  account: number
  notes?: string
}

export interface WithdrawData {
  amount: string
  account: number
  notes?: string
}

export const getInvestments = async (): Promise<Investment[]> => {
  const response = await apiClient.get<Investment[]>('/investments/')
  return response.data
}

export const getInvestment = async (id: number): Promise<Investment> => {
  const response = await apiClient.get<Investment>(`/investments/${id}/`)
  return response.data
}

export const createInvestment = async (data: InvestmentFormData): Promise<Investment> => {
  const response = await apiClient.post<Investment>('/investments/', data)
  return response.data
}

export const updateInvestment = async (id: number, data: Partial<InvestmentFormData>): Promise<Investment> => {
  const response = await apiClient.patch<Investment>(`/investments/${id}/`, data)
  return response.data
}

export const deleteInvestment = async (id: number): Promise<void> => {
  await apiClient.delete(`/investments/${id}/`)
}

export const contributeToInvestment = async (
  id: number,
  data: ContributeData
): Promise<{ investment: Investment; transaction_id: number; message: string }> => {
  const response = await apiClient.post<{ investment: Investment; transaction_id: number; message: string }>(
    `/investments/${id}/contribute/`,
    data
  )
  return response.data
}

export const withdrawFromInvestment = async (
  id: number,
  data: WithdrawData
): Promise<{ investment: Investment; transaction_id: number; message: string }> => {
  const response = await apiClient.post<{ investment: Investment; transaction_id: number; message: string }>(
    `/investments/${id}/withdraw/`,
    data
  )
  return response.data
}

export const cancelPolicy = async (id: number): Promise<Investment> => {
  const response = await apiClient.post<Investment>(`/investments/${id}/cancel_policy/`)
  return response.data
}

export const completeInvestment = async (id: number): Promise<Investment> => {
  const response = await apiClient.post<Investment>(`/investments/${id}/complete/`)
  return response.data
}

export const getInvestmentHistory = async (id: number): Promise<InvestmentTransaction[]> => {
  const response = await apiClient.get<InvestmentTransaction[]>(`/investments/${id}/history/`)
  return response.data
}

export const getInvestmentTransactions = async (investmentId?: number): Promise<InvestmentTransaction[]> => {
  const params = investmentId ? { investment: investmentId } : {}
  const response = await apiClient.get<InvestmentTransaction[]>('/investment-transactions/', { params })
  return response.data
}

