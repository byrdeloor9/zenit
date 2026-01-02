/**
 * Transactions Page - Redesigned with Tailwind CSS
 */

import { useEffect, useState } from 'react'
import {
  Add as AddIcon,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useTransactions, useAccounts, useCategories } from '../hooks'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, formatDate } from '../utils/formatters'
import type { Transaction } from '../types'
import type { TransactionFormData } from '../api/endpoints/transactions'

export function TransactionsPage(): JSX.Element {
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

  // Menu contextual
  const [menuAnchor, setMenuAnchor] = useState<{
    anchorEl: HTMLElement | null
    transaction: Transaction | null
  }>({ anchorEl: null, transaction: null })

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

  // Menu contextual handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, tx: Transaction): void => {
    event.stopPropagation()
    setMenuAnchor({ anchorEl: event.currentTarget, transaction: tx })
  }

  const handleMenuClose = (): void => {
    setMenuAnchor({ anchorEl: null, transaction: null })
  }

  const handleMenuEdit = (): void => {
    if (menuAnchor.transaction) {
      handleOpenForm(menuAnchor.transaction)
    }
    handleMenuClose()
  }

  const handleMenuDelete = (): void => {
    if (menuAnchor.transaction) {
      handleDeleteClick(menuAnchor.transaction.id)
    }
    handleMenuClose()
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transacciones</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gestiona tus ingresos y gastos</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <AddIcon className="mr-2" />
          Nueva Transacción
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
              Total Transacciones
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {filteredTransactions.length}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
              Ingresos
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {formatCurrency(totalIncome.toString())}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
              Gastos
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {formatCurrency(totalExpenses.toString())}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <Input
              label="Buscar"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por descripción o categoría..."
              className="w-full"
            />
          </div>
          
          <Select
            label="Tipo"
            id="type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="Income">Ingresos</option>
            <option value="Expense">Gastos</option>
          </Select>
          
          <Select
            label="Categoría"
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.icon && `${category.icon} `}{category.name}
              </option>
            ))}
          </Select>
          
          <Select
            label="Ordenar por"
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Más recientes</option>
            <option value="date-asc">Más antiguas</option>
            <option value="amount-desc">Mayor monto</option>
            <option value="amount-asc">Menor monto</option>
          </Select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {transactions.length === 0 
              ? 'No tienes transacciones aún'
              : 'No se encontraron transacciones'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {transactions.length === 0
              ? 'Crea tu primera transacción para comenzar a rastrear tus finanzas'
              : 'Intenta cambiar los filtros para ver más resultados'}
          </p>
          {transactions.length === 0 && (
            <Button
              onClick={() => handleOpenForm()}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white"
            >
              <AddIcon className="mr-2" />
              Crear Primera Transacción
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                  transaction.type === 'Income' 
                    ? 'hover:bg-green-50 dark:hover:bg-green-900/20' 
                    : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'Income' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'Income' ? (
                      <TrendingUp className="text-xl" />
                    ) : (
                      <TrendingDown className="text-xl" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {transaction.description || 'Sin descripción'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleMenuClick(e, transaction)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVert className="text-gray-400 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span>{transaction.account_name}</span>
                      <span>{formatDate(transaction.transaction_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={transaction.type === 'Income' ? 'success' : 'error'}
                        size="sm"
                      >
                        {transaction.category_name}
                      </Badge>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={`flex-shrink-0 text-right ${
                    transaction.type === 'Income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    <div className="text-xl font-bold">
                      {transaction.type === 'Income' ? '+' : '−'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Contextual */}
      {menuAnchor.anchorEl && (
        <div className="fixed inset-0 z-50" onMouseDown={(e) => { e.stopPropagation(); handleMenuClose(); }}>
          <div 
            className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-32"
            style={{
              top: menuAnchor.anchorEl.getBoundingClientRect().bottom + 8,
              left: menuAnchor.anchorEl.getBoundingClientRect().left,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleMenuEdit}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <EditIcon className="text-sm" />
              Editar
            </button>
            <button
              onClick={handleMenuDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <DeleteIcon className="text-sm" />
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        transaction={selectedTransaction}
        loading={loading}
        accounts={accountsList}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Eliminar Transacción
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
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
      </Modal>
    </div>
  )
}