/**
 * Dashboard Page - Redesigned with Tailwind CSS
 */

import { Dashboard } from '../components/dashboard/Dashboard'
import { Alert } from '../components/ui/Alert'
import { useDashboard } from '../hooks'

export function DashboardPage(): JSX.Element {
  const { data: stats, loading, error } = useDashboard()



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    console.error('Dashboard error:', error)
    return <Alert type="error" message={error} />
  }

  if (!stats) {
    return <Alert type="error" message="No data available" />
  }

  return <Dashboard stats={stats} />
}