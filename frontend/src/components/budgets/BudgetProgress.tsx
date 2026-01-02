/**
 * BudgetProgress component - Visual progress bar for budget (migrated to Tailwind CSS)
 */

import { Warning, CheckCircle, Error as ErrorIcon } from '@mui/icons-material'
import { Alert } from '../ui/Alert'

interface BudgetProgressProps {
  spent: number
  total: number
  percentage: number
}

export function BudgetProgress({ spent, total, percentage }: BudgetProgressProps): JSX.Element {
  // Defensive checks for undefined values
  const safeSpent = spent ?? 0
  const safeTotal = total ?? 0
  const safePercentage = percentage ?? 0

  const getColorClasses = (): { bg: string; text: string; icon: string } => {
    if (safePercentage < 80) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500 dark:text-green-400' }
    if (safePercentage < 100) return { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-500 dark:text-amber-400' }
    return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500 dark:text-red-400' }
  }

  const getIcon = (): JSX.Element => {
    if (safePercentage < 80) return <CheckCircle className="text-lg" />
    if (safePercentage < 100) return <Warning className="text-lg" />
    return <ErrorIcon className="text-lg" />
  }

  const getStatus = (): string => {
    if (safePercentage < 80) return 'Seguro'
    if (safePercentage < 100) return 'Precaución'
    return 'Excedido'
  }

  const colorClasses = getColorClasses()

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          ${safeSpent.toFixed(2)} / ${safeTotal.toFixed(2)}
        </span>
        <div className="flex items-center gap-1">
          {getIcon()}
          <span className={`text-sm font-bold ${colorClasses.text}`}>
            {safePercentage.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${colorClasses.bg}`}
          style={{ width: `${Math.min(safePercentage, 100)}%` }}
        />
      </div>

      <div className="mt-2">
        {safePercentage >= 100 ? (
          <Alert type="error" message={`¡Presupuesto excedido por $${(safeSpent - safeTotal).toFixed(2)}!`} />
        ) : safePercentage >= 80 ? (
          <Alert type="warning" message={`Quedan $${(safeTotal - safeSpent).toFixed(2)} (${(100 - safePercentage).toFixed(0)}%)`} />
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-300">
            Estado: {getStatus()} • Disponible: ${(safeTotal - safeSpent).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  )
}