/**
 * BudgetCard component - Horizontal design with responsive layout
 */

import { useState } from 'react'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Loop as LoopIcon,
} from '@mui/icons-material'
import { BudgetHistoryDialog } from './BudgetHistoryDialog'
import { formatCurrency } from '../../utils/formatters'
import type { BudgetWithProgress } from '../../api/endpoints/budgets'

interface BudgetCardProps {
  budget: BudgetWithProgress
  onEdit: (budget: BudgetWithProgress) => void
  onDelete: (id: number) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps): JSX.Element {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getProgressColor = (): string => {
    if (budget.percentage < 50) return 'from-green-500 to-emerald-500'
    if (budget.percentage < 80) return 'from-yellow-500 to-orange-400'
    if (budget.percentage < 100) return 'from-orange-500 to-red-500'
    return 'from-red-600 to-rose-600'
  }

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-all duration-300 hover:shadow-md group"
      >
        {/* Mobile Layout */}
        <div
          className="sm:hidden relative"
          onClick={() => setShowActions(!showActions)}
        >
          <div className="flex items-center">
            {/* Main content */}
            <div className={`flex-1 space-y-3 transition-all duration-300 ${showActions ? 'pr-16' : ''}`}>
              {/* Top section: Icon+Name (left) | Values (right) */}
              <div className="flex items-start justify-between gap-3">
                {/* Left: Icon + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                    {budget.category_icon || '📊'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                      {budget.category_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        📅 {new Date().toLocaleDateString('es-ES', {
                          month: 'long'
                        })}
                      </span>
                      {budget.is_recurring && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <LoopIcon style={{ fontSize: '12px' }} />
                          Recurrente
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Values */}
                <div className={`text-lg font-bold whitespace-nowrap text-right ${budget.percentage < 50 ? 'text-green-600 dark:text-green-400' :
                  budget.percentage < 80 ? 'text-yellow-600 dark:text-yellow-400' :
                    budget.percentage < 100 ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                  }`}>
                  {formatCurrency(budget.spent || 0)} <span className="text-gray-400 dark:text-gray-500">/</span> <span className="text-gray-600 dark:text-gray-400">{formatCurrency(budget.amount)}</span>
                </div>
              </div>

              {/* Progress Bar with percentage */}
              <div className="relative">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 relative`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>
                {/* Percentage on the right side */}
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 drop-shadow-sm">
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons - slide in from right */}
            <div
              className={`absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-1 transition-all duration-300 ${showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onEdit(budget)}
                className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors shadow-sm"
                title="Editar"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(budget.id)}
                className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors shadow-sm"
                title="Eliminar"
              >
                <DeleteIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Card with Circular Progress */}
        <div
          className="hidden sm:block relative cursor-pointer"
          onClick={() => setShowActions(!showActions)}
        >
          {/* Header: Icon + Name + Badge */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                {budget.category_icon || '📊'}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {budget.category_name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            {budget.is_recurring && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                recurrente
              </span>
            )}
          </div>

          {/* Circular Progress Indicator */}
          <div className="flex justify-center py-2">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(budget.percentage, 100) * 2.64} 264`}
                  className="transition-all duration-500"
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={budget.percentage < 50 ? '#22c55e' : budget.percentage < 80 ? '#eab308' : budget.percentage < 100 ? '#f97316' : '#ef4444'} />
                    <stop offset="100%" stopColor={budget.percentage < 50 ? '#10b981' : budget.percentage < 80 ? '#f59e0b' : budget.percentage < 100 ? '#ea580c' : '#dc2626'} />
                  </linearGradient>
                </defs>
              </svg>
              {/* Percentage in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {budget.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Footer: Values + Days */}
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className={`text-base font-bold ${budget.percentage < 50 ? 'text-green-600 dark:text-green-400' :
                budget.percentage < 80 ? 'text-yellow-600 dark:text-yellow-400' :
                  budget.percentage < 100 ? 'text-orange-600 dark:text-orange-400' :
                    'text-red-600 dark:text-red-400'
                }`}>
                {formatCurrency(budget.spent || 0)} <span className="text-gray-400 text-sm">spent</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(budget.amount)} total
              </div>
            </div>
            {budget.days_left !== null && budget.days_left >= 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {budget.days_left} días
              </div>
            )}
          </div>

          {/* Action buttons - slide in from right */}
          <div
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-all duration-300 ${showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(budget)}
              className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors shadow-sm"
              title="Editar"
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(budget.id)}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors shadow-sm"
              title="Eliminar"
            >
              <DeleteIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <BudgetHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        budgetId={budget.id}
        budgetName={budget.category_name}
      />
    </>
  )
}