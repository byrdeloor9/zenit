import { DashboardStats } from '../types'

interface DashboardProps {
  stats: DashboardStats
}

function Dashboard({ stats }: DashboardProps): JSX.Element {
  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount))
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const netBalance = parseFloat(stats.total_income) - parseFloat(stats.total_expenses)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                  💰
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Balance
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.total_balance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white text-2xl">
                  📈
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Income (30 days)
                  </dt>
                  <dd className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.total_income)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white text-2xl">
                  📉
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Expenses (30 days)
                  </dt>
                  <dd className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.total_expenses)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white text-2xl">
                  💵
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Net (30 days)
                  </dt>
                  <dd className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netBalance.toString())}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accounts</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.accounts_count}</p>
          <p className="text-sm text-gray-500 mt-1">Active accounts</p>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Goals</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.goals_summary.in_progress}</p>
          <p className="text-sm text-gray-500 mt-1">In progress</p>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.goals_summary.completed}</p>
          <p className="text-sm text-gray-500 mt-1">Goals completed</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Transactions
          </h3>
        </div>
        <div className="overflow-hidden">
          {stats.recent_transactions.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No transactions yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stats.recent_transactions.map((transaction) => (
                <li key={transaction.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {transaction.type === 'Income' ? '📥' : '📤'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.category_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.account_name} • {formatDate(transaction.transaction_date)}
                          </p>
                          {transaction.description && (
                            <p className="text-xs text-gray-400 mt-1">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`text-lg font-bold ${
                          transaction.type === 'Income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'Income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

