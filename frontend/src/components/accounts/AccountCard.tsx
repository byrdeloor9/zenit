/**
 * AccountCard component - Display individual account (migrated to Tailwind CSS)
 */

import { useState } from 'react'
import {
  Settings,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import type { Account } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: number) => void
  onViewHistory: (account: Account) => void
}

const ACCOUNT_TYPE_ICONS: Record<string, string> = {
  bank: '🏦',
  cash: '💵',
  card: '💳',
  investment: '📈',
}

export function AccountCard({ account, onEdit, onDelete, onViewHistory }: AccountCardProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleCardClick = (): void => {
    // No abrir historial si el menú está abierto
    if (anchorEl) {
      return
    }
    onViewHistory(account)
  }

  // Función para convertir color hex a RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Obtener color de la cuenta o usar color por defecto basado en tipo
  const getAccountColor = (): string => {
    if (account.color) {
      return account.color
    }
    // Fallback a colores más fuertes por tipo
    switch (account.type) {
      case 'bank':
        return '#2563EB' // Blue saturated
      case 'cash':
        return '#16A34A' // Green saturated
      case 'card':
        return '#EAB308' // Gold/Yellow saturated
      case 'investment':
        return '#9333EA' // Purple saturated
      default:
        return '#6366F1' // Indigo saturated
    }
  }

  const accountColor = getAccountColor()
  const rgb = hexToRgb(accountColor)

  // Crear gradiente de fondo con color saturado
  // Gradiente de color más oscuro arriba a más claro abajo (estilo tarjeta de crédito)
  const darkerRgb = rgb ? {
    r: Math.round(rgb.r * 0.8),
    g: Math.round(rgb.g * 0.8),
    b: Math.round(rgb.b * 0.8)
  } : { r: 34, g: 58, b: 209 }
  
  const lighterRgb = rgb ? {
    r: Math.round(Math.min(rgb.r * 1.3, 255)),
    g: Math.round(Math.min(rgb.g * 1.3, 255)),
    b: Math.round(Math.min(rgb.b * 1.3, 255))
  } : { r: 99, g: 102, b: 241 }

  // Gradiente de fondo estilo tarjeta de crédito
  const gradientBackground = `linear-gradient(135deg, rgb(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b}), rgb(${lighterRgb.r}, ${lighterRgb.g}, ${lighterRgb.b}))`

  return (
    <div 
      className="rounded-xl shadow-lg p-6 h-full min-h-[200px] md:min-h-[240px] cursor-pointer transition-shadow duration-300 hover:shadow-xl overflow-hidden relative"
      style={{ 
        background: gradientBackground,
      }}
      onClick={handleCardClick}
    >
      {/* Header with name and menu */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-2 truncate drop-shadow-lg">
            {ACCOUNT_TYPE_ICONS[account.type] || '💳'} {account.name}
          </h3>
          {/* Decorative chip element - below account name */}
          <div className="w-12 h-10 bg-white/20 rounded-md" />
        </div>

        <button
          onClick={handleMenuClick}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Opciones de cuenta"
        >
          <Settings className="text-white" fontSize="small" />
        </button>
      </div>

      {/* Balance Section - Bottom Right */}
      <div className="absolute bottom-6 right-6 text-right">
        <p className="text-white text-sm opacity-80 mb-1">
          {account.currency}
        </p>
        <p className="text-white text-4xl font-extrabold drop-shadow-lg">
          {formatCurrency(account.balance)}
        </p>
      </div>

      {/* Menu */}
      <ContextMenu anchorEl={anchorEl} onClose={handleMenuClose}>
        <ContextMenuItem onClick={() => { handleMenuClose(); onViewHistory(account); }} icon={<HistoryIcon fontSize="small" />}>
          Ver Historial
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { handleMenuClose(); onEdit(account); }} icon={<EditIcon fontSize="small" />}>
          Editar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => { handleMenuClose(); onDelete(account.id); }} variant="danger" icon={<DeleteIcon fontSize="small" />}>
          Eliminar
        </ContextMenuItem>
      </ContextMenu>
    </div>
  )
}