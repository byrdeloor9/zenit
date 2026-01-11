
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    SpaceDashboardTwoTone,
    AccountBalanceTwoTone,
    AssignmentTwoTone,
    PieChartTwoTone,
    Savings,
    Description,
    SwapVerticalCircle,
    Widgets,
    AccountBalanceWallet,
    EmojiEvents,
    EventRepeat,
    CreditCard,
    Timeline,
    DonutLarge,
    InsertChart,
    NotificationsActive,
    Check
} from '@mui/icons-material'

interface SubOption {
    id: string
    label: string
    path: string
    icon: React.ReactNode
}

interface NavItem {
    id: string
    label: string
    icon: React.ReactNode
    path: string
    subOptions?: SubOption[]
}

export function MobileBottomNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    const navItems: NavItem[] = [
        { id: 'dashboard', label: 'Inicio', icon: <SpaceDashboardTwoTone />, path: '/' },
        {
            id: 'finances',
            label: 'Finanzas',
            icon: <AccountBalanceTwoTone />,
            path: '/financial-management',
            subOptions: [
                { id: 'accounts', label: 'Cuentas', path: '/financial-management?tab=accounts', icon: <Savings /> },
                { id: 'transactions', label: 'Transacciones', path: '/financial-management?tab=transactions', icon: <Description /> },
                { id: 'transfers', label: 'Transferencias', path: '/financial-management?tab=transfers', icon: <SwapVerticalCircle /> },
                { id: 'categories', label: 'Categorías', path: '/financial-management?tab=categories', icon: <Widgets /> },
            ]
        },
        {
            id: 'planning',
            label: 'Planes',
            icon: <AssignmentTwoTone />,
            path: '/planning',
            subOptions: [
                { id: 'budgets', label: 'Presupuestos', path: '/planning?tab=budgets', icon: <AccountBalanceWallet /> },
                { id: 'investments', label: 'Metas e Inv.', path: '/planning?tab=investments', icon: <EmojiEvents /> },
                { id: 'recurring-transactions', label: 'Recurrentes', path: '/planning?tab=recurring-transactions', icon: <EventRepeat /> },
                { id: 'debts', label: 'Deudas', path: '/planning?tab=debts', icon: <CreditCard /> },
            ]
        },
        {
            id: 'analysis',
            label: 'Análisis',
            icon: <PieChartTwoTone />,
            path: '/analysis',
            subOptions: [
                { id: 'projections', label: 'Proyecciones', icon: <Timeline />, path: '/analysis?tab=projections' },
                { id: 'trends', label: 'Tendencias', icon: <DonutLarge />, path: '/analysis?tab=trends' },
                { id: 'reports', label: 'Reportes', icon: <InsertChart />, path: '/analysis?tab=reports' },
                { id: 'alerts', label: 'Alertas', icon: <NotificationsActive />, path: '/analysis?tab=alerts' },
            ]
        },
    ]

    const handleNavClick = (item: NavItem) => {
        if (item.subOptions) {
            // Toggle menu if clicking the same item, otherwise open new menu
            // Do NOT navigate to the path automatically
            setActiveMenuId(prev => prev === item.id ? null : item.id)
        } else {
            navigate(item.path)
            setActiveMenuId(null)
        }
    }

    const handleSubOptionClick = (path: string) => {
        navigate(path)
        setActiveMenuId(null)
    }

    const currentMenu = navItems.find(i => i.id === activeMenuId)

    return (
        <>
            {/* Backdrop */}
            {activeMenuId && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
                    onClick={() => setActiveMenuId(null)}
                />
            )}

            {/* Bottom Sheet Menu */}
            <div className={`
                fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-40 rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]
                transform transition-transform duration-300 ease-out border-t border-gray-100 dark:border-gray-800
                ${activeMenuId ? 'translate-y-0' : 'translate-y-[120%]'}
            `}>
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-2" onClick={() => setActiveMenuId(null)}>
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                <div className="p-4 pb-24 space-y-2 max-h-[70vh] overflow-y-auto">
                    {currentMenu?.subOptions?.map((option) => {
                        const isOptionActive = location.search.includes(option.path.split('?')[1] || 'nevermatch')
                            || (option.id === currentMenu.subOptions![0].id && !location.search.includes('tab='))
                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSubOptionClick(option.path)}
                                className={`
                                    w-full flex items-center p-4 rounded-xl transition-all duration-200
                                    ${isOptionActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'}
                                `}
                            >
                                <span className={`mr-4 ${isOptionActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                    {option.icon}
                                </span>
                                <span className="text-lg">{option.label}</span>
                                {isOptionActive && <Check className="ml-auto text-indigo-600" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Nav Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 lg:hidden">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {navItems.map((item) => {
                        const active = isActive(item.path)
                        // If menu is open matching this item, highlight it too
                        const isMenuOpen = activeMenuId === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${active || isMenuOpen
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className={`transition-transform duration-200 ${active || isMenuOpen ? '-translate-y-0.5' : ''}`}>
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
        </>
    )
}
