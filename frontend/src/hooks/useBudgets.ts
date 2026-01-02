/**
 * Hook for budgets management
 */

import { useState, useCallback } from 'react'
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  type BudgetFormData,
  type BudgetWithProgress,
} from '../api/endpoints/budgets'
import type { Budget } from '../types'

interface UseBudgetsReturn {
  budgets: BudgetWithProgress[]
  loading: boolean
  error: string | null
  fetchBudgets: () => Promise<void>
  addBudget: (data: BudgetFormData) => Promise<Budget | null>
  editBudget: (id: number, data: Partial<BudgetFormData>) => Promise<Budget | null>
  removeBudget: (id: number) => Promise<boolean>
}

export function useBudgets(): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBudgets()
      setBudgets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
      console.error('Error fetching budgets:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addBudget = useCallback(async (data: BudgetFormData): Promise<Budget | null> => {
    try {
      setLoading(true)
      setError(null)
      const newBudget = await createBudget(data)
      // Fetch budgets again to get progress data
      await fetchBudgets()
      return newBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget')
      console.error('Error creating budget:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBudgets])

  const editBudget = useCallback(async (
    id: number,
    data: Partial<BudgetFormData>
  ): Promise<Budget | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateBudget(id, data)
      // Fetch budgets again to get updated progress data
      await fetchBudgets()
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget')
      console.error('Error updating budget:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBudgets])

  const removeBudget = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteBudget(id)
      setBudgets(prev => prev.filter(budget => budget.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget')
      console.error('Error deleting budget:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    addBudget,
    editBudget,
    removeBudget,
  }
}

