/**
 * CategoryCard component - Cyber Plate Design (Option 2)
 * Wide, structured layout with prominent name and color accents
 */

import { useState } from 'react'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { CategoryIcon } from './CategoryIcons'
import type { Category } from '../../types'

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const isIncome = category.type === 'Income'

  // Colors for "Cyber Plate" design - Bolder & More Representative
  // Emerald lighter (400), Rose darker (600) for better distinction
  const borderColor = isIncome ? 'border-b-emerald-400 dark:border-b-emerald-400' : 'border-b-rose-600 dark:border-b-rose-500'
  // Increased opacity for better visibility (from /30 to /50)
  const iconColor = isIncome ? 'text-emerald-400/50 dark:text-emerald-300/50' : 'text-rose-600/50 dark:text-rose-400/50'
  const hoverShadow = isIncome ? 'hover:shadow-emerald-400/20' : 'hover:shadow-rose-500/20'
  const bgColor = 'bg-white dark:bg-gray-800'

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
        className={`
          group relative overflow-hidden rounded-xl transition-all duration-300
          ${bgColor}
          border border-gray-200 dark:border-gray-700
          ${borderColor} border-b-[6px]
          shadow-sm hover:shadow-xl hover:-translate-y-1 ${hoverShadow}
          cursor-pointer flex items-center p-5 min-h-[90px]
        `}
      >
        {/* Action Menu Button (Top Right) */}
        <button
          onClick={handleMenuClick}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-20"
        >
          <MoreVertIcon fontSize="small" />
        </button>

        {/* Left Side: Name & Type */}
        <div className="flex-1 pr-16 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1.5">
            {category.name}
          </h3>
          <span className={`
            text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm
            ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}
          `}>
            {isIncome ? 'Ingreso' : 'Gasto'}
          </span>
        </div>

        {/* Right Side: Large Watermark Icon */}
        {/* Right Side: Large Watermark Icon */}
        <div className={`
          absolute -right-3 -bottom-3 transition-all duration-300 origin-bottom-right
          ${isIncome ? 'text-emerald-500' : 'text-rose-500'} 
          opacity-15 group-hover:opacity-40 group-hover:scale-110
        `}>
          {category.icon ? (
            <CategoryIcon iconName={category.icon} className="!text-7xl" />
          ) : (
            <span>{isIncome ? <TrendingUp className="!text-7xl" /> : <TrendingDown className="!text-7xl" />}</span>
          )}
        </div>
      </div>

      {/* Context Menu */}
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
