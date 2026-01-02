/**
 * DebtCard component - Display individual debt in horizontal compact format (migrated to Tailwind CSS)
 */

import { useState } from 'react'
import {
  Settings,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import type { Debt } from '../../types'

interface DebtCardProps {
  debt: Debt
  onEdit: (debt: Debt) => void
  onAddPayment: (debt: Debt) => void
  onDelete: (id: number) => void
  onViewDetails: (debt: Debt) => void
}

export function DebtCard({ debt, onEdit, onAddPayment, onDelete, onViewDetails }: DebtCardProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleCardClick = (): void => {
    // No abrir detalles si el menú está abierto
    if (anchorEl) {
      return
    }
    onViewDetails(debt)
  }

  const getStatusColor = (): string => {
    switch (debt.status) {
      case 'Paid':
        return '#10B981'
      case 'Cancelled':
        return '#F59E0B'
      default:
        return '#EF4444'
    }
  }

  const getStatusEmoji = (): string => {
    switch (debt.status) {
      case 'Paid':
        return '✅'
      case 'Cancelled':
        return '⚠️'
      default:
        return '🔴'
    }
  }

  const getStatusLabel = (): string => {
    switch (debt.status) {
      case 'Paid':
        return 'Pagada'
      case 'Cancelled':
        return 'Cancelada'
      default:
        return 'Activa'
    }
  }

  const color = getStatusColor()
  const monthsElapsed = Math.floor((new Date().getTime() - new Date(debt.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
  const monthsRemaining = Math.max(0, debt.term_months - monthsElapsed)
  
  const percentage = debt.payment_progress
  const paid = parseFloat(debt.amount_paid)
  const total = debt.total_amount

  const getProgressColor = (): string => {
    if (percentage >= 100) return '#10B981'
    if (percentage >= 75) return '#667eea'
    if (percentage >= 50) return '#3B82F6'
    return '#EF4444'
  }

  const progressColor = getProgressColor()

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full cursor-pointer transition-shadow duration-200 group overflow-hidden relative"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={handleCardClick}
    >
      {/* Header Line: Name, Status, Menu */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3 flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            💳 {debt.creditor_name}
          </h3>
          <span 
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border"
            style={{ 
              backgroundColor: `${color}20`, 
              color: color, 
              borderColor: `${color}40` 
            }}
          >
            {getStatusEmoji()} {getStatusLabel()}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleMenuClick(e)
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          aria-label="Opciones de deuda"
        >
          <Settings className="text-gray-600 dark:text-gray-100" fontSize="small" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Progreso</span>
          <span className="text-xs font-semibold" style={{ color: progressColor }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: progressColor
            }}
          />
        </div>
      </div>

      {/* Financial Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            ${total.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pagado</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">
            ${paid.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Restante</p>
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            ${(total - paid).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mensual</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            ${parseFloat(debt.monthly_payment).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          {debt.interest_rate}% interés
        </span>
        {debt.status === 'Active' && (
          <span>
            {monthsRemaining} meses restantes
          </span>
        )}
      </div>

      {/* Menu */}
      <ContextMenu anchorEl={anchorEl} onClose={handleMenuClose}>
        {debt.status === 'Active' && (
          <ContextMenuItem onClick={() => { handleMenuClose(); onAddPayment(debt); }} icon={<PaymentIcon fontSize="small" />}>
            Registrar Pago
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => { handleMenuClose(); onEdit(debt); }} icon={<EditIcon fontSize="small" />}>
          Editar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { handleMenuClose(); onDelete(debt.id); }} variant="danger" icon={<DeleteIcon fontSize="small" />}>
          Eliminar
        </ContextMenuItem>
      </ContextMenu>
    </div>
  )
}