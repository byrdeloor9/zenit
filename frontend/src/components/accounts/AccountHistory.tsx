/**
 * AccountHistory component - Show transactions for a specific account (migrated to Tailwind CSS)
 */

import { useEffect, useState } from 'react'
import { Close as CloseIcon, TrendingUp, TrendingDown } from '@mui/icons-material'
import { getTransactionsByAccount } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import type { Account, Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'

interface AccountHistoryProps {
  open: boolean
  onClose: () => void
  account: Account | null
}

export function AccountHistory({ open, onClose, account }: AccountHistoryProps): JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && account) {
      const fetchTransactions = async (): Promise<void> => {
        try {
          setLoading(true)
          setError(null)
          const data = await getTransactionsByAccount(account.id)
          setTransactions(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load transactions')
        } finally {
          setLoading(false)
        }
      }

      fetchTransactions()
    }
  }, [open, account])

  if (!account) return <></>

  const getTransactionIcon = (type: string): JSX.Element => {
    return type === 'Income' ? (
      <TrendingUp className="text-green-500" />
    ) : (
      <TrendingDown className="text-red-500" />
    )
  }

  const getTransactionColor = (type: string): string => {
    return type === 'Income' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Card title={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Historial de Transacciones
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {account.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <CloseIcon className="text-gray-500 dark:text-gray-300" />
          </button>
        </div>
      }>
        <div className="flex flex-col gap-4 h-full">
          {/* Account Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Balance Actual:</span>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Tipo:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {account.account_type}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions List with Scroll */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <Alert type="error" message={error} />
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500 dark:text-gray-300">No hay transacciones registradas</p>
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {transaction.category_name || 'Sin categoría'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'Income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          {formatDate(transaction.transaction_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 flex-shrink-0">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </Modal>
  )
}