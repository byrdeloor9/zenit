/**
 * Debts API endpoints
 */

import apiClient from '../client'
import type { Debt, DebtPayment } from '../../types'

export interface DebtFormData {
  creditor_name: string
  principal_amount: string
  interest_rate: string
  interest_type: 'simple' | 'amortized'
  term_months: number
  start_date: string
  notes: string | null
}

export interface PaymentFormData {
  account: number
  amount: string
  payment_date: string
  notes: string | null
}

// Calculate monthly payment based on interest type
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  months: number,
  interestType: 'simple' | 'amortized'
): number => {
  if (interestType === 'simple') {
    // Simple interest: Total = Principal + (Principal × rate × time)
    const totalInterest = principal * (annualRate / 100) * (months / 12)
    const totalAmount = principal + totalInterest
    return totalAmount / months
  } else {
    // Amortized interest
    if (annualRate === 0) {
      return principal / months
    }
    
    const monthlyRate = annualRate / 100 / 12
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    
    return payment
  }
}

export const getDebts = async (): Promise<Debt[]> => {
  const response = await apiClient.get<Debt[]>('/debts/')
  return response.data
}

export const createDebt = async (data: DebtFormData): Promise<Debt> => {
  // Calculate monthly payment based on interest type
  const monthlyPayment = calculateMonthlyPayment(
    parseFloat(data.principal_amount),
    parseFloat(data.interest_rate),
    data.term_months,
    data.interest_type
  )
  
  // User is automatically assigned by backend from JWT token
  const payload = {
    ...data,
    monthly_payment: monthlyPayment.toFixed(2),
  }
  
  const response = await apiClient.post<Debt>('/debts/', payload)
  return response.data
}

export const updateDebt = async (id: number, data: Partial<DebtFormData>): Promise<Debt> => {
  const response = await apiClient.patch<Debt>(`/debts/${id}/`, data)
  return response.data
}

export const addDebtPayment = async (debtId: number, data: PaymentFormData): Promise<Debt> => {
  const response = await apiClient.post<Debt>(`/debts/${debtId}/add_payment/`, data)
  return response.data
}

export const deleteDebt = async (id: number): Promise<void> => {
  await apiClient.delete(`/debts/${id}/`)
}

export const getDebtPayments = async (debtId?: number): Promise<DebtPayment[]> => {
  const params = debtId ? { debt: debtId } : {}
  const response = await apiClient.get<DebtPayment[]>('/debt-payments/', { params })
  return response.data
}

