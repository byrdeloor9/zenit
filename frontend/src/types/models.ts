/**
 * Domain models - Data structures from the API
 */

export interface Transaction {
  id: number
  user_id: number
  account_id: number
  account_name: string
  category_id: number | null
  category_name: string
  category_icon: string | null
  type: 'Income' | 'Expense'
  amount: string
  description: string | null
  transaction_date: string
  created_at: string
}

export interface Account {
  id: number
  user: number
  name: string
  type: 'bank' | 'cash' | 'card' | 'investment'
  balance: string
  currency: string
  color: string
  committed_to_goals: number
  available_balance: number
  created_at: string
}

export interface AccountFormData {
  name: string
  type: 'bank' | 'cash' | 'card' | 'investment'
  balance: string
  currency: string
  color: string
}

export interface Category {
  id: number
  user_id: number | null
  name: string
  type: 'Income' | 'Expense'
  icon: string | null
}

export interface Goal {
  id: number
  user_id: number
  account_id: number | null
  account_name: string | null
  name: string
  target_amount: string
  current_amount: string
  deadline: string | null
  status: 'In Progress' | 'Completed' | 'Cancelled'
  progress_percentage: number
  created_at: string
}

export interface Investment {
  id: number
  user: number
  investment_type: 'goal' | 'insurance'
  name: string
  account: number | null
  account_name: string | null
  initial_amount: string
  current_amount: string
  target_amount: string | null
  policy_number: string | null
  institution_name: string | null
  expected_return_rate: string | null
  maturity_term_months: number | null
  maturity_date: string | null
  start_date: string
  deadline: string | null
  status: 'active' | 'completed' | 'matured' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  last_return_date: string | null
  progress_percentage: number
  projected_return: number
  projected_final_value: number
  movements_count: number
}

export interface InvestmentTransaction {
  id: number
  investment: number
  investment_name: string
  transaction_type: 'contribution' | 'withdrawal' | 'return' | 'maturity'
  amount: string
  transaction_date: string
  account: number
  account_name: string
  notes: string | null
  account_transaction: number | null
  created_at: string
}

export interface Budget {
  id: number
  user_id: number
  category_id: number
  category_name: string
  category_icon: string | null
  amount: string
  period_start: string
  period_end: string | null  // Nullable for indefinite budgets
  is_recurring: boolean
  status: 'Active' | 'Paused' | 'Archived'
  created_at: string
  updated_at: string
  spent?: number  // Calculated field
  remaining?: number  // Calculated field
  percentage?: number  // Calculated field
  days_left: number | null  // Null if indefinite
  history_count: number
  is_indefinite: boolean
}

export interface BudgetHistory {
  id: number
  budget: number
  previous_amount: string
  new_amount: string
  previous_period_end: string | null
  new_period_end: string | null
  change_reason: string | null
  changed_at: string
  changed_by_username: string | null
}

export interface GoalsSummary {
  in_progress: number
  completed: number
}

export interface Debt {
  id: number
  user_id: number
  creditor_name: string
  principal_amount: string
  interest_rate: string
  interest_type: 'simple' | 'amortized'
  term_months: number
  monthly_payment: string
  amount_paid: string
  start_date: string
  status: 'Active' | 'Paid' | 'Cancelled'
  notes: string | null
  created_at: string
  total_interest: number
  total_amount: number
  remaining_balance: number
  payment_progress: number
  payments_count: number
}

export interface DebtPayment {
  id: number
  debt: number
  debt_creditor: string
  account: number | null
  account_id: number | null
  account_name: string | null
  amount: string
  payment_date: string
  notes: string | null
  transaction: number | null
  created_at: string
}

export interface RecurringTransaction {
  id: number
  user: number
  name: string
  transaction_type: 'Income' | 'Expense'
  amount: string
  frequency: 'monthly' | 'biweekly' | 'weekly'
  day_of_period: number
  account: number
  account_name: string
  category: number | null
  category_name: string | null
  start_date: string
  end_date: string | null
  is_active: boolean
  notes: string | null
  last_generated_date: string | null
  next_occurrence: string
  total_generated: number
  created_at: string
}

export interface IncomeProjection {
  month: string
  month_name: string
  projected_income: number
  projected_expenses: number
  net_balance: number
  cumulative_balance: number
}

export interface MonthlyTrendData {
  month: string
  amount: number
  change_percentage: number | null
  vs_previous: 'increase' | 'decrease' | 'stable'
}

export interface CategoryTrend {
  category_id: number
  category_name: string
  category_icon: string | null
  period_months: number
  monthly_data: MonthlyTrendData[]
  budget_reference: number | null
  average_spending: number
  total_spending: number
}

export interface CategoryOverview {
  id: number
  name: string
  icon: string | null
  type: string
}


