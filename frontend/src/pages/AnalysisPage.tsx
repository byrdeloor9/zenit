/**
 * Analysis Page - Consolidated page with tabs for Projections, Trends, Reports, Alerts (migrated to Tailwind CSS)
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProjectionsTab } from '../components/analysis/ProjectionsTab'
import { TrendsTab } from '../components/analysis/TrendsTab'
import { ReportsTab } from '../components/analysis/ReportsTab'
import { AlertsTab } from '../components/analysis/AlertsTab'

const TAB_MAP: Record<string, number> = {
  projections: 0,
  trends: 1,
  reports: 2,
  alerts: 3,
}

export function AnalysisPage(): JSX.Element {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'projections'
  const [tabValue, setTabValue] = useState(TAB_MAP[tabParam] || 0)

  useEffect(() => {
    const newTabValue = TAB_MAP[tabParam] || 0
    setTabValue(newTabValue)
  }, [tabParam])

  return (
    <div>
      {/* Tab Content */}
      <div>
        {tabValue === 0 && <ProjectionsTab />}
        {tabValue === 1 && <TrendsTab />}
        {tabValue === 2 && <ReportsTab />}
        {tabValue === 3 && <AlertsTab />}
      </div>
    </div>
  )
}