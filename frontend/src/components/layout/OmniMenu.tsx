import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExpandMore, Check } from '@mui/icons-material'

interface Option {
    id: string
    label: string
    path: string
    icon?: React.ReactNode
}

interface OmniMenuProps {
    title: string
    options: Option[]
    activePath: string
}

export function OmniMenu({ title, options, activePath }: OmniMenuProps): JSX.Element {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (path: string) => {
        navigate(path)
        setIsOpen(false)
    }

    return (
        <>
            {/* Header Title Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1 -ml-2 px-3 py-2 rounded-xl active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
            >
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {title}
                </span>
                <ExpandMore className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Bottom Sheet Menu */}
            <div className={`
        fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 rounded-t-[2rem] shadow-2xl
        transform transition-transform duration-300 ease-out border-t border-gray-100 dark:border-gray-800
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-1" onClick={() => setIsOpen(false)}>
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                        Ir a...
                    </h3>
                </div>

                {/* Options */}
                <div className="p-4 pb-8 space-y-2">
                    {options.map((option) => {
                        const isActive = activePath.includes(option.path.split('?')[1] || 'nevermatch')
                            || (option.id === options[0].id && !activePath.includes('tab='))

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.path)}
                                className={`
                  w-full flex items-center p-4 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'}
                `}
                            >
                                {option.icon && (
                                    <span className={`mr-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                        {option.icon}
                                    </span>
                                )}
                                <span className="text-lg">{option.label}</span>
                                {isActive && <Check className="ml-auto text-indigo-600" />}
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
