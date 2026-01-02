/**
 * RecurringTransactionCard - Display individual recurring transaction in horizontal compact format (migrated to Tailwind CSS)
 */

import { useState } from 'react'
import {
  Settings,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as GenerateIcon,
} from '@mui/icons-material'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import type { RecurringTransaction } from '../../types'

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction
  onEdit: (transaction: RecurringTransaction) => void
  onGenerateNow: (transaction: RecurringTransaction) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number) => void
  onViewDetails: (transaction: RecurringTransaction) => void
}

export function RecurringTransactionCard({
  transaction,
  onEdit,
  onGenerateNow,
  onDelete,
  onToggleActive,
  onViewDetails,
}: RecurringTransactionCardProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation()
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
    onViewDetails(transaction)
  }

  const getTypeConfig = (): { icon: string; color: string; label: string } => {
    switch (transaction.type) {
      case 'Income':
        return { icon: '💰', color: '#10B981', label: 'Ingreso' }
      case 'Expense':
        return { icon: '💸', color: '#EF4444', label: 'Gasto' }
      default:
        return { icon: '🔄', color: '#6B7280', label: 'Transacción' }
    }
  }

  const getFrequencyConfig = (): { icon: string; label: string } => {
    switch (transaction.frequency) {
      case 'daily':
        return { icon: '📅', label: 'Diario' }
      case 'weekly':
        return { icon: '📆', label: 'Semanal' }
      case 'monthly':
        return { icon: '🗓️', label: 'Mensual' }
      case 'yearly':
        return { icon: '📅', label: 'Anual' }
      default:
        return { icon: '🔄', label: transaction.frequency }
    }
  }

  const typeConfig = getTypeConfig()
  const frequencyConfig = getFrequencyConfig()

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full cursor-pointer transition-shadow duration-200 group overflow-hidden relative"
      style={{ borderLeft: `3px solid ${typeConfig.color}` }}
      onClick={handleCardClick}
    >
      {/* Header Line: Name, Status, Menu */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3 flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {typeConfig.icon} {transaction.description}
          </h3>
          <span 
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border"
            style={{ 
              backgroundColor: `${typeConfig.color}20`, 
              color: typeConfig.color, 
              borderColor: `${typeConfig.color}40` 
            }}
          >
            {typeConfig.label}
          </span>
          <span 
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border ${
              transaction.is_active 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {transaction.is_active ? '🟢 Activo' : '🔴 Inactivo'}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleMenuClick(e)
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          aria-label="Opciones de transacción recurrente"
        >
          <Settings className="text-gray-600 dark:text-gray-100" fontSize="small" />
        </button>
      </div>

      {/* Financial Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Monto</p>
          <p className={`text-sm font-bold ${typeConfig.color}`}>
            ${parseFloat(transaction.amount).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Frecuencia</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {frequencyConfig.icon} {frequencyConfig.label}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Cuenta</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {transaction.account_name || 'Sin cuenta'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Categoría</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {transaction.category_name || 'Sin categoría'}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-300">
        <span>
          Próximo: {transaction.next_occurrence ? new Date(transaction.next_occurrence).toLocaleDateString('es-ES') : 'N/A'}
        </span>
        <span>
          {transaction.day_of_month ? `Día ${transaction.day_of_month}` : ''}
        </span>
      </div>

      {/* Menu */}
      <ContextMenu anchorEl={anchorEl} onClose={handleMenuClose}>
        <ContextMenuItem onClick={() => { handleMenuClose(); onGenerateNow(transaction); }} icon={<GenerateIcon fontSize="small" />}>
          Generar Ahora
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { handleMenuClose(); onToggleActive(transaction.id); }} icon={<EditIcon fontSize="small" />}>
          {transaction.is_active ? 'Desactivar' : 'Activar'}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { handleMenuClose(); onEdit(transaction); }} icon={<EditIcon fontSize="small" />}>
          Editar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { handleMenuClose(); onDelete(transaction.id); }} variant="danger" icon={<DeleteIcon fontSize="small" />}>
          Eliminar
        </ContextMenuItem>
      </ContextMenu>
    </div>
  )
}