import { ReactNode } from 'react'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
  children?: ReactNode
}

export function Alert({ type, message, onClose, children }: AlertProps) {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-50 dark:border-green-200 dark:text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-50 dark:border-red-200 dark:text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-600/50 dark:text-yellow-400',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-50 dark:border-blue-200 dark:text-blue-800',
  }

  const iconClasses = {
    success: 'text-green-400 dark:text-green-800',
    error: 'text-red-400 dark:text-red-800',
    warning: 'text-yellow-400 dark:text-yellow-400',
    info: 'text-blue-400 dark:text-blue-800',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`rounded-md border p-4 ${typeClasses[type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={`text-lg ${iconClasses[type]}`}>
            {icons[type]}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconClasses[type]} hover:opacity-75`}
            >
              <span className="sr-only">Cerrar</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
