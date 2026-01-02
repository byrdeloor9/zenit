/**
 * DebtProgress component - Visual progress bar for debt payment (migrated to Tailwind CSS)
 */

import { CheckCircle, Warning, TrendingDown } from '@mui/icons-material'

interface DebtProgressProps {
  paid: number
  total: number
  percentage: number
  monthlyPayment: number
}

export function DebtProgress({ paid, total, percentage, monthlyPayment }: DebtProgressProps): JSX.Element {
  const remaining = total - paid
  const paymentsRemaining = Math.ceil(remaining / monthlyPayment)

  const getColorClasses = (): { bg: string; text: string; icon: string } => {
    if (percentage >= 100) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500 dark:text-green-400' }
    if (percentage >= 75) return { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500 dark:text-purple-400' }
    if (percentage >= 50) return { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500 dark:text-blue-400' }
    return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500 dark:text-red-400' }
  }

  const getIcon = (): JSX.Element => {
    if (percentage >= 100) return <CheckCircle className="text-lg" />
    if (percentage >= 75) return <TrendingDown className="text-lg" />
    return <Warning className="text-lg" />
  }

  const colorClasses = getColorClasses()
  const isPaid = percentage >= 100

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          Progreso de Pago
        </span>
        <div className="flex items-center gap-1">
          {getIcon()}
          <span className={`text-sm font-bold ${colorClasses.text}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${colorClasses.bg}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-300">
          ${paid.toFixed(2)} / ${total.toFixed(2)}
        </span>
        {!isPaid && (
          <span className={`text-xs font-semibold ${colorClasses.text}`}>
            Faltan {paymentsRemaining} cuotas (${remaining.toFixed(2)})
          </span>
        )}
        {isPaid && (
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
            ¡Deuda Pagada! 🎉
          </span>
        )}
      </div>
    </div>
  )
}