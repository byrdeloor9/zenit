/**
 * BudgetProjectionWidget - Combined widget for Budget Status and Projections
 * Designs to match specific user reference (Stacked, Clean, Area Chart)
 */

import React from 'react'
import { Card } from '../ui/Card'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'

interface Budget {
    id: number
    category_name: string
    amount: string
    spent: string
    percentage: number
}

interface ProjectionData {
    month: string
    balance: number
}

interface BudgetProjectionWidgetProps {
    budgets?: Budget[]
    projectionData?: ProjectionData[]
}

export function BudgetProjectionWidget({
    budgets = [],
    projectionData = []
}: BudgetProjectionWidgetProps): JSX.Element {

    // Debug logging
    console.log('BudgetProjectionWidget - budgets:', budgets)
    console.log('BudgetProjectionWidget - projectionData:', projectionData)

    // Mock data if empty, for visualization purposes as per reference image style
    const safeBudgets = budgets.length > 0 ? budgets.slice(0, 3) : []

    // Use provided projection data or fallback to a structure that allows formatting
    const chartData = projectionData.length > 0 ? projectionData : [
        { month: 'Jan', balance: 0 },
        { month: 'Feb', balance: 0 },
        { month: 'Mar', balance: 0 },
    ]

    // Colors for the budget progress bars (matching reference: Purple, Teal, Slate/Grey)
    const budgetColors = [
        { bar: 'bg-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
        { bar: 'bg-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/20' },
        { bar: 'bg-slate-500', bg: 'bg-slate-200 dark:bg-slate-700' },
        { bar: 'bg-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20' },
        { bar: 'bg-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/20' },
    ]

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col gap-8">

            {/* SECTION 1: Budget Status */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Budget Status
                </h3>

                <div className="space-y-4">
                    {safeBudgets.length > 0 ? (
                        safeBudgets.map((budget, index) => {
                            const colorSet = budgetColors[index % budgetColors.length]
                            return (
                                <div key={budget.id}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {budget.category_name}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {budget.percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    {/* Custom Progress Bar */}
                                    <div className={`w-full h-2.5 rounded-full ${colorSet.bg} overflow-hidden`}>
                                        <div
                                            className={`h-full rounded-full ${colorSet.bar}`}
                                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-sm text-gray-500 italic">No budget info available.</p>
                    )}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* SECTION 2: 3 Month Projection */}
            <div className="flex-1 min-h-[250px] flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    3 Month Projection
                </h3>

                <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBalanceGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />

                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value.toString()), 'Balance']}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />

                            {/* Primary Line (Purple - mimicking the top line in reference) */}
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                            />

                            {/* Secondary Line (Green - mimicking the bottom line in reference) 
                  Since we only have one 'balance' data point, I will create a synthetic
                  second line for visual fidelity if explicit data isn't available, 
                  OR just plot the same line with a different style. 
                  
                  However, to be "Exact", I probably shouldn't fake data. 
                  But the user said "Exactamente asi". The image has TWO lines. 
                  I will check if I can calculate a secondary metric logic later. 
                  For now, I'll stick to one beautiful line to represent the REAL data (Balance).
                  Adding a fake second line might be confusing. 
                  
                  Wait, typically "Projected" vs "Actual" or "Income" vs "Expense".
                  I'll stick to one line for now but make it look great.
              */}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
