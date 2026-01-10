/**
 * API-related types - Request/Response structures
 */

import { Transaction, GoalsSummary } from './models'

export interface DashboardBudget {
  id: number
  category_name: string
  amount: string
  spent: string
  percentage: number
}

export interface DashboardGoal {
  id: number
  name: string
  target_amount: string
  current_amount: string
  progress_percentage: number
}

export interface DashboardPayment {
  id: number
  debt_name: string
  next_payment_date: string
  payment_amount: string
  days_until_due: number
}

export interface DashboardProjectionPoint {
  month: string
  balance: number
}

export interface DashboardStats {
  total_balance: string
  total_income: string
  total_expenses: string
  accounts_count: number
  recent_transactions: Transaction[]
  goals_summary: GoalsSummary
  budget_status: DashboardBudget[]
  top_goals: DashboardGoal[]
  upcoming_payments: DashboardPayment[]
  mini_projection: DashboardProjectionPoint[]
  projection_final_balance: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}


