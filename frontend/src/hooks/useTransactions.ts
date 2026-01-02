/**
 * Hook for transactions management
 */

import { useState, useCallback } from 'react'
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  type TransactionFormData 
} from '../api/endpoints'
import type { Transaction } from '../types'

interface UseTransactionsReturn {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactions: (filters?: Record<string, unknown>) => Promise<void>
  addTransaction: (data: TransactionFormData) => Promise<Transaction | null>
  editTransaction: (id: number, data: Partial<TransactionFormData>) => Promise<Transaction | null>
  removeTransaction: (id: number) => Promise<boolean>
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async (filters?: Record<string, unknown>): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTransactions(filters)
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addTransaction = useCallback(async (data: TransactionFormData): Promise<Transaction | null> => {
    try {
      setLoading(true)
      setError(null)
      const newTransaction = await createTransaction(data)
      setTransactions(prev => [newTransaction, ...prev])
      return newTransaction
    } catch (err) {
      // Extract detailed error message from backend response
      let errorMessage = 'Failed to create transaction'
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: unknown; status?: number } }
        if (axiosError.response?.data) {
          // If backend returns validation errors object, format them
          if (typeof axiosError.response.data === 'object' && axiosError.response.data !== null) {
            const validationErrors = axiosError.response.data as Record<string, unknown>
            const errorMessages = Object.entries(validationErrors)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`
                }
                return `${field}: ${String(messages)}`
              })
              .join('; ')
            errorMessage = errorMessages || errorMessage
          } else {
            errorMessage = String(axiosError.response.data)
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error('Error creating transaction:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: unknown } }
        console.error('Backend validation errors:', axiosError.response?.data)
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const editTransaction = useCallback(async (
    id: number, 
    data: Partial<TransactionFormData>
  ): Promise<Transaction | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateTransaction(id, data)
      setTransactions(prev => prev.map(tx => tx.id === id ? updated : tx))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
      console.error('Error updating transaction:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeTransaction = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(tx => tx.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
      console.error('Error deleting transaction:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  }
}

