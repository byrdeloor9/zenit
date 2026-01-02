/**
 * InvestmentHistory component - Display transaction history (migrated to Tailwind CSS)
 */

import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CheckCircle,
} from '@mui/icons-material'
import type { InvestmentTransaction } from '../../types'

interface InvestmentHistoryProps {
  transactions: InvestmentTransaction[]
}

export function InvestmentHistory({ transactions }: InvestmentHistoryProps): JSX.Element {
  const getTransactionIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'contribution':
        return <TrendingUp className="text-green-500" />
      case 'withdrawal':
        return <TrendingDown className="text-amber-500" />
      case 'return':
        return <AttachMoney className="text-blue-500" />
      case 'maturity':
        return <CheckCircle className="text-indigo-500" />
      default:
        return <AttachMoney className="text-gray-500" />
    }
  }

  const getTransactionLabel = (type: string): string => {
    switch (type) {
      case 'contribution':
        return 'Aporte'
      case 'withdrawal':
        return 'Retiro'
      case 'return':
        return 'Rendimiento'
      case 'maturity':
        return 'Vencimiento'
      default:
        return 'Transacción'
    }
  }

  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'contribution':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'withdrawal':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'return':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'maturity':
        return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-200 dark:border-gray-700'
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-500 dark:text-gray-400">No hay transacciones registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTransactionIcon(transaction.type)}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {getTransactionLabel(transaction.type)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(transaction.transaction_date).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-gray-100">
                ${parseFloat(transaction.amount).toLocaleString()}
              </p>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md border ${getTransactionColor(transaction.type)}`}>
                {getTransactionLabel(transaction.type)}
              </span>
            </div>
          </div>
          
          {transaction.notes && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}