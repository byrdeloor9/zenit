/**
 * TransactionList component - Complete transaction management with filters
 */

import { useEffect, useState } from 'react'
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useTransactions, useAccounts, useCategories } from '../../hooks'
import { TransactionForm } from './TransactionForm'
import { TransactionTimeline } from './TransactionTimeline'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { formatCurrency } from '../../utils/formatters'
import type { Transaction } from '../../types'
import type { TransactionFormData } from '../../api/endpoints/transactions'

export function TransactionList(): JSX.Element {
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions()

  const {
    accounts: accountsList,
    fetchAccounts
  } = useAccounts()

  const {
    categories,
    fetchCategories
  } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('date-desc')

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchCategories()
  }, [fetchTransactions, fetchAccounts, fetchCategories])

  const handleOpenForm = (transaction?: Transaction): void => {
    setSelectedTransaction(transaction || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedTransaction(null)
  }

  const handleSubmit = async (data: TransactionFormData): Promise<void> => {
    if (selectedTransaction) {
      await editTransaction(selectedTransaction.id, data)
    } else {
      await addTransaction(data)
    }
  }

  const handleDeleteClick = (id: number): void => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (transactionToDelete) {
      const success = await removeTransaction(transactionToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setTransactionToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setTransactionToDelete(null)
  }

  // Apply filters and search
  let filteredTransactions = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    if (categoryFilter !== 'all' && tx.category_id?.toString() !== categoryFilter) return false
    if (accountFilter !== 'all' && tx.account_id.toString() !== accountFilter) return false
    if (searchQuery && !tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tx.category_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Apply sorting
  filteredTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      case 'date-asc':
        return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
      case 'amount-desc':
        return parseFloat(b.amount) - parseFloat(a.amount)
      case 'amount-asc':
        return parseFloat(a.amount) - parseFloat(b.amount)
      default:
        return 0
    }
  })

  // Calculate totals
  const totalIncome = transactions
    .filter(tx => tx.type === 'Income')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  const totalExpenses = transactions
    .filter(tx => tx.type === 'Expense')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar + Filters Combined */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Transacciones</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{filteredTransactions.length}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Ingresos</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome.toString())}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Gastos</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses.toString())}</p>
            </div>
          </div>

          {/* Filters - Debajo de stats */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="🔍 Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <Select
                id="typeFilter"
                label=""
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="Income">Ingresos</option>
                <option value="Expense">Gastos</option>
              </Select>
              <Select
                id="categoryFilter"
                label=""
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.icon && `${category.icon} `}{category.name}
                  </option>
                ))}
              </Select>
              <Select
                id="accountFilter"
                label=""
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
              >
                <option value="all">Cuentas</option>
                {accountsList.map((account) => (
                  <option key={account.id} value={account.id.toString()}>
                    {account.name}
                  </option>
                ))}
              </Select>
              <Select
                id="sortBy"
                label=""
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Recientes</option>
                <option value="date-asc">Antiguas</option>
                <option value="amount-desc">Mayor $</option>
                <option value="amount-asc">Menor $</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Transactions List (Timeline View) */}
      {filteredTransactions.length === 0 ? (
        <Card className="text-center py-12">
          {/* ... empty state (kept same as before) ... */}
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {transactions.length === 0
              ? 'No tienes transacciones aún'
              : 'No se encontraron transacciones'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {transactions.length === 0
              ? 'Crea tu primera transacción para comenzar a rastrear tus finanzas'
              : 'Intenta cambiar los filtros para ver más resultados'}
          </p>
          {transactions.length === 0 && (
            <Button
              onClick={() => handleOpenForm()}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <AddIcon className="mr-2" />
              Crear Primera Transacción
            </Button>
          )}
        </Card>
      ) : (
        <TransactionTimeline
          transactions={filteredTransactions}
          onEdit={handleOpenForm}
        />
      )}

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        transaction={selectedTransaction}
        loading={loading}
        accounts={accountsList}
        categories={categories}
        onDelete={handleDeleteClick}
      />

      {/* FAB Flotante */}
      {/* FAB Button */}
      <button
        onClick={() => handleOpenForm()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
        title="Nueva Transacción"
      >
        <AddIcon />
      </button>

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <Card title="Eliminar Transacción">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={handleCancelDelete}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
    </div>
  )
}

