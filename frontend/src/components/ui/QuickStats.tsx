/**
 * QuickStats - Compact statistics display component
 * Reusable across different sections
 */

interface QuickStatItem {
    label: string
    value: string | number
    icon?: string
    color?: 'green' | 'red' | 'blue' | 'gray'
}

interface QuickStatsProps {
    items: QuickStatItem[]
    className?: string
}

export function QuickStats({ items, className = '' }: QuickStatsProps) {
    return (
        <div className={`flex gap-6 md:gap-8 ${className}`}>
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    {item.icon && (
                        <span className="text-2xl" aria-hidden="true">
                            {item.icon}
                        </span>
                    )}
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {item.label}
                        </span>
                        <span className={`text-xl md:text-2xl font-bold ${getColorClass(item.color)}`}>
                            {item.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

function getColorClass(color?: string): string {
    switch (color) {
        case 'green':
            return 'text-green-600 dark:text-green-400'
        case 'red':
            return 'text-red-600 dark:text-red-400'
        case 'blue':
            return 'text-blue-600 dark:text-blue-400'
        default:
            return 'text-gray-900 dark:text-gray-100'
    }
}
