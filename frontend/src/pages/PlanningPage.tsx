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

const TAB_VALUES = ['budgets', 'investments', 'recurring-transactions', 'debts']

const TABS = [
  { value: 'budgets', label: 'Presupuestos', emoji: '💰', shortLabel: 'Presupu.' },
  { value: 'investments', label: 'Metas e Inversiones', emoji: '🎯', shortLabel: 'Metas' },
  { value: 'recurring-transactions', label: 'Recurrentes', emoji: '🔄', shortLabel: 'Recurren.' },
  { value: 'debts', label: 'Deudas', emoji: '💳', shortLabel: 'Deudas' },
]

export function PlanningPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'budgets'
  const [tabValue, setTabValue] = useState(TAB_MAP[tabParam] || 0)

  useEffect(() => {
    const newTabValue = TAB_MAP[tabParam] || 0
    setTabValue(newTabValue)
  }, [tabParam])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
    setSearchParams({ tab: TAB_VALUES[newValue] })
  }

  return (
    <div className="space-y-6">
      {/* Header con título y badge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
              📋
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Planificación
            </h1>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Gestión estratégica
          </span>
        </div>
        
        {/* Tabs Navigation - Tailwind (Responsive) */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {TABS.map((tab, index) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(null as any, index)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  tabValue === index
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="text-2xl sm:text-xl">{tab.emoji}</span>
                <span className="text-xs sm:text-sm sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
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