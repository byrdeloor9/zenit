/**
 * CategoryCard component - Display individual category with responsive design
 * Mobile: Compact horizontal chip
 * Desktop: Full card layout
 */

import { useState } from 'react'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import type { Category } from '../../types'

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
}

const INCOME_COLOR = '#10B981'
const EXPENSE_COLOR = '#F43F5E'

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)
  
  const color = category.type === 'Income' ? INCOME_COLOR : EXPENSE_COLOR

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
      {/* Mobile: Compact Chip Design */}
      <div 
        className="md:hidden flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
        style={{ borderLeftColor: color }}
      >
        {/* Icono pequeño */}
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ 
            background: color,
            boxShadow: `0 2px 8px ${color}40`
          }}
        >
          {category.icon || (category.type === 'Income' ? '💰' : '💸')}
        </div>

        {/* Nombre */}
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {category.name}
        </span>

        {/* Badge tipo */}
        <span 
          className="text-xs px-2 py-1 rounded-full font-semibold uppercase flex-shrink-0"
          style={{
            background: category.type === 'Income' ? `${INCOME_COLOR}20` : `${EXPENSE_COLOR}20`,
            color: color
          }}
        >
          {category.type === 'Income' ? 'I' : 'E'}
        </span>

        {/* Menú */}
        <button 
          onClick={(e) => {
            e.stopPropagation()
            handleMenuClick(e)
          }}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none flex-shrink-0"
          aria-label="Opciones de categoría"
        >
          <MoreVertIcon className="text-gray-600 dark:text-gray-400" fontSize="small" />
        </button>
      </div>

      {/* Desktop: Full Card Design */}
      <div 
        className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full cursor-pointer transition-shadow duration-200 group overflow-hidden relative"
        style={{ 
          borderTop: `4px solid ${color}`,
          background: `linear-gradient(135deg, ${color}20, ${color}10)`
        }}
      >
        {/* Menú en esquina superior derecha */}
        <button 
          onClick={(e) => {
            e.stopPropagation()
            handleMenuClick(e)
          }}
          className="absolute top-2 right-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 z-10"
          aria-label="Opciones de categoría"
        >
          <MoreVertIcon className="text-gray-600 dark:text-gray-100" fontSize="small" />
        </button>

        {/* Contenido centrado */}
        <div className="text-center relative h-full flex flex-col justify-center items-center">
          {/* Icono grande centrado */}
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 mx-auto shadow-lg"
            style={{ 
              background: color,
              boxShadow: `0 6px 20px ${color}40`
            }}
          >
            {category.icon || (category.type === 'Income' ? '💰' : '💸')}
          </div>

          {/* Nombre centrado */}
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 min-h-[2.5rem] max-h-[2.5rem] px-2 overflow-hidden">
            {category.name}
          </h3>

          {/* Tipo centrado */}
          <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wide">
            {category.type === 'Income' ? 'Ingreso' : 'Gasto'}
          </span>
        </div>
      </div>

      {/* Menu Contextual */}
      <ContextMenu anchorEl={anchorEl} onClose={handleMenuClose}>
        <ContextMenuItem onClick={handleMenuAction(() => onEdit(category))} icon={<EditIcon fontSize="small" />}>
          Editar
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMenuAction(() => onDelete(category.id))} variant="danger" icon={<DeleteIcon fontSize="small" />}>
          Eliminar
        </ContextMenuItem>
      </ContextMenu>
    </>
  )
}

