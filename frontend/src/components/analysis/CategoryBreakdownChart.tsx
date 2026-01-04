/**
 * CategoryBreakdownChart - Pie chart showing spending distribution by category
 */

import { useState, useEffect } from 'react'
import { getCategoryDistribution } from '../../api/endpoints/trends'
import { formatCurrency } from '../../utils/formatters'
import type { CategoryDistribution } from '../../types/models'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts'

const COLORS = [
    '#06B6D4', // cyan
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#10B981', // emerald
    '#EF4444', // red
    '#3B82F6', // blue
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
]

export function CategoryBreakdownChart(): JSX.Element {
    const [data, setData] = useState<CategoryDistribution | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [period, setPeriod] = useState<'month' | 'custom'>('month')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                // Default to current month
                const result = await getCategoryDistribution()
                setData(result)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading data')
                console.error('Error fetching category distribution:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [period])

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando distribución...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error al cargar datos</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
            </div>
        )
    }

    if (!data || data.distribution.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Sin datos de gastos
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                    No hay gastos registrados en este período
                </p>
            </div>
        )
    }

    // Transform data for pie chart
    const chartData = data.distribution.map((item, index) => ({
        name: item.category_name,
        value: item.amount,
        percentage: item.percentage,
        color: COLORS[index % COLORS.length],
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-sm">{formatCurrency(payload[0].value.toString())}</p>
                    <p className="text-xs text-gray-300">{payload[0].payload.percentage.toFixed(1)}%</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Distribución por Categoría
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {formatCurrency(data.total_expenses.toString())}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percentage }) => `${percentage.toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend with amounts */}
                <div className="space-y-2">
                    {data.distribution.slice(0, 10).map((item, index) => (
                        <div
                            key={item.category_id}
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{item.category_icon}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {item.category_name}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(item.amount.toString())}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.percentage.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
