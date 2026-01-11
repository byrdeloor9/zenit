import { useNavigate, useLocation } from 'react-router-dom'
import {
    SpaceDashboardTwoTone,
    AccountBalanceTwoTone,
    AssignmentTwoTone,
    PieChartTwoTone,
    LogoutTwoTone,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()

    const navItems = [
        {
            id: 'dashboard',
            path: '/dashboard',
            icon: <SpaceDashboardTwoTone className="text-2xl" />,
            label: 'Dashboard',
        },
        {
            id: 'financial',
            path: '/financial-management',
            icon: <AccountBalanceTwoTone className="text-2xl" />,
            label: 'Finanzas',
        },
        {
            id: 'planning',
            path: '/planning',
            icon: <AssignmentTwoTone className="text-2xl" />,
            label: 'Planificación',
        },
        {
            id: 'analysis',
            path: '/analysis',
            icon: <PieChartTwoTone className="text-2xl" />,
            label: 'Análisis',
        },
    ]

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <div className="hidden lg:flex flex-col w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 z-30">
            {/* Logo Area */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 flex items-center justify-center transform hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Zenit Logo" className="w-full h-full object-contain" />
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col items-center py-6 gap-4">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`
                group relative flex flex-col items-center justify-center w-16 py-3 rounded-xl transition-all duration-200
                ${active ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
              `}
                            title={item.label}
                        >
                            <span className={`
                transition-all duration-200 mb-1
                ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}
              `}>
                                {item.icon}
                            </span>

                            <span className={`text-[10px] font-medium leading-none max-w-full px-1 truncate ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500'
                                }`}>
                                {item.label}
                            </span>

                            {/* Active Indicator (Left styling) - Optional, simplified for clean look */}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Bottom Actions: Theme Toggle & Logout */}
            <div className="pb-6 flex flex-col items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 w-full">
                <ThemeToggle size="medium" />

                <button
                    onClick={logout}
                    className="group flex items-center justify-center w-12 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    title="Cerrar Sesión"
                >
                    <LogoutTwoTone className="text-gray-400 group-hover:text-red-500 transition-colors duration-200 text-2xl" />
                </button>
            </div>
        </div>
    )
}
