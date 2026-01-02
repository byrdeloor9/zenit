/**
 * Hook for debts management
 */

import { useState, useCallback } from 'react'
import {
  getDebts,
  createDebt,
  updateDebt,
  addDebtPayment,
  deleteDebt,
  type DebtFormData,
  type PaymentFormData,
} from '../api/endpoints/debts'
import type { Debt } from '../types/models'

interface UseDebtsReturn {
  debts: Debt[]
  loading: boolean
  error: string | null
  fetchDebts: () => Promise<void>
  addDebt: (data: DebtFormData) => Promise<Debt | null>
  editDebt: (id: number, data: Partial<DebtFormData>) => Promise<Debt | null>
  makePayment: (debtId: number, data: PaymentFormData) => Promise<Debt | null>
  removeDebt: (id: number) => Promise<boolean>
}

export function useDebts(): UseDebtsReturn {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDebts()
      setDebts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debts')
      console.error('Error fetching debts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addDebt = useCallback(async (data: DebtFormData): Promise<Debt | null> => {
    try {
      setLoading(true)
      setError(null)
      const newDebt = await createDebt(data)
      setDebts(prev => [newDebt, ...prev])
      return newDebt
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create debt')
      console.error('Error creating debt:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const editDebt = useCallback(async (
    id: number,
    data: Partial<DebtFormData>
  ): Promise<Debt | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateDebt(id, data)
      setDebts(prev => prev.map(debt => debt.id === id ? updated : debt))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update debt')
      console.error('Error updating debt:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const makePayment = useCallback(async (
    debtId: number,
    data: PaymentFormData
  ): Promise<Debt | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await addDebtPayment(debtId, data)
      setDebts(prev => prev.map(debt => debt.id === debtId ? updated : debt))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment')
      console.error('Error adding payment:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeDebt = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteDebt(id)
      setDebts(prev => prev.filter(debt => debt.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete debt')
      console.error('Error deleting debt:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    debts,
    loading,
    error,
    fetchDebts,
    addDebt,
    editDebt,
    makePayment,
    removeDebt,
  }
}

