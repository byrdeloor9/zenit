import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: { value: number; isPositive: boolean }
  color?: 'indigo' | 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'emerald' | 'rose' | 'sky' | 'cyan' | 'amber' | 'violet'
  variant?: 'default' | 'filled'
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'indigo',
  variant = 'default',
  className = ''
}: StatCardProps) {

  // Mapping for "filled" variant colors
  const filledClasses = {
    indigo: 'bg-indigo-600 text-white',
    violet: 'bg-violet-600 text-white',
    purple: 'bg-purple-600 text-white',
    green: 'bg-emerald-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    red: 'bg-rose-500 text-white',
    rose: 'bg-rose-500 text-white',
    blue: 'bg-blue-500 text-white',
    sky: 'bg-sky-500 text-white',
    cyan: 'bg-cyan-500 text-white',
    yellow: 'bg-amber-400 text-gray-900',
    amber: 'bg-amber-400 text-gray-900',
  }

  // Mapping for "default" variant icon backgrounds
  const iconBgClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    yellow: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  }

  const baseClasses = "overflow-hidden shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
  const variantClasses = variant === 'filled'
    ? filledClasses[color] || filledClasses.indigo
    : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {/* Decorative gradient overlay for filled cards */}
      {variant === 'filled' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
      )}

      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate mb-1 ${variant === 'filled'
                ? 'text-white/80'
                : 'text-gray-500 dark:text-gray-400'
              }`}>
              {title}
            </p>
            <div className={`text-2xl font-bold tracking-tight ${variant === 'filled'
                ? 'text-white'
                : 'text-gray-900 dark:text-white'
              }`}>
              {value}
            </div>

            {/* Trend Badge */}
            {trend && (
              <div className={`flex items-center text-sm font-semibold mt-2 ${variant === 'filled'
                  ? 'text-white bg-white/20 inline-flex px-2 py-0.5 rounded-lg backdrop-blur-sm'
                  : trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                {variant !== 'filled' && (
                  <span className="ml-1 text-xs font-normal text-gray-400">vs mes anterior</span>
                )}
              </div>
            )}

            {/* Extra Context if needed */}
            {variant === 'filled' && trend && (
              <span className="ml-2 text-xs font-medium text-white/60">vs mes anterior</span>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className={`flex-shrink-0 p-3 rounded-xl ml-4 ${variant === 'filled'
                ? 'bg-white/20 text-white backdrop-blur-sm shadow-inner'
                : (iconBgClasses[color] || iconBgClasses.indigo)
              }`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
