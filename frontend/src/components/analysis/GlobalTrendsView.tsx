/**
 * GlobalTrendsView - Shows overall income vs expenses trends
 */

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { getGlobalTrends } from '../../api/endpoints/trends'
import { formatCurrency } from '../../utils/formatters'
import type { GlobalTrends } from '../../types/models'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

const PERIOD_OPTIONS = [
    { value: 3, label: '3 Meses' },
    { value: 6, label: '6 Meses' },
    { value: 12, label: '12 Meses' },
    { value: 24, label: '24 Meses' },
]

function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
}

export function GlobalTrendsView(): JSX.Element {
    const [selectedMonths, setSelectedMonths] = useState<number>(12)
    const [data, setData] = useState<GlobalTrends | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const result = await getGlobalTrends(selectedMonths)
                setData(result)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading data')
                console.error('Error fetching global trends:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedMonths])

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando tendencias globales...</p>
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

    if (!data) return null

    // Transform data for chart
    const chartData = data.monthly_data.map((item) => ({
        month: formatMonthLabel(item.month),
        Ingresos: item.income,
        Gastos: item.expenses,
        Neto: item.net,
    }))

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Tendencias Globales
                    </h2>
                    <div className="flex gap-2">
                        {PERIOD_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedMonths(option.value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedMonths === option.value
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <TrendingUp className="text-green-600 dark:text-green-400 text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ingresos Totales</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(data.total_income.toString())}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Promedio: {formatCurrency(data.average_monthly_income.toString())}/mes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <TrendingDown className="text-red-600 dark:text-red-400 text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gastos Totales</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(data.total_expenses.toString())}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Promedio: {formatCurrency(data.average_monthly_expenses.toString())}/mes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${data.net_balance >= 0
                                ? 'bg-blue-100 dark:bg-blue-900/20'
                                : 'bg-orange-100 dark:bg-orange-900/20'
                            }`}>
                            <span className="text-2xl">
                                {data.net_balance >= 0 ? '💰' : '⚠️'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance Neto</p>
                            <p className={`text-xl font-bold ${data.net_balance >= 0
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                {formatCurrency(data.net_balance.toString())}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Ingresos vs Gastos
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis
                            dataKey="month"
                            stroke="#6B7280"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#6B7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F9FAFB',
                            }}
                            formatter={(value: number) => formatCurrency(value.toString())}
                        />
                        <Legend />
                        <Bar dataKey="Ingresos" fill="#10B981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Gastos" fill="#EF4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
