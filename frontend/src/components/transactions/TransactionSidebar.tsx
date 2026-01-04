/**
 * TransactionSidebar - Collapsible sidebar with filters
 */

import { Search, ChevronLeft, ChevronRight } from '@mui/icons-material'
import { FilterSection, RadioGroup, CheckboxGroup } from '../ui'
import type { TransactionFilters } from '../../hooks/useTransactionFilters'
import type { Category, Account } from '../../types'

interface TransactionSidebarProps {
    open: boolean
    onToggle: () => void
    filters: TransactionFilters
    onFilterChange: <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => void
    onClearFilters: () => void
    categories: Category[]
    accounts: Account[]
    className?: string
}

export function TransactionSidebar({
    open,
    onToggle,
    filters,
    onFilterChange,
    onClearFilters,
    categories,
    accounts,
    className = ''
}: TransactionSidebarProps) {
    return (
        <aside
            className={`
        ${className}
        flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${open ? 'w-60' : 'w-12'}
      `}
        >
            {/* Contenido del Sidebar */}
            <div className={`flex-1 overflow-y-auto ${open ? 'p-4' : 'p-2'}`}>
                {open ? (
                    <div className="space-y-6">
                        {/* Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={filters.searchQuery}
                                onChange={(e) => onFilterChange('searchQuery', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Divisor */}
                        <div className="border-t border-gray-200 dark:border-gray-700" />

                        {/* Filtro Tipo */}
                        <FilterSection title="TIPO">
                            <RadioGroup
                                value={filters.type}
                                onChange={(value) => onFilterChange('type', value as TransactionFilters['type'])}
                                options={[
                                    { value: 'all', label: 'Todas' },
                                    { value: 'Income', label: 'Ingresos' },
                                    { value: 'Expense', label: 'Gastos' },
                                ]}
                            />
                        </FilterSection>

                        {/* Filtro Categorías */}
                        {categories.length > 0 && (
                            <FilterSection title="CATEGORÍAS">
                                <CheckboxGroup
                                    value={filters.categories}
                                    onChange={(value) => onFilterChange('categories', value as number[])}
                                    options={categories.map(cat => ({
                                        value: cat.id,
                                        label: `${cat.icon || ''} ${cat.name}`.trim()
                                    }))}
                                />
                            </FilterSection>
                        )}

                        {/* Filtro Cuentas */}
                        {accounts.length > 0 && (
                            <FilterSection title="CUENTAS">
                                <CheckboxGroup
                                    value={filters.accounts}
                                    onChange={(value) => onFilterChange('accounts', value as number[])}
                                    options={accounts.map(acc => ({
                                        value: acc.id,
                                        label: acc.name
                                    }))}
                                />
                            </FilterSection>
                        )}

                        {/* Limpiar Filtros */}
                        <button
                            onClick={onClearFilters}
                            className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    // Iconos colapsados
                    <div className="flex flex-col items-center gap-4 py-2">
                        <button
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Buscar"
                        >
                            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="text-lg" title="Filtros">📊</div>
                        <div className="text-lg" title="Categorías">🏷️</div>
                        <div className="text-lg" title="Cuentas">💳</div>
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="p-3 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                title={open ? 'Colapsar filtros' : 'Expandir filtros'}
            >
                {open ? (
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
            </button>
        </aside>
    )
}
