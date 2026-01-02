/**
 * TransactionList component - List of recent transactions redesigned with Tailwind CSS
 */

import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Transaction } from '../../types'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps): JSX.Element {
  if (transactions.length === 0) {
    return (
      <Card title="Transacciones Recientes">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">No hay transacciones aún</p>
          <p className="text-gray-400 text-sm mt-2">Las transacciones aparecerán aquí cuando las agregues</p>
        </div>
      </Card>
    )
  }

  // Show only the first 5 transactions
  const recentTransactions = transactions.slice(0, 5)

  return (
    <Card title="Transacciones Recientes" description={`Últimas ${recentTransactions.length} transacciones`}>
      <div className="space-y-0">
        {recentTransactions.map((transaction, index) => (
          <div key={transaction.id}>
            <div className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
              transaction.type === 'Income' 
                ? 'hover:bg-green-50 dark:hover:bg-green-900/20' 
                : 'hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}>
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                transaction.type === 'Income' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {transaction.type === 'Income' ? (
                  <TrendingUp className="text-lg" />
                ) : (
                  <TrendingDown className="text-lg" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {transaction.description || 'Sin descripción'}
                  </h4>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                  {transaction.account_name} • {formatDate(transaction.transaction_date)}
                </div>
                <div className="flex items-center gap-2 mt-1">
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
                <div className="text-lg font-bold">
                  {transaction.type === 'Income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>
            
            {/* Divider */}
            {index < recentTransactions.length - 1 && (
              <div className="border-b border-gray-100 dark:border-gray-700 mx-4" />
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}