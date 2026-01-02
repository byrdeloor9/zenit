/**
 * ProjectionsPanel - Display financial projections (now includes recurring expenses) (migrated to Tailwind CSS)
 */

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from '@mui/icons-material'
import { useRecurringTransactions } from '../../hooks'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'

export function ProjectionsPanel(): JSX.Element {
  const { projections, isInitialLoading, error, fetchProjections } = useRecurringTransactions()
  const [selectedMonths] = useState(12)

  useEffect(() => {
    fetchProjections(selectedMonths)
  }, [fetchProjections, selectedMonths])

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (error) {
    return <Alert type="error" message={error} />
  }

  if (!projections || projections.projections.length === 0) {
    return (
      <Alert type="info" message="No hay datos de proyecciones disponibles. Crea transacciones recurrentes para ver proyecciones financieras." />
    )
  }

  const { projections: projectionsData, total_monthly_income, total_monthly_expenses, average_net_balance } = projections

  // Check for negative balances
  const negativeMonths = projectionsData.filter((p: any) => p.net_balance < 0)
  const hasNegativeBalance = negativeMonths.length > 0
  const finalBalance = projectionsData[projectionsData.length - 1]?.cumulative_balance || 0
  const savingsRate = total_monthly_income > 0 ? ((average_net_balance / total_monthly_income) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ingresos Mensuales</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ${total_monthly_income.toLocaleString()}
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
                ${total_monthly_expenses.toLocaleString()}
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
                ${average_net_balance.toLocaleString()}
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
        <Alert type="error" message={`🚨 El balance final será negativo: $${finalBalance.toLocaleString()}`} />
      )}

      {/* Projections Table */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Proyecciones de {selectedMonths} Meses
          </h3>
        </div>
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
              {projectionsData.map((projection: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {new Date(projection.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">
                    ${projection.income.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 font-medium">
                    ${projection.expenses.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${projection.net_balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${projection.net_balance.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${projection.cumulative_balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${projection.cumulative_balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Tasa de Ahorro</h4>
              <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Balance Final</h4>
              <p className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${finalBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}