/**
 * Hook for goals management
 */

import { useState, useCallback } from 'react'
import {
  getGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  completeGoal,
  cancelGoal,
  deleteGoal,
  type GoalFormData,
} from '../api/endpoints/goals'
import type { Goal } from '../types'

interface UseGoalsReturn {
  goals: Goal[]
  loading: boolean
  error: string | null
  fetchGoals: () => Promise<void>
  addGoal: (data: GoalFormData) => Promise<Goal | null>
  editGoal: (id: number, data: Partial<GoalFormData>) => Promise<Goal | null>
  updateProgress: (id: number, amount: string) => Promise<Goal | null>
  markComplete: (id: number) => Promise<Goal | null>
  markCancelled: (id: number) => Promise<Goal | null>
  removeGoal: (id: number) => Promise<boolean>
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGoals()
      setGoals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals')
      console.error('Error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addGoal = useCallback(async (data: GoalFormData): Promise<Goal | null> => {
    try {
      setLoading(true)
      setError(null)
      const newGoal = await createGoal(data)
      setGoals(prev => [newGoal, ...prev])
      return newGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal')
      console.error('Error creating goal:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const editGoal = useCallback(async (
    id: number,
    data: Partial<GoalFormData>
  ): Promise<Goal | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateGoal(id, data)
      setGoals(prev => prev.map(goal => goal.id === id ? updated : goal))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal')
      console.error('Error updating goal:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProgress = useCallback(async (id: number, amount: string): Promise<Goal | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateGoalProgress(id, amount)
      setGoals(prev => prev.map(goal => goal.id === id ? updated : goal))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
      console.error('Error updating progress:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const markComplete = useCallback(async (id: number): Promise<Goal | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await completeGoal(id)
      setGoals(prev => prev.map(goal => goal.id === id ? updated : goal))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete goal')
      console.error('Error completing goal:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const markCancelled = useCallback(async (id: number): Promise<Goal | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await cancelGoal(id)
      setGoals(prev => prev.map(goal => goal.id === id ? updated : goal))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel goal')
      console.error('Error cancelling goal:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeGoal = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteGoal(id)
      setGoals(prev => prev.filter(goal => goal.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal')
      console.error('Error deleting goal:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    editGoal,
    updateProgress,
    markComplete,
    markCancelled,
    removeGoal,
  }
}

