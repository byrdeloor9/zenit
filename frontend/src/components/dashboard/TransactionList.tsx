import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Transaction } from '../../types'

interface TransactionListProps {
  transactions: Transaction[]
  wrapper?: boolean
}

export function TransactionList({ transactions, wrapper = true }: TransactionListProps): JSX.Element {
  const content = (
    <div className="space-y-0">
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-300 dark:text-gray-600 text-6xl mb-4 opacity-50">📊</div>
          <p className="text-gray-500 text-lg">No hay transacciones aún</p>
          <p className="text-gray-400 text-sm mt-2">Las transacciones aparecerán aquí cuando las agregues</p>
        </div>
      ) : (
        transactions.slice(0, 5).map((transaction, index) => (
          <div key={transaction.id}>
            <div className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group rounded-xl mx-2 my-1
              ${wrapper ? '' : 'hover:scale-[1.01] hover:shadow-sm'}
            `}>
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-5 shadow-sm transition-transform group-hover:scale-105 ${transaction.type === 'Income'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                }`}>
                {transaction.type === 'Income' ? (
                  <TrendingUp className="text-xl" />
                ) : (
                  <TrendingDown className="text-xl" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {transaction.description || 'Sin descripción'}
                  </h4>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{transaction.account_name}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span>{formatDate(transaction.transaction_date)}</span>
                </div>
              </div>

              {/* Amount & Category */}
              <div className="flex flex-col items-end gap-2 ml-4">
                <div className={`text-lg font-bold tracking-tight ${transaction.type === 'Income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-900 dark:text-gray-100'
                  }`}>
                  {transaction.type === 'Income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
                <Badge
                  variant="neutral"
                  size="sm"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-0"
                >
                  {transaction.category_name}
                </Badge>
              </div>
            </div>

            {/* Divider */}
            {index < transactions.slice(0, 5).length - 1 && (
              <div className="border-b border-gray-100 dark:border-gray-800 mx-6" />
            )}
          </div>
        ))
      )}
    </div>
  )

  if (!wrapper) {
    return content
  }

  // Classic view with Card wrapper (legacy support or other views)
  return (
    <Card title="Transacciones Recientes" description={`Últimas ${Math.min(transactions.length, 5)} transacciones`}>
      {content}
    </Card>
  )
}