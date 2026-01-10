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
  const isPositive = finalBalance >= 0
  const trendIcon = isPositive ? TrendingUp : TrendingDown
  const trendColor = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
  const bgColor = isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'
  // const borderColor = isPositive ? 'border-emerald-200 dark:border-emerald-800' : 'border-rose-200 dark:border-rose-800'

  // Mock data to ensure chart renders if empty (or handle empty state gracefully)
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', balance: 0 },
    { month: 'Feb', balance: 0 },
    { month: 'Mar', balance: 0 },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
          <ShowChart className="text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Proyección 3M</h3>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[160px] mb-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value.toString()), 'Balance']}
              labelFormatter={(label) => `Mes: ${label}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 3, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Box */}
      <div className={`p-4 rounded-xl ${bgColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {React.createElement(trendIcon, { className: `text-lg ${trendColor}` })}
          <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Balance proyectado</span>
        </div>
        <span className={`font-bold text-lg ${trendColor}`}>
          {formatCurrency(finalBalance.toString())}
        </span>
      </div>
    </div>
  )
}