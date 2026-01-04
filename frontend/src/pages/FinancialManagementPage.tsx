/**
 * Financial Management Page - Consolidated page with tabs for Accounts, Transactions, Transfers, Categories
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AccountList } from '../components/accounts/AccountList'
import { TransactionListSidebar } from '../components/transactions/TransactionListSidebar'
import { TransferList } from '../components/transfers/TransferList'
import { CategoryList } from '../components/categories/CategoryList'

const TABS = [
  { value: 'accounts', label: 'Cuentas', emoji: '🏛️', shortLabel: 'Cuentas' },
  { value: 'transactions', label: 'Transacciones', emoji: '💳', shortLabel: 'Transacc.' },
  { value: 'transfers', label: 'Transferencias', emoji: '⇆', shortLabel: 'Transfer.' },
  { value: 'categories', label: 'Categorías', emoji: '🏷️', shortLabel: 'Categor.' },
]

export function FinancialManagementPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'accounts'
  const [activeTab, setActiveTab] = useState(tabParam)

  useEffect(() => {
    setActiveTab(tabParam)
  }, [tabParam])

  const handleTabChange = (tabValue: string): void => {
    setActiveTab(tabValue)
    setSearchParams({ tab: tabValue })
  }

  return (
    <div className="space-y-6">
      {/* Header - Responsive: Mobile (tabs below) vs Desktop (tabs right) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Mobile Layout: Title on top, tabs below */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Finanzas
            </h1>
          </div>

          {/* Mobile Tabs */}
          <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.value
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <span className="text-2xl">{tab.emoji}</span>
                  <span className="text-xs">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout: Title left, tabs right in same row */}
        <div className="hidden md:flex items-center justify-between gap-6">
          {/* Left: Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Finanzas
            </h1>
          </div>

          {/* Right: Tabs Navigation */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex justify-end border-b border-gray-200 dark:border-gray-700 min-w-max">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.value
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <span className="text-xl">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'accounts' && <AccountList />}
        {activeTab === 'transactions' && <TransactionListSidebar />}
        {activeTab === 'transfers' && <TransferList />}
        {activeTab === 'categories' && <CategoryList />}
      </div>
    </div>
  )
}


