/**
 * TrendStats - Statistics cards for trends analysis
 */

import { TrendingUp, TrendingDown, Remove, Money, Calculate, Percent } from '@mui/icons-material'
import { useMemo } from 'react'
import type { CategoryTrend } from '../../types/models'
import { formatCurrency, formatPercentage } from '../../utils/formatters'

interface TrendStatsProps {
  trends: CategoryTrend | null
}

/**
 * Calculate change percentage vs previous month
 */
function calculateMonthOverMonthChange(trends: CategoryTrend): number | null {
  if (!trends.monthly_data || trends.monthly_data.length < 2) {
    return null
  }

  const lastIndex = trends.monthly_data.length - 1
  const changePercentage = trends.monthly_data[lastIndex].change_percentage
  
  return changePercentage
}

/**
 * Calculate percentage vs budget
 */
function calculateVsBudget(trends: CategoryTrend): number | null {
  if (!trends.budget_reference || trends.budget_reference === 0) {
    return null
  }

  const lastMonthAmount = trends.monthly_data[trends.monthly_data.length - 1]?.amount || 0
  const percentage = (lastMonthAmount / trends.budget_reference) * 100
  
  return percentage
}

export function TrendStats({ trends }: TrendStatsProps): JSX.Element | null {
  const monthOverMonthChange = useMemo(() => {
    if (!trends) return null
    return calculateMonthOverMonthChange(trends)
  }, [trends])

  const vsBudgetPercentage = useMemo(() => {
    if (!trends) return null
    return calculateVsBudget(trends)
  }, [trends])

  if (!trends) {
    return null
  }

  // Determine icon and color for month-over-month change
  let changeIcon = Remove
  let changeColor = 'text-gray-500'
  let changeLabel = 'Estable'
  
  if (monthOverMonthChange !== null) {
    if (monthOverMonthChange > 1) {
      changeIcon = TrendingUp
      changeColor = 'text-red-500'
      changeLabel = `↑ ${formatPercentage(Math.abs(monthOverMonthChange))}`
    } else if (monthOverMonthChange < -1) {
      changeIcon = TrendingDown
      changeColor = 'text-green-500'
      changeLabel = `↓ ${formatPercentage(Math.abs(monthOverMonthChange))}`
    }
  }

  // Determine color for vs budget
  let vsBudgetColor = 'text-gray-600 dark:text-gray-400'
  if (vsBudgetPercentage !== null) {
    if (vsBudgetPercentage > 100) {
      vsBudgetColor = 'text-red-600'
    } else if (vsBudgetPercentage > 80) {
      vsBudgetColor = 'text-yellow-600'
    } else {
      vsBudgetColor = 'text-green-600'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Spending */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Money className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
              Total Gastado
            </span>
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(trends.total_spending)}
        </p>
      </div>

      {/* Average Spending */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calculate className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
              Promedio Mensual
            </span>
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(trends.average_spending)}
        </p>
      </div>

      {/* Month-over-Month Change */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {changeIcon === TrendingUp && <TrendingUp className={changeColor} />}
            {changeIcon === TrendingDown && <TrendingDown className={changeColor} />}
            {changeIcon === Remove && <Remove className={changeColor} />}
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
              Cambio Mensual
            </span>
          </div>
        </div>
        <p className={`text-2xl font-bold ${changeColor}`}>
          {monthOverMonthChange !== null ? changeLabel : 'N/A'}
        </p>
      </div>

      {/* Vs Budget */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Percent className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
              vs Presupuesto
            </span>
          </div>
        </div>
        <p className={`text-2xl font-bold ${vsBudgetColor}`}>
          {vsBudgetPercentage !== null ? formatPercentage(vsBudgetPercentage) : 'Sin presupuesto'}
        </p>
      </div>
    </div>
  )
}

