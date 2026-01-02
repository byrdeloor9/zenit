import { useState, useEffect, useCallback } from 'react'
import type { Investment, InvestmentTransaction } from '../types/models'
import type { InvestmentFormData, ContributeData, WithdrawData } from '../api/endpoints/investments'
import {
  getInvestments,
  getInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  contributeToInvestment,
  withdrawFromInvestment,
  cancelPolicy,
  completeInvestment,
  getInvestmentHistory,
} from '../api/endpoints/investments'

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInvestments()
      setInvestments(data)
    } catch (err) {
      setError('Error al cargar las inversiones')
      console.error('Error fetching investments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInvestment = useCallback(async (id: number): Promise<Investment | null> => {
    try {
      setLoading(true)
      setError(null)
      return await getInvestment(id)
    } catch (err) {
      setError('Error al cargar la inversión')
      console.error('Error fetching investment:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const addInvestment = useCallback(async (data: InvestmentFormData): Promise<Investment | null> => {
    try {
      setLoading(true)
      setError(null)
      const newInvestment = await createInvestment(data)
      setInvestments(prev => [newInvestment, ...prev])
      return newInvestment
    } catch (err) {
      setError('Error al crear la inversión')
      console.error('Error creating investment:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const editInvestment = useCallback(async (id: number, data: Partial<InvestmentFormData>): Promise<Investment | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateInvestment(id, data)
      setInvestments(prev =>
        prev.map(inv => (inv.id === id ? updated : inv))
      )
      return updated
    } catch (err) {
      setError('Error al actualizar la inversión')
      console.error('Error updating investment:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeInvestment = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteInvestment(id)
      setInvestments(prev => prev.filter(inv => inv.id !== id))
      return true
    } catch (err) {
      setError('Error al eliminar la inversión')
      console.error('Error deleting investment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const contribute = useCallback(async (id: number, data: ContributeData): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const response = await contributeToInvestment(id, data)
      setInvestments(prev =>
        prev.map(inv => (inv.id === id ? response.investment : inv))
      )
      return true
    } catch (err) {
      setError('Error al registrar el aporte')
      console.error('Error contributing to investment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const withdraw = useCallback(async (id: number, data: WithdrawData): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const response = await withdrawFromInvestment(id, data)
      setInvestments(prev =>
        prev.map(inv => (inv.id === id ? response.investment : inv))
      )
      return true
    } catch (err) {
      setError('Error al registrar el retiro')
      console.error('Error withdrawing from investment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const cancel = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await cancelPolicy(id)
      setInvestments(prev =>
        prev.map(inv => (inv.id === id ? updated : inv))
      )
      return true
    } catch (err) {
      setError('Error al cancelar la póliza')
      console.error('Error cancelling policy:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const complete = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await completeInvestment(id)
      setInvestments(prev =>
        prev.map(inv => (inv.id === id ? updated : inv))
      )
      return true
    } catch (err) {
      setError('Error al completar la inversión')
      console.error('Error completing investment:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getHistory = useCallback(async (id: number): Promise<InvestmentTransaction[]> => {
    try {
      setLoading(true)
      setError(null)
      return await getInvestmentHistory(id)
    } catch (err) {
      setError('Error al cargar el historial')
      console.error('Error fetching investment history:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  return {
    investments,
    loading,
    error,
    fetchInvestments,
    fetchInvestment,
    addInvestment,
    editInvestment,
    removeInvestment,
    contribute,
    withdraw,
    cancel,
    complete,
    getHistory,
  }
}

