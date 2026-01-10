/**
 * PremiumTabs - Enhanced tabs component with animated underline and premium effects
 */

import { useEffect, useRef, useState } from 'react'

interface TabItem {
    id: string
    label: string
    icon: React.ReactNode
    path: string
}

interface PremiumTabsProps {
    tabs: TabItem[]
    activeTabId: string
    onTabClick: (path: string) => void
    colorScheme?: 'indigo' | 'emerald' | 'cyan'
}

export function PremiumTabs({ tabs, activeTabId, onTabClick, colorScheme = 'indigo' }: PremiumTabsProps): JSX.Element {
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
        if (activeButton) {
            const { offsetLeft, offsetWidth } = activeButton
            setUnderlineStyle({
                left: offsetLeft,
                width: offsetWidth,
            })
        }
    }, [activeTabId])

    const setTabRef = (id: string) => (el: HTMLButtonElement | null) => {
        if (el) {
            tabsRef.current.set(id, el)
        } else {
            tabsRef.current.delete(id)
        }
    }

    return (
        <div className="relative flex gap-2 py-2">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId

                return (
                    <button
                        key={tab.id}
                        ref={setTabRef(tab.id)}
                        onClick={() => onTabClick(tab.path)}
                        className={`
              relative flex items-center gap-2 px-4 py-2.5 
              text-sm font-medium 
              transition-all duration-200 
              whitespace-nowrap
              rounded-t-lg
              hover:bg-gradient-to-b hover:from-gray-50/50 hover:to-transparent
              dark:hover:from-gray-700/30 dark:hover:to-transparent
              hover:scale-[1.02]
              group
              ${isActive ? colors.active : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}
            `}
                    >
                        <span className={`
              text-base 
              transition-all duration-200
              ${isActive ? 'scale-110' : 'group-hover:scale-105'}
            `}>
                            {tab.icon}
                        </span>
                        {tab.label}
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
