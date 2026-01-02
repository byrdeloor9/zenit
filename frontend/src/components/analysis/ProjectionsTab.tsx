/**
 * ProjectionsTab - Financial projections with improved visualizations (migrated to Tailwind CSS)
 */

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from '@mui/icons-material'
import { useRecurringTransactions } from '../../hooks'
import { formatCurrency } from '../../utils/formatters'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { IncomeProjection } from '../../types'

type PeriodOption = 3 | 6 | 12 | 24

export function ProjectionsTab(): JSX.Element {
  const { projections, loading, isInitialLoading, error, fetchProjections } = useRecurringTransactions()
  const [selectedMonths, setSelectedMonths] = useState<PeriodOption>(12)

  useEffect(() => {
    fetchProjections(selectedMonths)
  }, [fetchProjections, selectedMonths])

  const handlePeriodChange = (months: PeriodOption): void => {
    setSelectedMonths(months)
  }

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (error) {
    return <Alert type="error" message={error} />
  }

  if (!projections || projections.projections.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No hay datos de proyecciones disponibles
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Crea transacciones recurrentes para ver proyecciones financieras
        </p>
      </Card>
    )
  }

  const { projections: projectionsData, total_monthly_income, total_monthly_expenses, average_net_balance } = projections

  // Check for negative balances
  const negativeMonths = projectionsData.filter((p: IncomeProjection) => p.net_balance < 0)
  const hasNegativeBalance = negativeMonths.length > 0
  const finalBalance = projectionsData[projectionsData.length - 1]?.cumulative_balance || 0
  const savingsRate = total_monthly_income > 0 ? ((average_net_balance / total_monthly_income) * 100) : 0
  const positiveMonths = projectionsData.filter((p: IncomeProjection) => p.net_balance >= 0).length

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Proyecciones Financieras
          </h2>
          <div className="flex gap-2">
            {([3, 6, 12, 24] as PeriodOption[]).map((months) => (
              <Button
                key={months}
                variant={selectedMonths === months ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handlePeriodChange(months)}
                disabled={loading}
              >
                {loading && selectedMonths === months ? (
                  <span className="inline-block animate-spin mr-2">⟳</span>
                ) : null}
                {months}M
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ingresos Mensuales</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(total_monthly_income.toString())}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gastos Mensuales</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(total_monthly_expenses.toString())}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <AccountBalance className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance Promedio</p>
              <p className={`text-lg font-bold ${average_net_balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(average_net_balance.toString())}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">💰</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasa de Ahorro</p>
              <p className={`text-lg font-bold ${savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {hasNegativeBalance && (
        <Alert type="warning" message={`⚠️ Tienes ${negativeMonths.length} meses con balance negativo`} />
      )}

      {finalBalance < 0 && (
        <Alert type="error" message={`🚨 El balance final será negativo: ${formatCurrency(finalBalance.toString())}`} />
      )}

      {/* Projections Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Mes</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Ingresos</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Gastos</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Balance Neto</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Balance Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {projectionsData.map((projection: IncomeProjection, index: number) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {new Date(projection.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">
                    {formatCurrency((projection.projected_income || 0).toString())}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 font-medium">
                    {formatCurrency((projection.projected_expenses || 0).toString())}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${(projection.net_balance || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency((projection.net_balance || 0).toString())}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${(projection.cumulative_balance || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency((projection.cumulative_balance || 0).toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Meses Positivos</h4>
            <p className="text-blue-700 dark:text-blue-300">
              {positiveMonths} de {projectionsData.length} meses tendrán balance positivo
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Balance Final</h4>
            <p className={`font-medium ${finalBalance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {formatCurrency(finalBalance.toString())}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}