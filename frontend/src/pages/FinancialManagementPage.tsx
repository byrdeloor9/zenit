/**
 * Financial Management Page - Consolidated page with tabs for Accounts, Transactions, Transfers, Categories
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AccountList } from '../components/accounts/AccountList'
import { TransactionList } from '../components/transactions/TransactionList'
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
      {/* Header con título y badge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Finanzas
            </h1>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Gestión integral
          </span>
        </div>
        
        {/* Tabs Navigation - Tailwind (Responsive) */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.value
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {/* Móvil: emoji arriba + texto corto abajo */}
                <span className="text-2xl sm:text-xl">{tab.emoji}</span>
                <span className="text-xs sm:text-sm sm:hidden">{tab.shortLabel}</span>
                
                {/* Desktop: texto completo */}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'accounts' && <AccountList />}
        {activeTab === 'transactions' && <TransactionList />}
        {activeTab === 'transfers' && <TransferList />}
        {activeTab === 'categories' && <CategoryList />}
      </div>
    </div>
  )
}


