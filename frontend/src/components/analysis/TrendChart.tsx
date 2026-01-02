/**
 * TrendChart - Combined bar chart with budget reference line for trends analysis
 */

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { MonthlyTrendData } from '../../types/models'
import { formatCurrency } from '../../utils/formatters'

interface TrendChartProps {
  data: MonthlyTrendData[]
  budgetReference: number | null
  categoryName: string
}

/**
 * Format data for chart with proper colors and labels
 */
function prepareChartData(data: MonthlyTrendData[]) {
  return data.map((item) => {
    let color = '#6B7280' // gray-500 (stable)
    
    if (item.vs_previous === 'increase') {
      color = '#EF4444' // red-500
    } else if (item.vs_previous === 'decrease') {
      color = '#10B981' // green-500
    }
    
    // Convert month string from "2024-11" to "Nov 2024"
    const [year, month] = item.month.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    const displayMonth = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    
    return {
      ...item,
      fill: color,
      displayMonth,
    }
  })
}

export function TrendChart({ data, budgetReference, categoryName }: TrendChartProps): JSX.Element {
  const chartData = useMemo(() => prepareChartData(data), [data])

  // Calculate Y-axis domain to always show budget reference line
  const yAxisDomain = useMemo(() => {
    if (data.length === 0) return [0, 100]
    
    const maxSpending = Math.max(...data.map(item => item.amount))
    const maxValue = budgetReference !== null 
      ? Math.max(maxSpending, budgetReference)
      : maxSpending
    
    // Add 10% margin to the top
    const upperLimit = Math.ceil(maxValue * 1.1)
    
    return [0, upperLimit]
  }, [data, budgetReference])

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center py-16">
          <div className="text-cyan-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No hay datos de gastos para este período
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Gastos por Mes - {categoryName}
        </h3>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="displayMonth"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={yAxisDomain}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Mes: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            
            {/* Bar chart for spending */}
            <Bar
              dataKey="amount"
              name="Gastos"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
            
            {/* Reference line for budget */}
            {budgetReference !== null && (
              <ReferenceLine
                y={budgetReference}
                stroke="#06B6D4"
                strokeDasharray="5 5"
                label={{
                  value: 'Presupuesto',
                  position: 'right',
                  offset: 10,
                  fill: '#06B6D4',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

