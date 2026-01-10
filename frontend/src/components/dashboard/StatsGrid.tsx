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
      {/* Mobile: Horizontal Scroll | Desktop: Grid */}
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x scrollbar-hide -mx-4 px-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 sm:gap-6 sm:px-0 lg:grid-cols-4">

        <div className="min-w-[85vw] sm:min-w-0 snap-center">
          <StatCard
            title="Balance Total"
            value={formatCurrency(stats.total_balance)}
            icon={<AccountBalance fontSize="medium" />}
            color="indigo"
            variant="filled"
            trend={{ value: 2.5, isPositive: true }}
            className="h-full"
          />
        </div>

        <div className="min-w-[85vw] sm:min-w-0 snap-center">
          <StatCard
            title="Ingresos (30 días)"
            value={formatCurrency(stats.total_income)}
            icon={<TrendingUp fontSize="medium" />}
            color="emerald"
            variant="filled"
            trend={{ value: 5.0, isPositive: true }}
            className="h-full"
          />
        </div>

        <div className="min-w-[85vw] sm:min-w-0 snap-center">
          <StatCard
            title="Gastos (30 días)"
            value={formatCurrency(stats.total_expenses)}
            icon={<TrendingDown fontSize="medium" />}
            color="rose"
            variant="filled"
            trend={{ value: 1.2, isPositive: false }}
            className="h-full"
          />
        </div>

        <div className="min-w-[85vw] sm:min-w-0 snap-center">
          <StatCard
            title="Neto (30 días)"
            value={formatCurrency(netBalance.toString())}
            icon={<Savings fontSize="medium" />}
            color={netBalance >= 0 ? "sky" : "rose"}
            variant="filled"
            trend={{ value: 4.1, isPositive: netBalance >= 0 }}
            className="h-full"
          />
        </div>
      </div>

      {/* Secondary Stats Removed as per request */}
    </div>
  )
}