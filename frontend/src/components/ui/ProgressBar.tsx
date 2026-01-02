import { ReactNode } from 'react'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  color?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({ 
  value, 
  max, 
  label, 
  color = 'bg-indigo-600', 
  showPercentage = false,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const getColorClass = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-indigo-600'
  }

  const finalColor = color === 'bg-indigo-600' ? getColorClass(percentage) : color

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ease-in-out ${finalColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!label && showPercentage && (
        <div className="mt-1 text-right">
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}
