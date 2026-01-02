/**
 * IconPicker component - Emoji selector for categories (migrated to Tailwind CSS)
 */

import { useState } from 'react'

interface IconPickerProps {
  value: string | null
  onChange: (icon: string) => void
}

const COMMON_ICONS = [
  // Finance & Money (12)
  '💼', '💰', '💵', '💴', '💶', '💷', '💳', '🏦', '📈', '📉', '💸', '🤑',
  
  // Food & Drinks (18)
  '🍔', '🍕', '🍝', '🍜', '🍱', '🍣', '🥗', '🍲', '🥘', '☕', '🍺', '🍷', 
  '🥤', '🍰', '🍩', '🍪', '🛒', '🥑',
  
  // Home & Utilities (12)
  '🏠', '🏡', '🔌', '💡', '🔥', '💧', '🚿', '🛋️', '🛏️', '🧹', '🔧', '🔨',
  
  // Transport (15)
  '🚗', '🚕', '🚙', '🚌', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚖', '✈️', 
  '🚂', '⛽', '🚲',
  
  // Entertainment (15)
  '🎬', '🎮', '🎯', '🎲', '🎸', '🎹', '🎵', '🎤', '🎧', '📺', '📻', '🎪', 
  '🎨', '🎭', '🎰',
  
  // Shopping & Fashion (12)
  '👕', '👗', '👔', '👠', '👟', '👞', '👜', '👛', '💄', '💅', '💍', '⌚',
  
  // Health & Sports (15)
  '🏥', '💊', '💉', '🩺', '🏋️', '🧘', '🚴', '🏃', '⚽', '🏀', '🎾', '🏈', 
  '⛹️', '🤸', '🧗',
  
  // Tech & Gadgets (12)
  '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '📹', '🎧', '⌚', '📡', '🔋',
  
  // Education & Work (15)
  '🎓', '📚', '📖', '📝', '✏️', '📊', '📈', '📉', '💼', '📁', '📂', '🗂️', 
  '📋', '📌', '🖊️',
  
  // Travel & Vacation (12)
  '✈️', '🗺️', '🧳', '🎒', '🏖️', '🏝️', '🗼', '🏰', '⛺', '🎡', '🎢', '🎠',
  
  // Pets & Animals (12)
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  
  // Nature & Weather (12)
  '🌱', '🌿', '🌳', '🌲', '🌵', '🌺', '🌸', '🌻', '🌷', '🌹', '☀️', '🌧️',
  
  // Miscellaneous (12)
  '🎁', '🎂', '🎉', '🎊', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️',
]

export function IconPicker({ value, onChange }: IconPickerProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const handleIconSelect = (icon: string): void => {
    onChange(icon)
    handleClose()
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-left hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-100">
            {value ? `Icono: ${value}` : 'Seleccionar icono'}
          </span>
          <span className="text-2xl">{value || '😊'}</span>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Seleccionar Icono
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-8 gap-2">
                {COMMON_ICONS.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => handleIconSelect(icon)}
                    className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                      value === icon
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}