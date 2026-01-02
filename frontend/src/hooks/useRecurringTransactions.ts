/**
 * Custom hook for managing recurring transactions (income and expenses)
 */

import { useState, useCallback } from 'react'
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleActiveRecurringTransaction,
  generateNowRecurringTransaction,
  getIncomeProjections,
  type RecurringTransactionFormData,
  type ProjectionsResponse,
} from '../api/endpoints/recurring-transactions'
import type { RecurringTransaction } from '../types'

interface UseRecurringTransactionsReturn {
  transactions: RecurringTransaction[]
  projections: ProjectionsResponse | null
  loading: boolean
  isInitialLoading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  fetchProjections: (months?: number) => Promise<void>
  addTransaction: (data: RecurringTransactionFormData) => Promise<void>
  editTransaction: (id: number, data: Partial<RecurringTransactionFormData>) => Promise<void>
  removeTransaction: (id: number) => Promise<boolean>
  toggleActive: (id: number) => Promise<void>
  generateNow: (id: number) => Promise<void>
}

export function useRecurringTransactions(): UseRecurringTransactionsReturn {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [projections, setProjections] = useState<ProjectionsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRecurringTransactions()
      setTransactions(data)
    } catch (err) {
      setError('Error al cargar transacciones recurrentes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProjections = useCallback(async (months: number = 12) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getIncomeProjections(months)
      setProjections(data)
      setIsInitialLoading(false)
    } catch (err) {
      setError('Error al cargar proyecciones')
      console.error(err)
      setIsInitialLoading(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const addTransaction = useCallback(async (data: RecurringTransactionFormData) => {
    setLoading(true)
    setError(null)
    try {
      const newTransaction = await createRecurringTransaction(data)
      setTransactions((prev) => [newTransaction, ...prev])
    } catch (err) {
      setError('Error al crear transacción recurrente')
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const editTransaction = useCallback(
    async (id: number, data: Partial<RecurringTransactionFormData>) => {
      setLoading(true)
      setError(null)
      try {
        const updatedTransaction = await updateRecurringTransaction(id, data)
        setTransactions((prev) =>
          prev.map((transaction) => (transaction.id === id ? updatedTransaction : transaction))
        )
      } catch (err) {
        setError('Error al actualizar transacción recurrente')
        console.error(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const removeTransaction = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await deleteRecurringTransaction(id)
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
      return true
    } catch (err) {
      setError('Error al eliminar transacción recurrente')
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleActive = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const updatedTransaction = await toggleActiveRecurringTransaction(id)
      setTransactions((prev) =>
        prev.map((transaction) => (transaction.id === id ? updatedTransaction : transaction))
      )
    } catch (err) {
      setError('Error al cambiar estado de la transacción')
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generateNow = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateNowRecurringTransaction(id)
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id ? result.recurring_transaction : transaction
        )
      )
    } catch (err) {
      setError('Error al generar transacción')
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    transactions,
    projections,
    loading,
    isInitialLoading,
    error,
    fetchTransactions,
    fetchProjections,
    addTransaction,
    editTransaction,
    removeTransaction,
    toggleActive,
    generateNow,
  }
}



