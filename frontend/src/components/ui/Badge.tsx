import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'primary', size = 'md', className = '' }: BadgeProps) {
  const baseClasses = "inline-flex items-center font-medium rounded-full"
  
  const variantClasses = {
    primary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-100 dark:text-indigo-800',
    success: 'bg-green-100 text-green-800 dark:bg-green-100 dark:text-green-800',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-100 dark:text-red-800',
    info: 'bg-blue-100 text-blue-800 dark:bg-indigo-100 dark:text-indigo-800',
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}
