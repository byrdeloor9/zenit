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
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <AccountBalanceWallet className="text-green-600 dark:text-green-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Presupuestos</h3>
        </div>
        <div className="text-center py-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-green-400 text-4xl mb-3">✅</div>
          <p className="text-green-700 dark:text-green-400 font-medium">¡Todo bajo control!</p>
          <p className="text-green-600 dark:text-green-500 text-sm mt-1">No hay presupuestos críticos</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
          <Warning className="text-orange-600 dark:text-orange-400 text-lg" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Presupuestos Críticos</h3>
        <Badge variant="warning" size="sm">
          {criticalBudgets.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {criticalBudgets.map((budget) => (
          <div key={budget.id} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">{budget.category_name}</h4>
              <Badge
                variant={budget.percentage >= 100 ? 'error' : 'warning'}
                size="sm"
              >
                {budget.percentage.toFixed(0)}%
              </Badge>
            </div>

            <ProgressBar
              value={budget.percentage}
              max={100}
              color={budget.percentage >= 100 ? 'red' : 'orange'}
              showPercentage={false}
            />

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>Gastado: {formatCurrency(budget.spent)}</span>
              <span>Presupuesto: {formatCurrency(budget.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}