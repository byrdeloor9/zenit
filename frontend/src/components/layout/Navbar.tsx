/**
 * Navbar component - Responsive with Tailwind CSS
 */

import { useState } from 'react'
import {
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
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { PremiumTabs } from './PremiumTabs'

export function Navbar(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleNavigate = (path: string): void => {
    navigate(path)
    setIsUserMenuOpen(false)
  }

  const handleLogout = (): void => {
    logout()
    setIsUserMenuOpen(false)
  }

  const handleUserMenuToggle = (): void => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  return (
    <>
      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Mobile Only */}
            <div className="flex-shrink-0 flex items-center lg:hidden">
              <div className="w-8 h-8 mr-2">
                <img src="/logo.png" alt="Zenit Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Zénit
              </span>
            </div>

            {/* Center Section - Secondary Navigation (Tabs) for Desktop */}
            <div className="hidden lg:flex flex-1 items-center justify-center px-8">
              {location.pathname === '/financial-management' && (
                <PremiumTabs
                  tabs={[
                    { id: 'accounts', label: 'Cuentas', icon: <Savings />, path: '/financial-management?tab=accounts', colorClass: 'text-sky-500' },
                    { id: 'transactions', label: 'Transacciones', icon: <Description />, path: '/financial-management?tab=transactions', colorClass: 'text-emerald-500' },
                    { id: 'transfers', label: 'Transferencias', icon: <SwapVerticalCircle />, path: '/financial-management?tab=transfers', colorClass: 'text-violet-500' },
                    { id: 'categories', label: 'Categorías', icon: <Widgets />, path: '/financial-management?tab=categories', colorClass: 'text-amber-500' },
                  ]}
                  activeTabId={
                    location.search.includes('tab=transactions') ? 'transactions' :
                      location.search.includes('tab=transfers') ? 'transfers' :
                        location.search.includes('tab=categories') ? 'categories' :
                          'accounts'
                  }
                  onTabClick={handleNavigate}
                  colorScheme="indigo"
                  variant="minimal"
                />
              )}

              {location.pathname === '/planning' && (
                <PremiumTabs
                  tabs={[
                    { id: 'budgets', label: 'Presupuestos', icon: <AccountBalanceWallet />, path: '/planning?tab=budgets', colorClass: 'text-emerald-500' },
                    { id: 'investments', label: 'Metas e Inversiones', icon: <EmojiEvents />, path: '/planning?tab=investments', colorClass: 'text-amber-500' },
                    { id: 'recurring-transactions', label: 'Recurrentes', icon: <EventRepeat />, path: '/planning?tab=recurring-transactions', colorClass: 'text-indigo-500' },
                    { id: 'debts', label: 'Deudas', icon: <CreditCard />, path: '/planning?tab=debts', colorClass: 'text-rose-500' },
                  ]}
                  activeTabId={
                    location.search.includes('tab=investments') || location.search.includes('tab=goals') ? 'investments' :
                      location.search.includes('tab=recurring') ? 'recurring-transactions' :
                        location.search.includes('tab=debts') ? 'debts' :
                          'budgets'
                  }
                  onTabClick={handleNavigate}
                  colorScheme="emerald"
                  variant="minimal"
                />
              )}

              {location.pathname === '/analysis' && (
                <PremiumTabs
                  tabs={[
                    { id: 'projections', label: 'Proyecciones', icon: <Timeline />, path: '/analysis?tab=projections', colorClass: 'text-cyan-500' },
                    { id: 'trends', label: 'Tendencias', icon: <DonutLarge />, path: '/analysis?tab=trends', colorClass: 'text-fuchsia-500' },
                    { id: 'reports', label: 'Reportes', icon: <InsertChart />, path: '/analysis?tab=reports', colorClass: 'text-blue-500' },
                    { id: 'alerts', label: 'Alertas', icon: <NotificationsActive />, path: '/analysis?tab=alerts', colorClass: 'text-yellow-500' },
                  ]}
                  activeTabId={
                    location.search.includes('tab=trends') ? 'trends' :
                      location.search.includes('tab=reports') ? 'reports' :
                        location.search.includes('tab=alerts') ? 'alerts' :
                          'projections'
                  }
                  onTabClick={handleNavigate}
                  colorScheme="cyan"
                  variant="minimal"
                />
              )}
            </div>

            {/* Right Section: Search, Theme, User */}
            <div className="flex items-center space-x-3 ml-auto">
              {/* Theme Toggle */}
              <div className="lg:hidden">
                <ThemeToggle />
              </div>

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md border-2 border-white dark:border-gray-700">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>

                        <button
                          onClick={() => handleNavigate('/profile')}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <PersonIcon className="mr-3 text-lg" />
                          Mi Perfil
                        </button>

                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogoutIcon className="mr-3 text-lg" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}