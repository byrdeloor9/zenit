/**
 * Financial Management Page - Consolidated page with tabs for Accounts, Transactions, Transfers, Categories
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AccountList } from '../components/accounts/AccountList'
import { TransactionListSidebar } from '../components/transactions/TransactionListSidebar'
import { TransferList } from '../components/transfers/TransferList'
import { CategoryList } from '../components/categories/CategoryList'

export function FinancialManagementPage(): JSX.Element {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'accounts'
  const [activeTab, setActiveTab] = useState(tabParam)

  useEffect(() => {
    setActiveTab(tabParam)
  }, [tabParam])

  return (
    <div>
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

