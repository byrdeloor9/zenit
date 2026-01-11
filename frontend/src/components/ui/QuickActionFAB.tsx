import { useNavigate } from 'react-router-dom'

interface QuickActionFABProps {
    label?: string
    onClick?: () => void
    navigateTo?: string
    mobileOnly?: boolean
    className?: string
}

export function QuickActionFAB({
    label = 'Nuevo',
    onClick,
    navigateTo,
    mobileOnly = false,
    className = ''
}: QuickActionFABProps): JSX.Element {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else if (navigateTo) {
            navigate(navigateTo)
        }
    }

    return (
        <div className={`fixed bottom-24 lg:bottom-8 right-6 flex items-center gap-3 z-30 ${mobileOnly ? 'lg:hidden' : ''} ${className}`}>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                {label}
            </span>
            <button
                onClick={handleClick}
                className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700 group"
            >
                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900">
                    <span className="text-xl font-medium leading-none mb-0.5">+</span>
                </div>
            </button>
        </div>
    )
}
