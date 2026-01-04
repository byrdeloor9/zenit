/**
 * FilterSection - Collapsible filter section with title
 * Reusable component for sidebar filters
 */

import { ReactNode } from 'react'

interface FilterSectionProps {
    title: string
    children: ReactNode
    defaultOpen?: boolean
    className?: string
}

export function FilterSection({
    title,
    children,
    defaultOpen = true,
    className = ''
}: FilterSectionProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {title}
            </h4>
            <div className="space-y-1.5">
                {children}
            </div>
        </div>
    )
}
