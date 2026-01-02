/**
 * DebtDetailsDialog - Show detailed debt information and payment history (migrated to Tailwind CSS)
 */

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  CalendarToday,
  AccountBalance,
  Receipt,
  Warning,
  CheckCircle,
} from '@mui/icons-material'
import { getDebtPayments } from '../../api/endpoints/debts'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import type { Debt, DebtPayment } from '../../types'

interface DebtDetailsDialogProps {
  open: boolean
  onClose: () => void
  debt: Debt | null
}

export function DebtDetailsDialog({ open, onClose, debt }: DebtDetailsDialogProps): JSX.Element {
  const [payments, setPayments] = useState<DebtPayment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && debt) {
      fetchPayments()
    }
  }, [open, debt])

  const fetchPayments = async (): Promise<void> => {
    if (!debt) return

    setLoading(true)
    setError(null)
    try {
      const data = await getDebtPayments(debt.id)
      setPayments(data)
    } catch (err) {
      setError('Error al cargar los pagos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!debt) return <></>

  const getStatusColor = (): string => {
    switch (debt.status) {
      case 'Paid':
        return '#10B981'
      case 'Cancelled':
        return '#94A3B8'
      default:
        return '#EF4444'
    }
  }

  const getStatusLabel = (): string => {
    switch (debt.status) {
      case 'Paid':
        return 'Pagada'
      case 'Cancelled':
        return 'Cancelada'
      default:
        return 'Activa'
    }
  }

  const statusColor = getStatusColor()
  const monthsElapsed = Math.floor(
    (new Date().getTime() - new Date(debt.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  const monthsRemaining = Math.max(0, debt.term_months - monthsElapsed)

  const getProgressColor = (): string => {
    if (debt.payment_progress >= 100) return '#10B981'
    if (debt.payment_progress >= 75) return '#667eea'
    if (debt.payment_progress >= 50) return '#3B82F6'
    return '#EF4444'
  }

  const progressColor = getProgressColor()

  return (
    <Modal open={open} onClose={onClose}>
      <Card title={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              💳 {debt.creditor_name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detalles y historial de pagos
            </p>
          </div>
          <span 
            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-lg border"
            style={{ 
              backgroundColor: `${statusColor}20`, 
              color: statusColor,
              borderColor: `${statusColor}40` 
            }}
          >
            {debt.status === 'Paid' && <CheckCircle className="text-sm" />}
            {getStatusLabel()}
          </span>
        </div>
      }>
        <div className="space-y-6">
          {/* Progress Section */}
          {debt.status === 'Active' && (
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${progressColor}10`, 
                borderColor: `${progressColor}30` 
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Progreso de Pago
                </span>
                <span className="text-sm font-bold" style={{ color: progressColor }}>
                  {debt.payment_progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(debt.payment_progress, 100)}%`,
                    backgroundColor: progressColor
                  }}
                />
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AccountBalance className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Monto Total
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${debt.total_amount.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Pagado
                </span>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ${parseFloat(debt.amount_paid).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Pago Mensual
                </span>
              </div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ${parseFloat(debt.monthly_payment).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarToday className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Tasa de Interés
                </span>
              </div>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {debt.interest_rate}%
              </p>
            </div>
          </div>

          {/* Time Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CalendarToday className="text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Información Temporal
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Inicio:</span>
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(debt.start_date).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Meses Transcurridos:</span>
                <p className="text-gray-700 dark:text-gray-300">{monthsElapsed}</p>
              </div>
              {debt.status === 'Active' && (
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Meses Restantes:</span>
                  <p className="text-gray-700 dark:text-gray-300">{monthsRemaining}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Historial de Pagos
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : error ? (
              <Alert type="error" message={error} />
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Fecha</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Monto</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">
                          ${parseFloat(payment.amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {payment.description || 'Pago de deuda'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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