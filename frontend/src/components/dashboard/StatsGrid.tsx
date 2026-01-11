import { AccountBalance, TrendingUp, TrendingDown, Savings } from '@mui/icons-material'
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
      {/* Mobile: 2x2 Grid | Desktop: 1x4 Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Balance Total"
          value={formatCurrency(stats.total_balance)}
          icon={<AccountBalance fontSize="medium" />}
          color="indigo"
          variant="filled"
          trend={{ value: 2.5, isPositive: true }}
          className="h-full"
        />

        <StatCard
          title="Ingresos (30 días)"
          value={formatCurrency(stats.total_income)}
          icon={<TrendingUp fontSize="medium" />}
          color="emerald"
          variant="filled"
          trend={{ value: 5.0, isPositive: true }}
          className="h-full"
        />

        <StatCard
          title="Gastos (30 días)"
          value={formatCurrency(stats.total_expenses)}
          icon={<TrendingDown fontSize="medium" />}
          color="rose"
          variant="filled"
          trend={{ value: 1.2, isPositive: false }}
          className="h-full"
        />

        <StatCard
          title="Neto (30 días)"
          value={formatCurrency(netBalance.toString())}
          icon={<Savings fontSize="medium" />}
          color="blue"
          variant="filled"
          trend={{ value: 4.1, isPositive: netBalance >= 0 }}
          className="h-full"
        />
      </div>

      {/* Secondary Stats Removed as per request */}
    </div>
  )
}