import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string | ReactNode
  description?: string
  className?: string
  shadow?: boolean
  fullHeight?: boolean
}

export function Card({ children, title, description, className = '', shadow = true, fullHeight = false }: CardProps) {
  const shadowClass = shadow ? 'shadow-sm' : ''
  const heightClass = fullHeight ? 'h-full' : ''
  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${heightClass} ${shadowClass} ${className}`}>
      {(title || description) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {title && typeof title === 'string' ? (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          ) : (
            title
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
      <div className={`p-6 ${fullHeight ? 'flex-1 overflow-hidden flex flex-col' : ''}`}>
        {children}
      </div>
    </div>
  )
}
