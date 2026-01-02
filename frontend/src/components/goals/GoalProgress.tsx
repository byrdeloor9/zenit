/**
 * GoalProgress component - Visual progress bar for goal (migrated to Tailwind CSS)
 */

import { CheckCircle, TrendingUp } from '@mui/icons-material'

interface GoalProgressProps {
  current: number
  target: number
  percentage: number
}

export function GoalProgress({ current, target, percentage }: GoalProgressProps): JSX.Element {
  const getColorClasses = (): { bg: string; text: string; icon: string } => {
    if (percentage >= 100) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500 dark:text-green-400' }
    if (percentage >= 75) return { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500 dark:text-purple-400' }
    if (percentage >= 50) return { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500 dark:text-blue-400' }
    return { bg: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400', icon: 'text-slate-500 dark:text-slate-400' }
  }

  const colorClasses = getColorClasses()
  const isComplete = percentage >= 100

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          Progreso
        </span>
        <div className="flex items-center gap-1">
          {isComplete ? (
            <CheckCircle className={`text-lg ${colorClasses.icon}`} />
          ) : (
            <TrendingUp className={`text-lg ${colorClasses.icon}`} />
          )}
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
          ${current.toFixed(2)} / ${target.toFixed(2)}
        </span>
        <span className={`text-xs font-semibold ${colorClasses.text}`}>
          {isComplete ? '¡Meta Alcanzada!' : `Faltan $${(target - current).toFixed(2)}`}
        </span>
      </div>
    </div>
  )
}