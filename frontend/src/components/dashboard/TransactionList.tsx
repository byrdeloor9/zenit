import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Transaction } from '../../types'
import { CategoryIcon } from '../categories/CategoryIcons'

interface TransactionListProps {
  transactions: Transaction[]
  wrapper?: boolean
}

export function TransactionList({ transactions, wrapper = true }: TransactionListProps): JSX.Element {
  const content = (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-300 dark:text-gray-600 text-5xl mb-3 opacity-50">📊</div>
          <p className="text-gray-500 text-base">No hay transacciones aún</p>
        </div>
      ) : (
        transactions.slice(0, 5).map((transaction, index) => (
          <div key={transaction.id} className="group">
            <div className="flex items-center justify-between group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 rounded-lg transition-colors duration-200 px-2 py-2">

              {/* Left Side: Icon + Details */}
              <div className="flex items-center gap-4">
                {/* Icon Container - Neural Style (Gray Circle) */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#363C97]/10 dark:bg-[#363C97]/20 flex items-center justify-center text-[#363C97] dark:text-[#8ea5ff]">
                  {/* Category Icon */}
                  {transaction.category_icon ? (
                    <CategoryIcon iconName={transaction.category_icon} className="text-2xl" />
                  ) : (
                    <CategoryIcon iconName={transaction.type === 'Income' ? 'TrendingUp' : 'TrendingDown'} className="text-2xl" />
                  )}
                </div>

                {/* Text Info */}
                <div className="flex flex-col justify-center">
                  <span className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {transaction.description || 'Sin descripción'}
                  </span>
                </div>
              </div>

              {/* Right Side: Amount + Date */}
              <div className="flex flex-col items-end">
                <span className={`text-base font-bold tracking-tight mb-1 ${transaction.type === 'Income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-900 dark:text-white'
                  }`}>
                  {transaction.type === 'Income' ? '+' : ''}
                  {formatCurrency(transaction.amount)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {formatDate(transaction.transaction_date).split(',')[0]}
                </span>
              </div>
            </div>

            {/* Separator (except last) - Subtle */}
            {index < transactions.slice(0, 5).length - 1 && (
              <div className="border-b border-gray-100 dark:border-gray-800 ml-[4.5rem] mt-2 mb-2" />
            )}
          </div>
        ))
      )}
    </div>
  )

  if (!wrapper) {
    return content
  }

  return (
    <Card
      title={(
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold">Transacciones Recientes</span>
          <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            Ver todas
          </button>
        </div>
      ) as any}
      className="h-full"
    >
      <div className="pt-2">
        {content}
      </div>
    </Card>
  )
}