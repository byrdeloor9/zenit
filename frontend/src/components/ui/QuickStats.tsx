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
        <div className={`grid grid-cols-3 gap-2 md:flex md:gap-4 ${className}`}>
            {items.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center md:items-start p-2 md:px-4 md:py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 min-w-[100px] md:min-w-[120px]">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        {item.label}
                    </span>
                    <span className={`text-sm sm:text-base md:text-xl font-bold truncate w-full text-center md:text-left ${getColorClass(item.color)}`}>
                        {item.value}
                    </span>
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
