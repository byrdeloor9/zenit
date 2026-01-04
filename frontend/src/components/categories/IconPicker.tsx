/**
 * IconPicker component - Windows-style emoji selector with search and vertical scroll
 */

import { useState, useMemo } from 'react'

interface IconPickerProps {
  value: string | null
  onChange: (icon: string) => void
}

// Comprehensive emoji list organized by categories with icons
const EMOJI_CATEGORIES = {
  'Caras': {
    icon: '😊',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐']
  },
  'Dinero': {
    icon: '💰',
    emojis: ['💰', '💵', '💴', '💶', '💷', '💸', '💳', '🏦', '💼', '📈', '📉', '🤑', '💲', '🪙', '💹', '🏧', '💱', '🧾']
  },
  'Comida': {
    icon: '🍕',
    emojis: ['🍔', '🍕', '🍝', '🍜', '🍱', '🍣', '🥗', '🍲', '🥘', '🍳', '🥚', '🧀', '🥓', '🥩', '🍗', '🍖', '🌭', '🥪', '🥙', '🌮', '🌯', '🫔', '🥫', '🍿', '🧈', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🧇', '🥞', '🍰', '🎂', '🧁', '🥧', '🍮', '🍭', '🍬', '🍫', '🍩', '🍪', '🍨', '🍧', '🍦', '🥤', '🧃', '🧋', '🍵', '☕', '🫖', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🥢', '🛒', '🥑', '🍅', '🥦', '🥬', '🥒']
  },
  'Hogar': {
    icon: '🏠',
    emojis: ['🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏢', '🏬', '🏭', '🏛️', '⛪', '🕌', '🛕', '🔌', '💡', '🕯️', '🔥', '💧', '🚿', '🛁', '🚽', '🧻', '🧼', '🧽', '🧹', '🧺', '🧴', '🛋️', '🪑', '🛏️', '🛌', '🧸', '🖼️', '🪞', '🪟', '🚪', '🪜', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪛', '🪚', '🔩', '⚙️', '🪤', '🧰', '🧲']
  },
  'Transporte': {
    icon: '🚗',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁', '🛸', '🚀', '🛰️', '🚢', '⛵', '🛶', '🚤', '🛥️', '⛴️', '🛳️', '⚓', '⛽', '🚧', '🚦', '🚥', '🗺️']
  },
  'Actividades': {
    icon: '⚽',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🎬', '🎭', '🎪', '🎨', '🎰', '🎲', '🎯', '🎳', '🎮', '🎴', '🃏']
  },
  'Objetos': {
    icon: '💼',
    emojis: ['⌚', '📱', '💻', '⌨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💼', '👔', '👗', '👕', '👘', '🥻', '🩱', '🩲', '🩳']
  },
  'Naturaleza': {
    icon: '🌱',
    emojis: ['🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️']
  },
  'Animales': {
    icon: '🐶',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪']
  },
  'Viajes': {
    icon: '✈️',
    emojis: ['✈️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🗺️', '🗾', '🧳', '⛱️', '🏖️', '🏝️', '🏜️', '🏔️', '⛰️', '🗻', '🏕️', '⛺', '🏞️', '🌋', '🏛️', '🏗️', '🧱', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼']
  },
  'Símbolos': {
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '⭐', '🌟', '✨', '💫', '🔥', '💧', '🌊']
  }
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

  // Filter emojis based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return EMOJI_CATEGORIES
    }

    const filtered: typeof EMOJI_CATEGORIES = {} as any
    Object.entries(EMOJI_CATEGORIES).forEach(([category, data]) => {
      const matchingEmojis = data.emojis.filter(emoji =>
        emoji.includes(searchQuery) || category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (matchingEmojis.length > 0) {
        filtered[category as keyof typeof EMOJI_CATEGORIES] = {
          ...data,
          emojis: matchingEmojis
        }
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
          <span className="text-2xl">{value || '😊'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Seleccionar Icono
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar emojis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            {/* Category Icons Bar */}
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto flex-shrink-0 bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-1 px-4 py-2">
                {Object.entries(EMOJI_CATEGORIES).map(([category, data]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      const element = document.getElementById(`category-${category}`)
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      setActiveCategory(category)
                    }}
                    className={`w-10 h-10 text-2xl rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center ${activeCategory === category
                      ? 'bg-indigo-100 dark:bg-indigo-900/30'
                      : ''
                      }`}
                    title={category}
                  >
                    {data.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Grid with Vertical Scroll */}
            <div className="flex-1 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No se encontraron emojis
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category} id={`category-${category}`} className="mb-6 first:mt-0">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 sticky top-0 bg-white dark:bg-gray-800 py-3 z-20 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 -mx-6">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{filteredCategories[category as keyof typeof filteredCategories].icon}</span>
                        <span>{category}</span>
                      </span>
                    </h4>
                    <div className="grid grid-cols-7 sm:grid-cols-8 md:grid-cols-9 gap-2 px-6">
                      {filteredCategories[category as keyof typeof filteredCategories].emojis.map((icon, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleIconSelect(icon)}
                          className={`aspect-square w-full text-2xl rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center ${value === icon
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500 shadow-lg'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0 bg-gray-50 dark:bg-gray-900">
              {value && (
                <button
                  type="button"
                  onClick={() => handleIconSelect('')}
                  className="px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                >
                  Quitar icono
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-5 py-2.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Default export for compatibility
export default IconPicker
