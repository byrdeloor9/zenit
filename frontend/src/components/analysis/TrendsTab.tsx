/**
 * TrendsTab - Enhanced financial trends and spending patterns analysis
 */

import { useState } from 'react'
import { TrendingUp, TrendingDown, Remove, BarChart as BarChartIcon, PieChart as PieChartIcon } from '@mui/icons-material'
import { useTrends } from '../../hooks/useTrends'
import { TrendChart } from './TrendChart'
import { TrendStats } from './TrendStats'
import { GlobalTrendsView } from './GlobalTrendsView'
import { CategoryBreakdownChart } from './CategoryBreakdownChart'
import { Table, TableRow, TableCell } from '../ui/Table'
import { formatCurrency, formatPercentage } from '../../utils/formatters'

const PERIOD_OPTIONS = [
  { value: 3, label: '3 Meses' },
  { value: 6, label: '6 Meses' },
  { value: 12, label: '12 Meses' },
]

type ViewMode = 'global' | 'category' | 'distribution'

/**
 * Format month string from "2024-11" to "Nov 2024"
 */
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
}

/**
 * Get trend indicator
 */
function getTrendIndicator(vsPrevious: 'increase' | 'decrease' | 'stable') {
  switch (vsPrevious) {
    case 'increase':
      return <TrendingUp className="text-red-500" />
    case 'decrease':
      return <TrendingDown className="text-green-500" />
    case 'stable':
      return <Remove className="text-gray-500" />
  }
}

export function TrendsTab(): JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>('global')

  const {
    categories,
    selectedCategory,
    selectedMonths,
    trends,
    loadingCategories,
    loadingTrends,
    error,
    selectCategory,
    selectMonths,
  } = useTrends()

  // Mode selector
  const ModeSelector = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Análisis de Tendencias
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'global'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <BarChartIcon className="text-lg" />
            Global
          </button>
          <button
            onClick={() => setViewMode('distribution')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'distribution'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <PieChartIcon className="text-lg" />
            Distribución
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'category'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <TrendingUp className="text-lg" />
            Por Categoría
          </button>
        </div>
      </div>
    </div>
  )

  // Render based on mode
  if (viewMode === 'global') {
    return (
      <div>
        <ModeSelector />
        <GlobalTrendsView />
      </div>
    )
  }

  if (viewMode === 'distribution') {
    return (
      <div>
        <ModeSelector />
        <CategoryBreakdownChart />
      </div>
    )
  }

  // Category mode (original functionality)
  // Loading state for categories
  if (loadingCategories) {
    return (
      <>
        <ModeSelector />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando categorías...</p>
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <ModeSelector />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error al cargar datos</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </>
    )
  }

  // No categories with budgets
  if (categories.length === 0) {
    return (
      <>
        <ModeSelector />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
          <div className="text-cyan-500 dark:text-cyan-400 mb-6">
            <TrendingUp className="text-8xl mx-auto opacity-50" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sin Categorías con Presupuesto
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Crea presupuestos para tus categorías para ver análisis de tendencias
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <ModeSelector />
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                id="category-select"
                value={selectedCategory || ''}
                onChange={(e) => selectCategory(parseInt(e.target.value) || null)}
                className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md transition"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Selector */}
            <div>
              <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período
              </label>
              <select
                id="period-select"
                value={selectedMonths}
                onChange={(e) => selectMonths(parseInt(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md transition"
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {trends && <TrendStats trends={trends} />}

        {/* Chart with loading overlay */}
        {trends && (
          <div className="relative">
            <TrendChart
              data={trends.monthly_data}
              budgetReference={trends.budget_reference}
              categoryName={trends.category_name}
            />
            {loadingTrends && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Actualizando...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table with loading overlay */}
        {trends && trends.monthly_data.length > 0 && (
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Detalle Mensual
                </h3>
              </div>
              <Table headers={['Mes', 'Monto', 'Cambio %', 'Estado']}>
                {trends.monthly_data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatMonthLabel(item.month)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      {item.change_percentage !== null ? (
                        <span className={item.change_percentage > 0 ? 'text-red-600' : item.change_percentage < 0 ? 'text-green-600' : 'text-gray-600'}>
                          {formatPercentage(Math.abs(item.change_percentage))}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIndicator(item.vs_previous)}
                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {item.vs_previous === 'increase' ? 'Aumento' : item.vs_previous === 'decrease' ? 'Disminución' : 'Estable'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
            {loadingTrends && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Actualizando...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state for trends */}
        {selectedCategory === null && !loadingCategories && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center py-16">
            <div className="text-cyan-500 dark:text-cyan-400 mb-6">
              <TrendingUp className="text-8xl mx-auto opacity-50" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Selecciona una Categoría
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Elige una categoría para ver su análisis de tendencias
            </p>
          </div>
        )}
      </div>
    </>
  )
}
