/**
 * StatsGrid component - Grid of statistics cards redesigned with Tailwind CSS
 */

import { StatCard } from '../ui/StatCard'
import { formatCurrency } from '../../utils/formatters'
import type { DashboardStats } from '../../types'

interface StatsGridProps {
  stats: DashboardStats
}

export function StatsGrid({ stats }: StatsGridProps): JSX.Element {
  const netBalance = parseFloat(stats.total_income) - parseFloat(stats.total_expenses)
  
  return (
    <div className="space-y-6">
      {/* Primary Stats - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Balance Total"
          value={formatCurrency(stats.total_balance)}
          icon="💰"
          color="indigo"
        />
        
        <StatCard
          title="Ingresos (30 días)"
          value={formatCurrency(stats.total_income)}
          icon="📈"
          color="green"
        />
        
        <StatCard
          title="Gastos (30 días)"
          value={formatCurrency(stats.total_expenses)}
          icon="📉"
          color="red"
        />
        
        <StatCard
          title="Neto (30 días)"
          value={formatCurrency(netBalance.toString())}
          icon="💵"
          color={netBalance >= 0 ? "green" : "red"}
        />
      </div>

      {/* Secondary Stats - 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Cuentas Activas"
          value={stats.accounts_count.toString()}
          icon="🏦"
          color="blue"
        />
        
        <StatCard
          title="Metas en Progreso"
          value={stats.goals_summary.in_progress.toString()}
          icon="🎯"
          color="purple"
        />
        
        <StatCard
          title="Metas Completadas"
          value={stats.goals_summary.completed.toString()}
          icon="✅"
          color="green"
        />
      </div>
    </div>
  )
}