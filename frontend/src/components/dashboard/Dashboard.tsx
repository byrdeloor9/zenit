import {
  Notifications,
  AccountBalanceWallet,
  ReceiptLong
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { StatsGrid } from './StatsGrid'
import { TransactionList } from './TransactionList'
import { BudgetProjectionWidget } from './BudgetProjectionWidget'
import type { DashboardStats } from '../../types'

interface DashboardProps {
  stats: DashboardStats
}

export function Dashboard({ stats }: DashboardProps): JSX.Element {
  const navigate = useNavigate()
  const { user } = useAuth()

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Start with uppercase
  // const formattedDate = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section - Clean Style */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Bienvenido, {user?.first_name || 'Usuario'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-base font-medium">
            {today}
          </p>
        </div>

        {/* Right Actions: Icons & Avatar */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ReceiptLong className="text-xl" />
          </button>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Notifications className="text-xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>

          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600 ml-2">
            {/* Fallback avatar if no image */}
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold bg-gray-100 dark:bg-gray-800">
              {user?.first_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Row of 4 */}
      <StatsGrid stats={stats} />

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Transactions (7 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Transacciones Recientes
              </h2>
              <button
                onClick={() => navigate('/financial-management?tab=transactions')}
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Ver todas
              </button>
            </div>

            <TransactionList transactions={stats.recent_transactions} wrapper={false} />
          </div>
        </div>

        {/* Right Column: Widgets (5 columns) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 ">
          {/* Combined Budget & Projection Widget */}
          <BudgetProjectionWidget
            budgets={stats.budget_status}
            projectionData={stats.mini_projection}
          />
        </div>
      </div>

      {/* Quick Action FAB */}
      <div className="fixed bottom-24 lg:bottom-8 right-6 flex items-center gap-3 z-50">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          Quick Action
        </span>
        <button
          onClick={() => navigate('/financial-management?tab=transactions')}
          className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700 group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900">
            <span className="text-xl font-medium leading-none mb-0.5">+</span>
          </div>
        </button>
      </div>
    </div >
  )
}