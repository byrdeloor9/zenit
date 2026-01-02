/**
 * Hook for accounts management
 */

import { useState, useCallback, useRef } from 'react'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api/endpoints'
import type { Account, AccountFormData } from '../types'

interface UseAccountsReturn {
  accounts: Account[]
  loading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  addAccount: (data: AccountFormData) => Promise<Account | null>
  editAccount: (id: number, data: Partial<AccountFormData>) => Promise<Account | null>
  removeAccount: (id: number) => Promise<boolean>
}

export function useAccounts(): UseAccountsReturn {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef<boolean>(false)

  const fetchAccounts = useCallback(async (): Promise<void> => {
    // Prevenir llamadas simultáneas usando ref para evitar recrear la función
    if (isFetchingRef.current) {
      return
    }

    try {
      isFetchingRef.current = true
      setLoading(true)
      setError(null)
      const data = await getAccounts()
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
      console.error('Error fetching accounts:', err)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, []) // Sin dependencias - función estable que no se recrea

  const addAccount = useCallback(async (data: AccountFormData): Promise<Account | null> => {
    if (loading) {
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const newAccount = await createAccount(data)
      setAccounts(prev => [...prev, newAccount])
      return newAccount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      console.error('Error creating account:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [loading])

  const editAccount = useCallback(async (
    id: number, 
    data: Partial<AccountFormData>
  ): Promise<Account | null> => {
    if (loading) {
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const updated = await updateAccount(id, data)
      setAccounts(prev => prev.map(acc => acc.id === id ? updated : acc))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account')
      console.error('Error updating account:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [loading])

  const removeAccount = useCallback(async (id: number): Promise<boolean> => {
    if (loading) {
      return false
    }

    try {
      setLoading(true)
      setError(null)
      await deleteAccount(id)
      setAccounts(prev => prev.filter(acc => acc.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      console.error('Error deleting account:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [loading])

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    editAccount,
    removeAccount,
  }
}

