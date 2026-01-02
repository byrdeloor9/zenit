/**
 * Dashboard component - Main container redesigned with Tailwind CSS
 */

import { Add as AddIcon, Assessment, Flag, AccountBalanceWallet } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { StatsGrid } from './StatsGrid'
import { TransactionList } from './TransactionList'
import { BudgetWarnings } from './BudgetWarnings'
import { MiniProjectionChart } from './MiniProjectionChart'
import { Button } from '../ui/Button'
import type { DashboardStats } from '../../types'

interface DashboardProps {
  stats: DashboardStats
}

export function Dashboard({ stats }: DashboardProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Resumen de tu actividad financiera</p>
        </div>

        {/* Right: Quick Actions + Nueva Transacción */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/planning?tab=investments')}
            size="sm"
            className="w-full sm:w-auto border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
          >
            <Flag className="mr-1.5" fontSize="small" />
            Nueva Meta
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/planning?tab=budgets')}
            size="sm"
            className="w-full sm:w-auto border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
          >
            <AccountBalanceWallet className="mr-1.5" fontSize="small" />
            Nuevo Presupuesto
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/analysis?tab=projections')}
            size="sm"
            className="w-full sm:w-auto border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-200"
          >
            <Assessment className="mr-1.5" fontSize="small" />
            Ver Análisis
          </Button>

          <Button
            onClick={() => navigate('/financial-management?tab=transactions')}
            size="sm"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border-0"
          >
            <AddIcon className="mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transactions */}
          <TransactionList transactions={stats.recent_transactions} />
        </div>

        {/* Right Column - Widgets (1/3) */}
        <div className="space-y-6">
          {/* Budget Warnings */}
          <BudgetWarnings budgets={stats.critical_budgets} />

          {/* Mini Projection Chart */}
          <MiniProjectionChart data={stats.mini_projection} finalBalance={stats.projection_final_balance} />
        </div>
      </div>
    </div>
  )
}