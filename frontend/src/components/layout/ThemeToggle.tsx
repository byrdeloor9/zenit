/**
 * ThemeToggle - Componente para alternar entre tema claro y oscuro
 * Versión Tailwind CSS con animación suave
 */

import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material'
import { useTheme } from '../../contexts/ThemeContext'

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export function ThemeToggle({ size = 'medium' }: ThemeToggleProps): JSX.Element {
  const { theme, toggleTheme } = useTheme()

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  const iconSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    // Crear elemento de animación radial
    const overlay = document.createElement('div')
    overlay.className = 'theme-transition-overlay'

    const circle = document.createElement('div')
    circle.className = `theme-transition-circle ${theme === 'light' ? 'to-dark' : 'to-light'}`
    circle.style.left = `${x}px`
    circle.style.top = `${y}px`
    circle.style.width = `${Math.max(window.innerWidth, window.innerHeight) * 3}px`
    circle.style.height = `${Math.max(window.innerWidth, window.innerHeight) * 3}px`

    overlay.appendChild(circle)
    document.body.appendChild(overlay)

    // Iniciar animación
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.classList.add('active')
      })
    })

    // Cambiar tema después de un pequeño delay para que se vea la animación
    setTimeout(() => {
      toggleTheme()
    }, 150)

    // Limpiar después de la animación
    setTimeout(() => {
      document.body.removeChild(overlay)
    }, 700)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        relative rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800
        border border-gray-200/50 dark:border-gray-600/50
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:border-indigo-400/50 active:scale-95
        flex items-center justify-center
        group
      `}
      title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Icono del sol (tema claro) */}
        <LightModeIcon
          className={`
            ${iconSizes[size]}
            absolute transition-all duration-300 ease-in-out
            ${theme === 'light'
              ? 'opacity-100 rotate-0 scale-100 text-amber-500'
              : 'opacity-0 rotate-180 scale-75 text-amber-500'
            }
          `}
        />

        {/* Icono de la luna (tema oscuro) */}
        <DarkModeIcon
          className={`
            ${iconSizes[size]}
            absolute transition-all duration-300 ease-in-out
            ${theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100 text-indigo-400'
              : 'opacity-0 -rotate-180 scale-75 text-indigo-400'
            }
          `}
        />
      </div>

      {/* Efecto de hover */}
      <div className="absolute inset-0 rounded-lg bg-indigo-100 dark:bg-indigo-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200 pointer-events-none" />
    </button>
  )
}

// Variante compacta para espacios reducidos
export function CompactThemeToggle(): JSX.Element {
  return <ThemeToggle size="small" />
}

// Variante con etiqueta
export function LabeledThemeToggle(): JSX.Element {
  const { theme } = useTheme()

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 transition-all duration-200">
      <ThemeToggle size="small" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
        {theme === 'light' ? 'Claro' : 'Oscuro'}
      </span>
    </div>
  )
}