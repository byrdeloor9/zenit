/**
 * useTransactionFilters - Custom hook for managing transaction filters
 */

import { useState, useCallback } from 'react'

export interface TransactionFilters {
    searchQuery: string
    type: 'all' | 'Income' | 'Expense'
    categories: number[]
    accounts: number[]
    dateRange?: [Date, Date]
}

const initialFilters: TransactionFilters = {
    searchQuery: '',
    type: 'all',
    categories: [],
    accounts: [],
}

export function useTransactionFilters() {
    const [filters, setFilters] = useState<TransactionFilters>(initialFilters)

    const updateFilter = useCallback(<K extends keyof TransactionFilters>(
        key: K,
        value: TransactionFilters[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    const clearFilters = useCallback(() => {
        setFilters(initialFilters)
    }, [])

    const hasActiveFilters = useCallback(() => {
        return (
            filters.searchQuery !== '' ||
            filters.type !== 'all' ||
            filters.categories.length > 0 ||
            filters.accounts.length > 0
        )
    }, [filters])

    return {
        filters,
        updateFilter,
        clearFilters,
        hasActiveFilters: hasActiveFilters(),
    }
}
