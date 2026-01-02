/**
 * BudgetCard component - Display individual budget with progress (migrated to Tailwind CSS)
 */

import { useState } from 'react'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Loop as LoopIcon,
  MoreVert,
} from '@mui/icons-material'
import { BudgetProgress } from './BudgetProgress'
import { BudgetHistoryDialog } from './BudgetHistoryDialog'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { Button } from '../ui/Button'
import type { BudgetWithProgress } from '../../api/endpoints/budgets'

interface BudgetCardProps {
  budget: BudgetWithProgress
  onEdit: (budget: BudgetWithProgress) => void
  onDelete: (id: number) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps): JSX.Element {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const menuOpen = Boolean(anchorEl)
  
  const getStatusColor = (): string => {
    if (budget.percentage < 80) return '#10B981'
    if (budget.percentage < 100) return '#F59E0B'
    return '#EF4444'
  }

  const color = getStatusColor()

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent): void => {
    e.stopPropagation()
    action()
    handleMenuClose()
  }

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full transition-all duration-300 hover:shadow-md group overflow-hidden relative"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {budget.category_icon || '📊'}
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {budget.category_name}
            </h3>
          </div>
          
          {/* Context Menu Button */}
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVert className="w-5 h-5" />
          </button>
        </div>

        {/* Chips (solo si aplica) */}
        {(budget.is_recurring || budget.is_indefinite) && (
          <div className="flex gap-2 mb-3">
            {budget.is_recurring && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <LoopIcon className="text-xs" />
                Recurrente
              </span>
            )}
            {budget.is_indefinite && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                ∞ Indefinido
              </span>
            )}
          </div>
        )}

        {/* Progress Section */}
        <div className="mb-3">
          <BudgetProgress
            spent={budget.spent || 0}
            total={parseFloat(budget.amount)}
            percentage={budget.percentage}
          />
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-300">
              {new Date(budget.period_start).toLocaleDateString('es-ES', { 
                month: 'short', 
                day: 'numeric' 
              })}
              {budget.period_end ? (
                <>
                  {' - '}
                  {new Date(budget.period_end).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </>
              ) : (
                ' - Sin fin'
              )}
            </span>
            
            {budget.days_left !== null && budget.days_left >= 0 && (
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {budget.days_left === 0 ? 'Último día' : `${budget.days_left} días`}
              </span>
            )}
            
            {budget.days_left === null && budget.is_indefinite && (
              <span className="font-semibold text-green-600 dark:text-green-400">
                ∞ Sin vencimiento
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu anchorEl={anchorEl} onClose={handleMenuClose}>
        <ContextMenuItem onClick={handleMenuAction(() => onEdit(budget))}>
          <EditIcon className="text-sm" />
          Editar
        </ContextMenuItem>
        {budget.history_count > 0 && (
          <ContextMenuItem onClick={handleMenuAction(() => setHistoryOpen(true))}>
            <HistoryIcon className="text-sm" />
            Historial ({budget.history_count})
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={handleMenuAction(() => onDelete(budget.id))} destructive>
          <DeleteIcon className="text-sm" />
          Eliminar
        </ContextMenuItem>
      </ContextMenu>

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