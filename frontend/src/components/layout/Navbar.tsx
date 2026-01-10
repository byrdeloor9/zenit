/**
 * Navbar component - Responsive with Tailwind CSS
 */

import { useState, useEffect } from 'react'
import {
  Dashboard as DashboardIcon,
  AccountBalance,
  TrendingUp,
  Receipt,
  Category,
  AccountBalanceWallet,
  EmojiEvents,
  SwapHoriz,
  CreditCard,
  Repeat,
  ShowChart,
  ExpandMore,
  Folder,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications,
  Assessment,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { PremiumTabs } from './PremiumTabs'

export function Navbar(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFinanceOpen, setIsFinanceOpen] = useState(false)
  const [isPlanningOpen, setIsPlanningOpen] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const isActive = (path: string): boolean => location.pathname === path

  const isCategoryActive = (paths: string[]): boolean => {
    return paths.some(path => location.pathname === path)
  }

  const handleNavigate = (path: string): void => {

    navigate(path)
    setIsMobileMenuOpen(false)
    setIsFinanceOpen(false)
    setIsPlanningOpen(false)
    setIsAnalysisOpen(false)
    setIsUserMenuOpen(false)
  }

  const handleLogout = (): void => {
    logout()
    setIsUserMenuOpen(false)
  }

  const handleFinanceToggle = (): void => {
    setIsPlanningOpen(false)
    setIsAnalysisOpen(false)
    setIsUserMenuOpen(false)
    setIsFinanceOpen(!isFinanceOpen)
  }

  const handlePlanningToggle = (): void => {
    setIsFinanceOpen(false)
    setIsAnalysisOpen(false)
    setIsUserMenuOpen(false)
    setIsPlanningOpen(!isPlanningOpen)
  }

  const handleAnalysisToggle = (): void => {
    setIsFinanceOpen(false)
    setIsPlanningOpen(false)
    setIsUserMenuOpen(false)
    setIsAnalysisOpen(!isAnalysisOpen)
  }

  const handleUserMenuToggle = (): void => {
    setIsFinanceOpen(false)
    setIsPlanningOpen(false)
    setIsAnalysisOpen(false)
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="/zenit_logo.jpg"
                  alt="Zenit Logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Zénit
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Dashboard */}
              <Link
                to="/"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/')
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <DashboardIcon className="mr-2 text-lg" />
                Dashboard
              </Link>

              {/* Finanzas Dropdown */}
              <div className="relative">
                <button
                  onClick={handleFinanceToggle}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${isCategoryActive(['/financial-management'])
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  <AccountBalance className="mr-2 text-lg" />
                  Finanzas
                  <ExpandMore className="ml-1 text-sm" />
                </button>

                {isFinanceOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <button
                      onClick={() => handleNavigate('/financial-management?tab=accounts')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <AccountBalance className="mr-3 text-lg" />
                      Cuentas
                    </button>
                    <button
                      onClick={() => handleNavigate('/financial-management?tab=transactions')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Receipt className="mr-3 text-lg" />
                      Transacciones
                    </button>
                    <button
                      onClick={() => handleNavigate('/financial-management?tab=transfers')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <SwapHoriz className="mr-3 text-lg" />
                      Transferencias
                    </button>
                    <button
                      onClick={() => handleNavigate('/financial-management?tab=categories')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Category className="mr-3 text-lg" />
                      Categorías
                    </button>
                  </div>
                )}
              </div>

              {/* Planificación Dropdown */}
              <div className="relative">
                <button
                  onClick={handlePlanningToggle}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${isCategoryActive(['/planning'])
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  <Folder className="mr-2 text-lg" />
                  Planificación
                  <ExpandMore className="ml-1 text-sm" />
                </button>

                {isPlanningOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <button
                      onClick={() => handleNavigate('/planning?tab=budgets')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <AccountBalanceWallet className="mr-3 text-lg" />
                      Presupuestos
                    </button>
                    <button
                      onClick={() => handleNavigate('/planning?tab=investments')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <EmojiEvents className="mr-3 text-lg" />
                      Inversiones
                    </button>
                    <button
                      onClick={() => handleNavigate('/planning?tab=recurring-transactions')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                    >
                      <Repeat className="mr-3 text-lg" />
                      Transacciones Recurrentes
                    </button>
                    <button
                      onClick={() => handleNavigate('/planning?tab=debts')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <CreditCard className="mr-3 text-lg" />
                      Deudas
                    </button>
                  </div>
                )}
              </div>

              {/* Análisis Dropdown */}
              <div className="relative">
                <button
                  onClick={handleAnalysisToggle}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${isCategoryActive(['/analysis'])
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  <ShowChart className="mr-2 text-lg" />
                  Análisis
                  <ExpandMore className="ml-1 text-sm" />
                </button>

                {isAnalysisOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <button
                      onClick={() => handleNavigate('/analysis?tab=projections')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ShowChart className="mr-3 text-lg" />
                      Proyecciones
                    </button>
                    <button
                      onClick={() => handleNavigate('/analysis?tab=trends')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <TrendingUp className="mr-3 text-lg" />
                      Tendencias
                    </button>
                    <button
                      onClick={() => handleNavigate('/analysis?tab=reports')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Assessment className="mr-3 text-lg" />
                      Reportes
                    </button>
                    <button
                      onClick={() => handleNavigate('/analysis?tab=alerts')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Notifications className="mr-3 text-lg" />
                      Alertas
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side - Theme Toggle + User Menu */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      <button
                        onClick={() => handleNavigate('/profile')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <PersonIcon className="mr-3 text-lg" />
                        Mi Perfil
                      </button>

                      <div className="border-t border-gray-200 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogoutIcon className="mr-3 text-lg" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden mobile-menu-button p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <CloseIcon className="text-gray-600" />
                ) : (
                  <MenuIcon className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Tabs Bar - Only shown on sections with sub-pages */}
      {(location.pathname === '/financial-management' ||
        location.pathname === '/planning' ||
        location.pathname === '/analysis') && (
          <div className="sticky top-16 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-saturate-150 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="overflow-x-auto scrollbar-hide">
                {/* Financial Management Tabs */}
                {location.pathname === '/financial-management' && (
                  <PremiumTabs
                    tabs={[
                      { id: 'accounts', label: 'Cuentas', icon: <AccountBalance />, path: '/financial-management?tab=accounts' },
                      { id: 'transactions', label: 'Transacciones', icon: <Receipt />, path: '/financial-management?tab=transactions' },
                      { id: 'transfers', label: 'Transferencias', icon: <SwapHoriz />, path: '/financial-management?tab=transfers' },
                      { id: 'categories', label: 'Categorías', icon: <Category />, path: '/financial-management?tab=categories' },
                    ]}
                    activeTabId={
                      location.search.includes('tab=transactions') ? 'transactions' :
                        location.search.includes('tab=transfers') ? 'transfers' :
                          location.search.includes('tab=categories') ? 'categories' :
                            'accounts'
                    }
                    onTabClick={handleNavigate}
                    colorScheme="indigo"
                  />
                )}

                {/* Planning Tabs */}
                {location.pathname === '/planning' && (
                  <PremiumTabs
                    tabs={[
                      { id: 'budgets', label: 'Presupuestos', icon: <AccountBalanceWallet />, path: '/planning?tab=budgets' },
                      { id: 'investments', label: 'Metas e Inversiones', icon: <EmojiEvents />, path: '/planning?tab=investments' },
                      { id: 'recurring-transactions', label: 'Recurrentes', icon: <Repeat />, path: '/planning?tab=recurring-transactions' },
                      { id: 'debts', label: 'Deudas', icon: <CreditCard />, path: '/planning?tab=debts' },
                    ]}
                    activeTabId={
                      location.search.includes('tab=investments') || location.search.includes('tab=goals') ? 'investments' :
                        location.search.includes('tab=recurring') ? 'recurring-transactions' :
                          location.search.includes('tab=debts') ? 'debts' :
                            'budgets'
                    }
                    onTabClick={handleNavigate}
                    colorScheme="emerald"
                  />
                )}

                {/* Analysis Tabs */}
                {location.pathname === '/analysis' && (
                  <PremiumTabs
                    tabs={[
                      { id: 'projections', label: 'Proyecciones', icon: <ShowChart />, path: '/analysis?tab=projections' },
                      { id: 'trends', label: 'Tendencias', icon: <TrendingUp />, path: '/analysis?tab=trends' },
                      { id: 'reports', label: 'Reportes', icon: <Assessment />, path: '/analysis?tab=reports' },
                      { id: 'alerts', label: 'Alertas', icon: <Notifications />, path: '/analysis?tab=alerts' },
                    ]}
                    activeTabId={
                      location.search.includes('tab=trends') ? 'trends' :
                        location.search.includes('tab=reports') ? 'reports' :
                          location.search.includes('tab=alerts') ? 'alerts' :
                            'projections'
                    }
                    onTabClick={handleNavigate}
                    colorScheme="cyan"
                  />
                )}
              </div>
            </div>
          </div>
        )}

      {/* Mobile Menu Overlay - Sidebar desliza desde la derecha */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Sidebar - Desliza desde la derecha para consistencia con botón hamburguesa */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl mobile-menu transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    src="/zenit_logo.jpg"
                    alt="Zenit Logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    Zénit
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-50"
                >
                  <CloseIcon className="text-gray-600" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-2">
                  {/* Dashboard */}
                  <button
                    onClick={() => handleNavigate('/')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${isActive('/')
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <DashboardIcon className="mr-3 text-xl" />
                    Dashboard
                  </button>

                  {/* Finanzas */}
                  <div>
                    <button
                      onClick={handleFinanceToggle}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left transition-colors ${isCategoryActive(['/financial-management'])
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center">
                        <AccountBalance className="mr-3 text-xl" />
                        Finanzas
                      </div>
                      <ExpandMore className={`text-sm transition-transform ${isFinanceOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isFinanceOpen && (
                      <div className="ml-4 mt-2 space-y-1">
                        <button
                          onClick={() => handleNavigate('/financial-management?tab=accounts')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <AccountBalance className="mr-3 text-lg" />
                          Cuentas
                        </button>
                        <button
                          onClick={() => handleNavigate('/financial-management?tab=transactions')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <Receipt className="mr-3 text-lg" />
                          Transacciones
                        </button>
                        <button
                          onClick={() => handleNavigate('/financial-management?tab=transfers')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <SwapHoriz className="mr-3 text-lg" />
                          Transferencias
                        </button>
                        <button
                          onClick={() => handleNavigate('/financial-management?tab=categories')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <Category className="mr-3 text-lg" />
                          Categorías
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Planificación */}
                  <div>
                    <button
                      onClick={handlePlanningToggle}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left transition-colors ${isCategoryActive(['/planning'])
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center">
                        <Folder className="mr-3 text-xl" />
                        Planificación
                      </div>
                      <ExpandMore className={`text-sm transition-transform ${isPlanningOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isPlanningOpen && (
                      <div className="ml-4 mt-2 space-y-1">
                        <button
                          onClick={() => handleNavigate('/planning?tab=budgets')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <AccountBalanceWallet className="mr-3 text-lg" />
                          Presupuestos
                        </button>
                        <button
                          onClick={() => handleNavigate('/planning?tab=investments')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <EmojiEvents className="mr-3 text-lg" />
                          Inversiones
                        </button>
                        <button
                          onClick={() => handleNavigate('/planning?tab=recurring-transactions')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <Repeat className="mr-3 text-lg" />
                          Transacciones Recurrentes
                        </button>
                        <button
                          onClick={() => handleNavigate('/planning?tab=debts')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <CreditCard className="mr-3 text-lg" />
                          Deudas
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Análisis */}
                  <div>
                    <button
                      onClick={handleAnalysisToggle}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left transition-colors ${isCategoryActive(['/analysis'])
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-50 dark:text-indigo-700 dark:border-indigo-200'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center">
                        <ShowChart className="mr-3 text-xl" />
                        Análisis
                      </div>
                      <ExpandMore className={`text-sm transition-transform ${isAnalysisOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAnalysisOpen && (
                      <div className="ml-4 mt-2 space-y-1">
                        <button
                          onClick={() => handleNavigate('/analysis?tab=projections')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <ShowChart className="mr-3 text-lg" />
                          Proyecciones
                        </button>
                        <button
                          onClick={() => handleNavigate('/analysis?tab=trends')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <TrendingUp className="mr-3 text-lg" />
                          Tendencias
                        </button>
                        <button
                          onClick={() => handleNavigate('/analysis?tab=reports')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <Assessment className="mr-3 text-lg" />
                          Reportes
                        </button>
                        <button
                          onClick={() => handleNavigate('/analysis?tab=alerts')}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left"
                        >
                          <Notifications className="mr-3 text-lg" />
                          Alertas
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </nav>

              {/* Mobile Footer */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(isFinanceOpen || isPlanningOpen || isAnalysisOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsFinanceOpen(false)
            setIsPlanningOpen(false)
            setIsAnalysisOpen(false)
            setIsUserMenuOpen(false)
          }}
        />
      )}
    </>
  )
}