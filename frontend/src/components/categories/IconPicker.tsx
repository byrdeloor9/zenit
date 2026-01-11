import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORY_GROUPS, CategoryIcon } from './CategoryIcons'

interface IconPickerProps {
  value: string | null
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleIconSelect = (icon: string) => {
    onChange(icon)
    handleClose()
  }

  // Filter icons based on search (searches icon name)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return CATEGORY_GROUPS
    }

    const filtered: typeof CATEGORY_GROUPS = {} as any
    Object.entries(CATEGORY_GROUPS).forEach(([category, icons]) => {
      const matchingIcons = icons.filter(icon =>
        icon.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (matchingIcons.length > 0) {
        filtered[category as keyof typeof CATEGORY_GROUPS] = matchingIcons
      }
    })
    return filtered
  }, [searchQuery])

  const categories = Object.keys(filteredCategories)

  return (
    <div>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-left hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-100">
            {value ? `Icono: ${value}` : 'Seleccionar icono'}
          </span>
          <span className="text-2xl flex items-center justify-center">
            <CategoryIcon iconName={value || 'HelpOutline'} className="text-2xl" />
          </span>
        </div>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <div
            className="fixed inset-0"
            onClick={handleClose}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Seleccionar Icono
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar iconos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                  autoFocus
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </span>
              </div>
            </div>

            {/* Category Icons Bar */}
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto flex-shrink-0 bg-gray-50/50 dark:bg-gray-900/50 [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 px-6 py-3">
                {Object.entries(CATEGORY_GROUPS).map(([category, icons]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      const element = document.getElementById(`category-${category}`)
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      setActiveCategory(category)
                    }}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap border ${activeCategory === category
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Grid with Vertical Scroll */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/10">
              {categories.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl block mb-4">😕</span>
                  No se encontraron iconos para "{searchQuery}"
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category} id={`category-${category}`} className="mb-8 first:mt-0">
                    <h4 className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-3">
                      {(filteredCategories[category as keyof typeof filteredCategories] as string[]).map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleIconSelect(icon)}
                          className={`aspect-square w-full rounded-xl border transition-all duration-200 hover:scale-110 flex items-center justify-center ${value === icon
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800 shadow-lg text-indigo-600 dark:text-indigo-400'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md text-gray-600 dark:text-gray-400'
                            }`}
                          title={icon}
                        >
                          <CategoryIcon iconName={icon} className="text-2xl" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-4 flex-shrink-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Icono seleccionado:
                </span>
                {value ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-700 dark:text-indigo-300 font-medium">
                    <CategoryIcon iconName={value} className="text-xl" />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Ninguno</span>
                )}
              </div>
              <div className="flex gap-3">
                {value && (
                  <button
                    type="button"
                    onClick={() => handleIconSelect('')}
                    className="px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    Quitar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-8 py-2.5 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// Default export for compatibility
export default IconPicker
