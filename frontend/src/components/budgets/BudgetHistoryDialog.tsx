/**
 * BudgetHistoryDialog component - Display budget change history (migrated to Tailwind CSS)
 */

import { useState, useEffect } from 'react'
import { History as HistoryIcon, TrendingUp, TrendingDown, Circle } from '@mui/icons-material'
import { getBudgetHistory } from '../../api/endpoints/budgets'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import type { BudgetHistory } from '../../types'

interface BudgetHistoryDialogProps {
  open: boolean
  onClose: () => void
  budgetId: number
  budgetName: string
}

export function BudgetHistoryDialog({
  open,
  onClose,
  budgetId,
  budgetName,
}: BudgetHistoryDialogProps): JSX.Element {
  const [history, setHistory] = useState<BudgetHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && budgetId) {
      fetchHistory()
    }
  }, [open, budgetId])

  const fetchHistory = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBudgetHistory(budgetId)
      setHistory(data)
    } catch (err) {
      setError('Error al cargar el historial')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getChangeIcon = (changeType: string): JSX.Element => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="text-green-500" />
      case 'decrease':
        return <TrendingDown className="text-red-500" />
      default:
        return <Circle className="text-gray-500" />
    }
  }

  const getChangeColor = (changeType: string): string => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 dark:text-green-400'
      case 'decrease':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Card title={
        <div className="flex items-center gap-3">
          <HistoryIcon className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Historial de Cambios
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
            {budgetName}
            </p>
          </div>
        </div>
      }>
        <div className="space-y-4">
        {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        ) : error ? (
            <Alert type="error" message={error} />
        ) : history.length === 0 ? (
            <div className="text-center py-8">
              <HistoryIcon className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No hay historial disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
            {history.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getChangeIcon(entry.change_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${getChangeColor(entry.change_type)}`}>
                            {entry.change_type === 'increase' ? 'Aumento' : 
                             entry.change_type === 'decrease' ? 'Reducción' : 'Cambio'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.changed_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Monto anterior:</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              ${parseFloat(entry.previous_amount).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Nuevo monto:</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              ${parseFloat(entry.new_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>

                    {entry.change_reason && (
                          <div className="mt-2">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Razón:</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {entry.change_reason}
                            </p>
                          </div>
                        )}

                        <div className="mt-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Cambio:</span>
                          <p className={`text-sm font-medium ${getChangeColor(entry.change_type)}`}>
                            {entry.change_type === 'increase' ? '+' : '-'}
                            ${Math.abs(parseFloat(entry.new_amount) - parseFloat(entry.previous_amount)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        </div>
      </Card>
    </Modal>
  )
}