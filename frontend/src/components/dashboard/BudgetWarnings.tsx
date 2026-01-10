/**
 * BudgetWarnings - Display critical budgets (>80% used) redesigned with Tailwind CSS
 */

import { Warning, AccountBalanceWallet } from '@mui/icons-material'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../utils/formatters'

interface Budget {
  id: number
  category_name: string
  amount: string
  spent: string
  percentage: number
}

interface BudgetWarningsProps {
  budgets?: Budget[]
}

export function BudgetWarnings({ budgets = [] }: BudgetWarningsProps): JSX.Element {
  // Filter budgets that are above 80% used
  const criticalBudgets = budgets.filter((b) => b.percentage >= 80).slice(0, 5)

  if (criticalBudgets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <AccountBalanceWallet className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Presupuestos</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-8 border border-emerald-100/50 dark:border-emerald-800/30">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transform rotate-3 hover:rotate-6 transition-transform">
            <span className="text-white text-3xl font-bold">✓</span>
          </div>
          <p className="text-emerald-800 dark:text-emerald-300 font-bold text-lg mb-1">¡Todo bajo control!</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm">No hay presupuestos críticos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
            <Warning className="text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Presupuestos</h3>
        </div>
        <Badge variant="warning" size="sm" className="bg-rose-100 text-rose-700 border-rose-200">
          {criticalBudgets.length} Críticos
        </Badge>
      </div>

      <div className="space-y-5">
        {criticalBudgets.map((budget) => (
          <div key={budget.id}>
            <div className="flex justify-between items-end mb-2">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{budget.category_name}</span>
              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">{budget.percentage.toFixed(0)}%</span>
            </div>

            <ProgressBar
              value={budget.percentage}
              max={100}
              color="red"
              showPercentage={false}
              className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700"
            />

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
              <span>{formatCurrency(budget.spent)}</span>
              <span>de {formatCurrency(budget.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}