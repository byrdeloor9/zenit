/**
 * ContextMenu component - Reusable contextual menu with Tailwind CSS
 */

import { ReactNode, useMemo } from 'react'

interface ContextMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  children: ReactNode
}

export function ContextMenu({ anchorEl, onClose, children }: ContextMenuProps): JSX.Element | null {
  if (!anchorEl) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation()
    onClose()
  }

  // Calculate optimal menu position to prevent it from going off-screen
  const menuPosition = useMemo(() => {
    const rect = anchorEl.getBoundingClientRect()
    const menuWidth = 160 // min-w-[160px]
    const menuHeight = 250 // Estimated max height (conservative estimate for multiple items)
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const spaceOnRight = viewportWidth - rect.right
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // Determine horizontal alignment
    const shouldAlignRight = spaceOnRight < menuWidth + 16

    // Determine vertical alignment - show above if not enough space below
    const shouldShowAbove = spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow

    const position: {
      top?: number | string
      bottom?: number | string
      left?: number | string
      right?: number | string
    } = {}

    if (shouldShowAbove) {
      // Position above the button
      position.bottom = `${viewportHeight - rect.top + 4}px`
    } else {
      // Position below the button (default)
      position.top = `${rect.bottom + 4}px`
    }

    if (shouldAlignRight) {
      // Align to right side of button
      position.right = `${viewportWidth - rect.right}px`
      position.left = 'auto'
    } else {
      // Align to left side of button
      position.left = `${rect.left}px`
      position.right = 'auto'
    }

    return position
  }, [anchorEl])

  return (
    <div className="fixed inset-0 z-50" onMouseDown={handleOverlayClick}>
      <div
        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
        style={menuPosition}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

interface ContextMenuItemProps {
  onClick: (e: React.MouseEvent) => void
  children: ReactNode
  variant?: 'default' | 'danger'
  icon?: ReactNode
}

export function ContextMenuItem({ onClick, children, variant = 'default', icon }: ContextMenuItemProps): JSX.Element {
  const baseClasses = "flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors"

  const variantClasses = {
    default: "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700",
    danger: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
  }

  const iconClasses = {
    default: "text-gray-500 dark:text-gray-400",
    danger: "text-red-500 dark:text-red-400"
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {icon && (
        <span className={iconClasses[variant]}>
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}
