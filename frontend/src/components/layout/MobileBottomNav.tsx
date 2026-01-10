
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, AccountBalanceWallet, PieChart, TrendingUp } from '@mui/icons-material'

export function MobileBottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        { id: 'dashboard', label: 'Inicio', icon: <Home />, path: '/', color: 'text-indigo-600' },
        { id: 'finances', label: 'Finanzas', icon: <AccountBalanceWallet />, path: '/financial-management', color: 'text-emerald-600' },
        { id: 'planning', label: 'Planes', icon: <TrendingUp />, path: '/planning', color: 'text-amber-600' },
        { id: 'analysis', label: 'Análisis', icon: <PieChart />, path: '/analysis', color: 'text-cyan-600' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:hidden">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className={`transition-transform duration-200 ${active ? '-translate-y-1' : ''}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-medium transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
                                {item.label}
                            </span>
                            {active && (
                                <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
