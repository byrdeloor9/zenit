import { useNavigate, useLocation } from 'react-router-dom'
import {
    Dashboard as DashboardIcon,
    AccountBalance,
    AccountBalanceWallet,
    ShowChart,
    Logout,
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
            icon: <DashboardIcon className="text-2xl" />,
            colorClass: 'text-indigo-500',
            activeBg: 'bg-indigo-50 dark:bg-indigo-900/20',
            label: 'Dashboard',
        },
        {
            id: 'financial',
            path: '/financial-management',
            icon: <AccountBalance className="text-2xl" />,
            colorClass: 'text-emerald-500',
            activeBg: 'bg-emerald-50 dark:bg-emerald-900/20',
            label: 'Finanzas',
        },
        {
            id: 'planning',
            path: '/planning',
            icon: <AccountBalanceWallet className="text-2xl" />,
            colorClass: 'text-amber-500',
            activeBg: 'bg-amber-50 dark:bg-amber-900/20',
            label: 'Planificación',
        },
        {
            id: 'analysis',
            path: '/analysis',
            icon: <ShowChart className="text-2xl" />,
            colorClass: 'text-cyan-500',
            activeBg: 'bg-cyan-50 dark:bg-cyan-900/20',
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
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => navigate('/')}>
                    <span className="text-white font-bold text-xl">Z</span>
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col items-center py-6 gap-6">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`
                group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                ${active ? item.activeBg : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
              `}
                            title={item.label}
                        >
                            <span className={`
                transition-all duration-200 
                ${active ? item.colorClass : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}
                ${active ? 'scale-110 drop-shadow-sm' : ''}
              `}>
                                {item.icon}
                            </span>

                            {/* Active Indicator (Left styling) */}
                            {active && (
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${item.colorClass.replace('text-', 'bg-')}`} />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Bottom Actions: Theme Toggle & Logout */}
            <div className="pb-6 flex flex-col items-center gap-4">
                <ThemeToggle size="medium" />

                <button
                    onClick={logout}
                    className="group flex items-center justify-center w-12 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    title="Cerrar Sesión"
                >
                    <Logout className="text-gray-400 group-hover:text-red-500 transition-colors duration-200 text-2xl" />
                </button>
            </div>
        </div>
    )
}
