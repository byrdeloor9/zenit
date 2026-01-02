/**
 * MiniProjectionChart - Small 3-month projection chart widget redesigned with Tailwind CSS
 */

import React from 'react'
import { ShowChart, TrendingUp, TrendingDown } from '@mui/icons-material'
import { Card } from '../ui/Card'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

interface ProjectionData {
  month: string
  balance: number
}

interface MiniProjectionChartProps {
  data?: ProjectionData[]
  finalBalance?: number
}

export function MiniProjectionChart({
  data = [],
  finalBalance = 0,
}: MiniProjectionChartProps): JSX.Element {
  if (data.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
            <ShowChart className="text-cyan-600 dark:text-cyan-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proyección 3M</h3>
        </div>
        <div className="text-center py-8 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
          <div className="text-cyan-400 text-4xl mb-3">📊</div>
          <p className="text-cyan-700 dark:text-cyan-400 font-medium">Sin datos de proyección</p>
          <p className="text-cyan-600 dark:text-cyan-500 text-sm mt-1">Agrega más transacciones para ver proyecciones</p>
        </div>
      </Card>
    )
  }

  const isPositive = finalBalance >= 0
  const trendIcon = isPositive ? TrendingUp : TrendingDown
  const trendColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  const bgColor = isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
  const borderColor = isPositive ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
          <ShowChart className="text-cyan-600 dark:text-cyan-400 text-lg" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proyección 3M</h3>
      </div>

      {/* Chart */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="balance"
              stroke={isPositive ? '#10B981' : '#F43F5E'}
              strokeWidth={2}
              dot={{ fill: isPositive ? '#10B981' : '#F43F5E', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: isPositive ? '#10B981' : '#F43F5E', strokeWidth: 2 }}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value.toString()), 'Balance']}
              labelFormatter={(label) => `Mes: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {React.createElement(trendIcon, { className: `text-sm ${trendColor}` })}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance proyectado</span>
          </div>
          <span className={`font-bold ${trendColor}`}>
            {formatCurrency(finalBalance.toString())}
          </span>
        </div>
      </div>
    </Card>
  )
}