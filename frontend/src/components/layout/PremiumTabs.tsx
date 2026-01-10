/**
 * PremiumTabs - Enhanced tabs component with animated underline and premium effects
 */

import { useEffect, useRef, useState } from 'react'

interface TabItem {
    id: string
    label: string
    icon: React.ReactNode
    path: string
    colorClass?: string
}

interface PremiumTabsProps {
    tabs: TabItem[]
    activeTabId: string
    onTabClick: (path: string) => void
    colorScheme?: 'indigo' | 'emerald' | 'cyan'
    variant?: 'default' | 'minimal'
}

export function PremiumTabs({ tabs, activeTabId, onTabClick, colorScheme = 'indigo', variant = 'default' }: PremiumTabsProps): JSX.Element {
    const tabsRef = useRef<Map<string, HTMLButtonElement>>(new Map())
    const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 })

    const colorClasses = {
        indigo: {
            active: 'text-indigo-600 dark:text-indigo-400',
            underline: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
            shadow: 'shadow-indigo-500/50',
        },
        emerald: {
            active: 'text-emerald-600 dark:text-emerald-400',
            underline: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
            shadow: 'shadow-emerald-500/50',
        },
        cyan: {
            active: 'text-cyan-600 dark:text-cyan-400',
            underline: 'bg-gradient-to-r from-cyan-600 to-cyan-500',
            shadow: 'shadow-cyan-500/50',
        },
    }

    const colors = colorClasses[colorScheme]

    useEffect(() => {
        const activeButton = tabsRef.current.get(activeTabId)
        if (activeButton && variant === 'default') { // Only apply underline for default variant
            const { offsetLeft, offsetWidth } = activeButton
            setUnderlineStyle({
                left: offsetLeft,
                width: offsetWidth,
            })
        }
    }, [activeTabId, variant])

    const setTabRef = (id: string) => (el: HTMLButtonElement | null) => {
        if (el) {
            tabsRef.current.set(id, el)
        } else {
            tabsRef.current.delete(id)
        }
    }

    if (variant === 'minimal') {
        return (
            <div className="flex justify-center">
                <div className="inline-flex rounded-xl p-1 gap-1 lg:gap-2 bg-gray-100 dark:bg-gray-800">
                    {tabs.map((tab) => {
                        const isActive = activeTabId === tab.id

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabClick(tab.path)}
                                className={`
                                    relative flex items-center justify-center lg:px-4 lg:py-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                    }
                                `}
                            >
                                <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2">
                                    <span className={`text-lg lg:text-base ${isActive ? tab.colorClass : 'text-gray-400 dark:text-gray-500'}`}>
                                        {tab.icon}
                                    </span>
                                    <span className="text-[10px] lg:text-sm font-medium lg:truncate">
                                        {tab.label}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Default variant with animated underline
    return (
        <div className="relative flex justify-center gap-2 py-2 w-full">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId

                return (
                    <button
                        key={tab.id}
                        ref={setTabRef(tab.id)}
                        onClick={() => onTabClick(tab.path)}
                        className={`
                            relative flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 px-4 py-2 
                            text-xs lg:text-sm font-medium 
                            transition-all duration-200 
                            rounded-lg
                            hover:bg-gray-50 dark:hover:bg-gray-800
                            group
                            ${isActive ? colors.active : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}
                        `}
                    >
                        <span className={`
                            text-2xl lg:text-lg mb-0.5 lg:mb-0
                            transition-all duration-200
                            ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}
                            ${tab.colorClass || ''}
                        `}>
                            {tab.icon}
                        </span>

                        {/* Mobile Label (Truncated 8 chars) */}
                        <span className="lg:hidden truncate max-w-[80px]" title={tab.label}>
                            {tab.label.length > 8 ? `${tab.label.substring(0, 8)}.` : tab.label}
                        </span>

                        {/* Desktop Label (Full) */}
                        <span className="hidden lg:inline whitespace-nowrap">
                            {tab.label}
                        </span>
                    </button>
                )
            })}

            {/* Animated Underline */}
            <div
                className={`
                    absolute bottom-0 h-0.5 
                    ${colors.underline} 
                    rounded-full 
                    shadow-sm ${colors.shadow}
                    transition-all duration-300 ease-out
                `}
                style={{
                    width: `${underlineStyle.width}px`,
                    transform: `translateX(${underlineStyle.left}px)`,
                }}
            />
        </div>
    )
}
