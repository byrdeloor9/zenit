/**
 * Goals API endpoints
 */

import apiClient from '../client'
import type { Goal } from '../../types'

export interface GoalFormData {
  name: string
  account: number | null
  target_amount: string
  current_amount: string
  deadline: string | null
}

export const getGoals = async (): Promise<Goal[]> => {
  const response = await apiClient.get<Goal[]>('/goals/')
  return response.data
}

export const createGoal = async (data: GoalFormData): Promise<Goal> => {
  // User is automatically assigned by backend from JWT token
  const payload = {
    ...data,
    status: 'In Progress',
  }
  const response = await apiClient.post<Goal>('/goals/', payload)
  return response.data
}

export const updateGoal = async (id: number, data: Partial<GoalFormData>): Promise<Goal> => {
  const response = await apiClient.patch<Goal>(`/goals/${id}/`, data)
  return response.data
}

export const updateGoalProgress = async (id: number, amount: string): Promise<Goal> => {
  const response = await apiClient.patch<Goal>(`/goals/${id}/`, { current_amount: amount })
  return response.data
}

export const completeGoal = async (id: number): Promise<Goal> => {
  const response = await apiClient.patch<Goal>(`/goals/${id}/`, { status: 'Completed' })
  return response.data
}

export const cancelGoal = async (id: number): Promise<Goal> => {
  const response = await apiClient.patch<Goal>(`/goals/${id}/`, { status: 'Cancelled' })
  return response.data
}

export const deleteGoal = async (id: number): Promise<void> => {
  await apiClient.delete(`/goals/${id}/`)
}

