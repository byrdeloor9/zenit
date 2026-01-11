
import { useNavigate, useLocation } from 'react-router-dom'
import {
    SpaceDashboardTwoTone,
    AccountBalanceTwoTone,
    AssignmentTwoTone,
    PieChartTwoTone
} from '@mui/icons-material'

export function MobileBottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        { id: 'dashboard', label: 'Inicio', icon: <SpaceDashboardTwoTone />, path: '/' },
        { id: 'finances', label: 'Finanzas', icon: <AccountBalanceTwoTone />, path: '/financial-management' },
        { id: 'planning', label: 'Planes', icon: <AssignmentTwoTone />, path: '/planning' },
        { id: 'analysis', label: 'Análisis', icon: <PieChartTwoTone />, path: '/analysis' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 lg:hidden">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${active
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className={`transition-transform duration-200 ${active ? '-translate-y-0.5' : ''}`}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-medium leading-tight mt-0.5">
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
