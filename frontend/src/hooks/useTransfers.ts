/**
 * Hook for transfers management
 */

import { useState, useCallback } from 'react'
import {
  getTransfers,
  createTransfer,
  deleteTransfer,
  type Transfer,
  type TransferFormData,
} from '../api/endpoints/transfers'

interface UseTransfersReturn {
  transfers: Transfer[]
  loading: boolean
  error: string | null
  fetchTransfers: () => Promise<void>
  addTransfer: (data: TransferFormData) => Promise<Transfer | null>
  removeTransfer: (id: number) => Promise<boolean>
}

export function useTransfers(): UseTransfersReturn {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransfers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTransfers()
      setTransfers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transfers')
      console.error('Error fetching transfers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addTransfer = useCallback(async (data: TransferFormData): Promise<Transfer | null> => {
    try {
      setLoading(true)
      setError(null)
      const newTransfer = await createTransfer(data)
      setTransfers(prev => [newTransfer, ...prev])
      return newTransfer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer')
      console.error('Error creating transfer:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeTransfer = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteTransfer(id)
      setTransfers(prev => prev.filter(transfer => transfer.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transfer')
      console.error('Error deleting transfer:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    transfers,
    loading,
    error,
    fetchTransfers,
    addTransfer,
    removeTransfer,
  }
}

