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
    indigo: 'bg-gradient-to-r from-[#3F4786] to-[#5A62C8] text-white',
    violet: 'bg-gradient-to-r from-[#3F4786] to-[#5A62C8] text-white',
    purple: 'bg-gradient-to-r from-[#3F4786] to-[#5A62C8] text-white',
    green: 'bg-gradient-to-r from-[#189c77] to-[#36c79b] text-white',
    emerald: 'bg-gradient-to-r from-[#189c77] to-[#36c79b] text-white',
    red: 'bg-gradient-to-r from-[#d33b36] to-[#ef6261] text-white',
    rose: 'bg-gradient-to-r from-[#d33b36] to-[#ef6261] text-white',
    blue: 'bg-gradient-to-r from-[#2472c1] to-[#479dec] text-white',
    sky: 'bg-gradient-to-r from-[#2472c1] to-[#479dec] text-white',
    cyan: 'bg-gradient-to-r from-[#2472c1] to-[#479dec] text-white',
    yellow: 'bg-gradient-to-r from-amber-400 to-amber-300 text-gray-900',
    amber: 'bg-gradient-to-r from-amber-400 to-amber-300 text-gray-900',
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

      <div className="p-6 relative z-10 h-full flex flex-col justify-between items-start">

        {/* Icon (Desktop Only - Top Left) */}
        {icon && (
          <div className={`hidden lg:flex items-center justify-center p-2.5 rounded-full mb-3 shadow-sm ${variant === 'filled'
            ? 'bg-white/20 text-white backdrop-blur-sm'
            : (iconBgClasses[color] || iconBgClasses.indigo)
            }`}>
            {icon}
          </div>
        )}

        <div className="w-full">
          <p className={`text-sm font-medium truncate mb-1 ${variant === 'filled'
            ? 'text-white/80'
            : 'text-gray-500 dark:text-gray-400'
            }`}>
            {title}
          </p>
          <div className={`text-2xl font-bold tracking-tight mb-2 ${variant === 'filled'
            ? 'text-white'
            : 'text-gray-900 dark:text-white'
            }`}>
            {value}
          </div>

          {/* Trend Badge */}
          {trend && (
            <div className={`flex items-center text-sm font-semibold ${variant === 'filled'
              ? 'text-white/90' // Cleaner look for trend in filled card
              : trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
              <span className={`${variant === 'filled' ? 'bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm' : ''}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
