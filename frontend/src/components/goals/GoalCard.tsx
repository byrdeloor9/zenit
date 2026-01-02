/**
 * GoalCard component - Display individual goal (migrated to Tailwind CSS)
 */

import { useState } from 'react'
import {
  MoreVert,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel as CancelIcon,
  TrendingUp,
} from '@mui/icons-material'
import { GoalProgress } from './GoalProgress'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import type { Goal } from '../../types'

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onUpdateProgress: (goal: Goal) => void
  onComplete: (id: number) => void
  onCancel: (id: number) => void
  onDelete: (id: number) => void
}

export function GoalCard({ goal, onEdit, onUpdateProgress, onComplete, onCancel, onDelete }: GoalCardProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const getStatusColor = (): string => {
    switch (goal.status) {
      case 'Completed':
        return '#10B981'
      case 'Cancelled':
        return '#94A3B8'
      default:
        return '#667eea'
    }
  }

  const getStatusLabel = (): string => {
    switch (goal.status) {
      case 'Completed':
        return 'Completada'
      case 'Cancelled':
        return 'Cancelada'
      default:
        return 'En Progreso'
    }
  }

  const color = getStatusColor()
  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden relative"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            {goal.name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            <span 
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border"
              style={{ 
                backgroundColor: `${color}20`, 
                color: color, 
                borderColor: `${color}40` 
              }}
            >
              {goal.status === 'Completed' && <CheckCircle className="text-xs" />}
              {getStatusLabel()}
            </span>
            {goal.account_name && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-600">
                💳 {goal.account_name}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleMenuClick}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MoreVert className="text-gray-500 dark:text-gray-300" />
        </button>
      </div>

      {/* Menu */}
      <ContextMenu anchorEl={anchorEl} onClose={handleMenuClose}>
        <ContextMenuItem onClick={() => { handleMenuClose(); onEdit(goal); }} icon={<EditIcon fontSize="small" />}>
          Editar
        </ContextMenuItem>
        {goal.status === 'In Progress' && (
          <ContextMenuItem onClick={() => { handleMenuClose(); onUpdateProgress(goal); }} icon={<TrendingUp fontSize="small" />}>
            Actualizar Progreso
          </ContextMenuItem>
        )}
        {goal.status === 'In Progress' && (
          <ContextMenuItem onClick={() => { handleMenuClose(); onComplete(goal.id); }} icon={<CheckCircle fontSize="small" />}>
            Marcar Completada
          </ContextMenuItem>
        )}
        {goal.status === 'In Progress' && (
          <ContextMenuItem onClick={() => { handleMenuClose(); onCancel(goal.id); }} icon={<CancelIcon fontSize="small" />}>
            Cancelar Meta
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => { handleMenuClose(); onDelete(goal.id); }} variant="danger" icon={<DeleteIcon fontSize="small" />}>
          Eliminar
        </ContextMenuItem>
      </ContextMenu>

      {/* Progress */}
      <div className="mb-4">
        <GoalProgress
          current={parseFloat(goal.current_amount)}
          target={parseFloat(goal.target_amount)}
          percentage={goal.progress_percentage}
        />
      </div>

      {/* Footer */}
      {goal.deadline && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-300">
              📅 Fecha límite
            </span>
            <span className={`text-xs font-semibold ${daysLeft && daysLeft < 30 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-300'}`}>
              {new Date(goal.deadline).toLocaleDateString('es-ES')}
              {daysLeft !== null && daysLeft >= 0 && ` (${daysLeft} días)`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

