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

const TAB_VALUES = ['projections', 'trends', 'reports', 'alerts']

const TABS = [
  { value: 'projections', label: 'Proyecciones', emoji: '📊', shortLabel: 'Proyecc.' },
  { value: 'trends', label: 'Tendencias', emoji: '📈', shortLabel: 'Tendenc.' },
  { value: 'reports', label: 'Reportes', emoji: '📋', shortLabel: 'Reportes' },
  { value: 'alerts', label: 'Alertas', emoji: '🔔', shortLabel: 'Alertas' },
]

export function AnalysisPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'projections'
  const [tabValue, setTabValue] = useState(TAB_MAP[tabParam] || 0)

  useEffect(() => {
    const newTabValue = TAB_MAP[tabParam] || 0
    setTabValue(newTabValue)
  }, [tabParam])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
    setSearchParams({ tab: TAB_VALUES[newValue] })
  }

  return (
    <div className="space-y-6">
      {/* Header - Responsive: Mobile (tabs below) vs Desktop (tabs right) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Mobile Layout: Title on top, tabs below */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
              📈
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Análisis
            </h1>
          </div>

          {/* Mobile Tabs */}
          <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {TABS.map((tab, index) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(null as any, index)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 font-medium text-sm border-b-2 transition-colors ${tabValue === index
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <span className="text-2xl">{tab.emoji}</span>
                  <span className="text-xs">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout: Title left, tabs right in same row */}
        <div className="hidden md:flex items-center justify-between gap-6">
          {/* Left: Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
              📈
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Análisis
            </h1>
          </div>

          {/* Right: Tabs Navigation */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex justify-end border-b border-gray-200 dark:border-gray-700 min-w-max">
              {TABS.map((tab, index) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(null as any, index)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${tabValue === index
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <span className="text-xl">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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