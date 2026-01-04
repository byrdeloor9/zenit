/**
 * TransactionListSidebar - Main component with sidebar filters and table view
 */

import { useState, useMemo, useEffect } from 'react'
import { Add } from '@mui/icons-material'
import { TransactionSidebar } from './TransactionSidebar'
import { TransactionTableView } from './TransactionTableView'
import { TransactionForm } from './TransactionForm'
import { QuickStats } from '../ui/QuickStats'
import { Modal, Card, Button } from '../ui'
import { useTransactions, useAccounts, useCategories, useTransactionFilters } from '../../hooks'
import { getGroupKey, getGroupLabel } from '../../utils/dateGrouping'
import { formatCurrency } from '../../utils/formatters'
import type { Transaction } from '../../types'
import type { TransactionFormData } from '../../api/endpoints/transactions'

export function TransactionListSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)

    const {
        transactions,
        loading,
        error,
        fetchTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
    } = useTransactions()

    const { accounts, fetchAccounts } = useAccounts()
    const { categories, fetchCategories } = useCategories()
    const { filters, updateFilter, clearFilters } = useTransactionFilters()

    useEffect(() => {
        fetchTransactions()
        fetchAccounts()
        fetchCategories()
    }, [fetchTransactions, fetchAccounts, fetchCategories])

    // Aplicar filtros
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (filters.type !== 'all' && tx.type !== filters.type) return false
            if (filters.categories.length > 0 && !filters.categories.includes(tx.category_id || 0)) return false
            if (filters.accounts.length > 0 && !filters.accounts.includes(tx.account_id)) return false
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase()
                return (
                    tx.description?.toLowerCase().includes(query) ||
                    tx.category_name.toLowerCase().includes(query) ||
                    tx.account_name.toLowerCase().includes(query)
                )
            }
            return true
        })
    }, [transactions, filters])

    // Agrupar por fecha
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {}

        filteredTransactions.forEach(tx => {
            const dateKey = getGroupKey(tx.transaction_date)
            if (!groups[dateKey]) groups[dateKey] = []
            groups[dateKey].push(tx)
        })

        // Convertir a array y ordenar
        return Object.entries(groups)
            .map(([key, items]) => ({
                key,
                label: getGroupLabel(key),
                count: items.length,
                transactions: items.sort((a, b) =>
                    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
                )
            }))
            .sort((a, b) => {
                // Ordenar grupos: today, yesterday, this-week, luego por mes desc
                const order = ['today', 'yesterday', 'this-week']
                const aIndex = order.indexOf(a.key)
                const bIndex = order.indexOf(b.key)

                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
                if (aIndex !== -1) return -1
                if (bIndex !== -1) return 1

                return b.key.localeCompare(a.key) // Meses más recientes primero
            })
    }, [filteredTransactions])

    // Calcular estadísticas
    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter(tx => tx.type === 'Income')
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

        const expenses = filteredTransactions
            .filter(tx => tx.type === 'Expense')
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

        return {
            total: filteredTransactions.length,
            income,
            expenses,
        }
    }, [filteredTransactions])

    // Handlers
    const handleOpenForm = (transaction?: Transaction) => {
        setSelectedTransaction(transaction || null)
        setFormOpen(true)
    }

    const handleCloseForm = () => {
        setFormOpen(false)
        setSelectedTransaction(null)
    }

    const handleSubmit = async (data: TransactionFormData) => {
        if (selectedTransaction) {
            await editTransaction(selectedTransaction.id, data)
        } else {
            await addTransaction(data)
        }
    }

    const handleDeleteClick = (id: number) => {
        setTransactionToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (transactionToDelete) {
            const success = await removeTransaction(transactionToDelete)
            if (success) {
                setDeleteDialogOpen(false)
                setTransactionToDelete(null)
            }
        }
    }

    if (loading && transactions.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header Fixed */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <QuickStats
                        items={[
                            { label: 'Total', value: stats.total, icon: '📊' },
                            { label: 'Ingresos', value: `+${formatCurrency(stats.income.toString())}`, color: 'green', icon: '↗️' },
                            { label: 'Gastos', value: `−${formatCurrency(stats.expenses.toString())}`, color: 'red', icon: '↘️' },
                        ]}
                    />

                    <button
                        onClick={() => handleOpenForm()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Add className="w-5 h-5" />
                        <span className="hidden sm:inline">Nueva Transacción</span>
                        <span className="sm:hidden">Nueva</span>
                    </button>
                </div>
            </header>

            {/* Layout Principal */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Desktop */}
                <TransactionSidebar
                    open={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    filters={filters}
                    onFilterChange={updateFilter}
                    onClearFilters={clearFilters}
                    categories={categories}
                    accounts={accounts}
                    className="hidden lg:flex"
                />

                {/* Contenido Principal */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                {transactions.length === 0
                                    ? 'No tienes transacciones aún'
                                    : 'No se encontraron transacciones'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {transactions.length === 0
                                    ? 'Crea tu primera transacción para comenzar a rastrear tus finanzas'
                                    : 'Intenta cambiar los filtros para ver más resultados'}
                            </p>
                            {transactions.length === 0 && (
                                <Button
                                    onClick={() => handleOpenForm()}
                                    size="lg"
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                >
                                    <Add className="mr-2" />
                                    Crear Primera Transacción
                                </Button>
                            )}
                        </div>
                    ) : (
                        <TransactionTableView
                            groups={groupedTransactions}
                            compact={!sidebarOpen}
                            onEdit={handleOpenForm}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </main>
            </div>

            {/* Transaction Form Dialog */}
            <TransactionForm
                open={formOpen}
                onClose={handleCloseForm}
                onSubmit={handleSubmit}
                transaction={selectedTransaction}
                loading={loading}
                accounts={accounts}
                categories={categories}
            />

            {/* Delete Confirmation Dialog */}
            <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} size="sm">
                <Card title="Eliminar Transacción">
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </Card>
            </Modal>

            {/* FAB Flotante para móvil */}
            <button
                onClick={() => handleOpenForm()}
                className="lg:hidden fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
                title="Nueva Transacción"
            >
                <Add />
            </button>
        </div>
    )
}
