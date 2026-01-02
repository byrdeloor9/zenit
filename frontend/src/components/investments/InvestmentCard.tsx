/**
 * InvestmentCard component - Display individual investment with adaptive design (migrated to Tailwind CSS)
 */

import { useState } from 'react'
import {
  Settings,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel as CancelIcon,
  AddCircle,
} from '@mui/icons-material'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import type { Investment } from '../../types/models'

interface InvestmentCardProps {
  investment: Investment
  onEdit: (investment: Investment) => void
  onAddContribution: (investment: Investment) => void
  onDelete: (id: number) => void
  onComplete: (id: number) => void
  onCancel: (id: number) => void
}

export function InvestmentCard({
  investment,
  onEdit,
  onAddContribution,
  onDelete,
  onComplete,
  onCancel,
}: InvestmentCardProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const getStatusColor = (): string => {
    switch (investment.status) {
      case 'completed':
        return '#10B981'
      case 'cancelled':
        return '#F59E0B'
      default:
        return '#667eea'
    }
  }

  const getStatusEmoji = (): string => {
    switch (investment.status) {
      case 'completed':
        return '✅'
      case 'cancelled':
        return '⚠️'
      default:
        return '🔄'
    }
  }

  const getStatusLabel = (): string => {
    switch (investment.status) {
      case 'completed':
        return 'Completado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Activo'
    }
  }

  const getTypeConfig = (): { icon: string; color: string; label: string } => {
    switch (investment.investment_type) {
      case 'goal':
        return { icon: '🎯', color: '#667eea', label: 'Meta' }
      case 'insurance':
        return { icon: '🛡️', color: '#10B981', label: 'Póliza' }
      default:
        return { icon: '📈', color: '#F59E0B', label: 'Inversión' }
    }
  }

  const typeConfig = getTypeConfig()
  const statusColor = getStatusColor()

  // Calculate days left for goals
  const daysLeft = investment.deadline
    ? Math.ceil((new Date(investment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Calculate days until maturity for policies
  const daysToMaturity = investment.maturity_date
    ? Math.ceil((new Date(investment.maturity_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Calculate time progress percentage for policies
  const getTimeProgressPercentage = (): number => {
    if (investment.investment_type !== 'insurance' || !investment.start_date || !investment.maturity_date) {
      return 0
    }
    
    const startDate = new Date(investment.start_date).getTime()
    const maturityDate = new Date(investment.maturity_date).getTime()
    const currentDate = new Date().getTime()
    
    const totalDuration = maturityDate - startDate
    const elapsed = currentDate - startDate
    
    if (totalDuration <= 0) return 0
    
    const percentage = (elapsed / totalDuration) * 100
    return Math.min(Math.max(percentage, 0), 100) // Clamp between 0 and 100
  }

  const timeProgress = getTimeProgressPercentage()

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full cursor-pointer transition-shadow duration-200 group overflow-hidden relative"
      style={{ 
        borderLeft: `3px solid ${typeConfig.color}`,
        background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${typeConfig.color}10 100%)`
      }}
    >
      {/* Header with name and menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {investment.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              {typeConfig.icon} {typeConfig.label}
            </span>
            <span 
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border"
              style={{ 
                backgroundColor: `${statusColor}20`, 
                color: statusColor, 
                borderColor: `${statusColor}40` 
              }}
            >
              {getStatusEmoji()} {getStatusLabel()}
            </span>
          </div>
        </div>

        <button
          onClick={handleMenuClick}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          aria-label="Opciones de inversión"
        >
          <Settings className="text-gray-600 dark:text-gray-100" fontSize="small" />
        </button>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-300">Progreso</span>
          <span className="text-xs font-semibold" style={{ color: typeConfig.color }}>
            {investment.progress_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(investment.progress_percentage, 100)}%`,
              backgroundColor: typeConfig.color
            }}
          />
        </div>
      </div>

      {/* Financial Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Meta</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            ${parseFloat(investment.target_amount).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Actual</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            ${parseFloat(investment.current_amount).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Restante</p>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
            ${(parseFloat(investment.target_amount) - parseFloat(investment.current_amount)).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Retorno</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {investment.expected_return_rate}%
          </p>
        </div>
      </div>

      {/* Time Progress for Policies */}
      {investment.investment_type === 'insurance' && investment.maturity_date && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-300">Tiempo</span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {timeProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(timeProgress, 100)}%`,
                backgroundColor: '#3B82F6'
              }}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-300">
        <span>
          {investment.account_name || 'Sin cuenta'}
        </span>
        {daysLeft !== null && daysLeft > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            {daysLeft} días restantes
          </span>
        )}
        {daysToMaturity !== null && daysToMaturity > 0 && (
          <span className="text-blue-600 dark:text-blue-400">
            {daysToMaturity} días para vencimiento
          </span>
        )}
      </div>

      {/* Menu */}
      <ContextMenu anchorEl={anchorEl} onClose={handleMenuClose}>
        {investment.status === 'active' && (
          <ContextMenuItem onClick={() => { handleMenuClose(); onAddContribution(investment); }} icon={<AddCircle fontSize="small" />}>
            Agregar Contribución
          </ContextMenuItem>
        )}
        {investment.status === 'active' && (
          <ContextMenuItem onClick={() => { handleMenuClose(); onComplete(investment.id); }} icon={<CheckCircle fontSize="small" />}>
            Marcar Completado
          </ContextMenuItem>
        )}
        {investment.status === 'active' && (
          <ContextMenuItem onClick={() => { handleMenuClose(); onCancel(investment.id); }} icon={<CancelIcon fontSize="small" />}>
            Cancelar
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => { handleMenuClose(); onEdit(investment); }} icon={<EditIcon fontSize="small" />}>
          Editar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { handleMenuClose(); onDelete(investment.id); }} variant="danger" icon={<DeleteIcon fontSize="small" />}>
          Eliminar
        </ContextMenuItem>
      </ContextMenu>
    </div>
  )
}