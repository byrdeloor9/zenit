/**
 * Planning Page - Consolidated page with tabs for Budgets, Goals, Recurring Incomes, Debts (migrated to Tailwind CSS)
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BudgetList } from '../components/budgets/BudgetList'
import { InvestmentList } from '../components/investments/InvestmentList'
import { RecurringTransactionList } from '../components/recurring-transactions/RecurringTransactionList'
import { DebtList } from '../components/debts/DebtList'

const TAB_MAP: Record<string, number> = {
  budgets: 0,
  investments: 1,
  goals: 1, // Legacy support - redirect to investments
  'recurring-transactions': 2,
  'recurring-incomes': 2, // Legacy support
  debts: 3,
}

export function PlanningPage(): JSX.Element {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'budgets'
  const [tabValue, setTabValue] = useState(TAB_MAP[tabParam] || 0)

  useEffect(() => {
    const newTabValue = TAB_MAP[tabParam] || 0
    setTabValue(newTabValue)
  }, [tabParam])

  return (
    <div>
      {/* Tab Content */}
      <div>
        {tabValue === 0 && <BudgetList />}
        {tabValue === 1 && <InvestmentList />}
        {tabValue === 2 && <RecurringTransactionList />}
        {tabValue === 3 && <DebtList />}
      </div>
    </div>
  )
}