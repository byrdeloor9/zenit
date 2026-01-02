/**
 * Debts Page - Redesigned with Tailwind CSS
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon, CreditCard, Warning, CheckCircle, TrendingUp } from '@mui/icons-material'
import { useDebts } from '../hooks'
import { DebtForm } from '../components/debts/DebtForm'
import { PaymentDialog } from '../components/debts/PaymentDialog'
import { DebtDetailsDialog } from '../components/debts/DebtDetailsDialog'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatCurrency, formatDate } from '../utils/formatters'
import type { Debt } from '../types'
import type { DebtFormData, PaymentFormData } from '../api/endpoints/debts'

export function DebtsPage(): JSX.Element {
  const {
    debts,
    loading,
    error,
    fetchDebts,
    addDebt,
    editDebt,
    makePayment,
    removeDebt,
  } = useDebts()

  const [formOpen, setFormOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [debtToDelete, setDebtToDelete] = useState<number | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const handleOpenForm = (debt?: Debt): void => {
    setSelectedDebt(debt || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedDebt(null)
  }

  const handleOpenPaymentDialog = (debt: Debt): void => {
    setSelectedDebt(debt)
    setPaymentDialogOpen(true)
  }

  const handleClosePaymentDialog = (): void => {
    setPaymentDialogOpen(false)
    setSelectedDebt(null)
  }

  const handleOpenDetailsDialog = (debt: Debt): void => {
    setSelectedDebt(debt)
    setDetailsDialogOpen(true)
  }

  const handleCloseDetailsDialog = (): void => {
    setDetailsDialogOpen(false)
    setSelectedDebt(null)
  }

  const handleSubmit = async (data: DebtFormData): Promise<void> => {
    if (selectedDebt) {
      await editDebt(selectedDebt.id, data)
    } else {
      await addDebt(data)
    }
  }

  const handlePaymentSubmit = async (data: PaymentFormData): Promise<void> => {
    if (selectedDebt) {
      await makePayment(selectedDebt.id, data)
    }
  }

  const handleDeleteClick = (id: number): void => {
    setDebtToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (debtToDelete) {
      const success = await removeDebt(debtToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setDebtToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setDebtToDelete(null)
  }

  // Apply filters
  let filteredDebts = debts.filter(debt => {
    if (statusFilter !== 'all' && debt.status !== statusFilter) return false
    if (searchQuery && !debt.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !debt.creditor_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Calculate totals
  const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.remaining_amount), 0)
  const totalDebts = debts.length
  const activeDebts = debts.filter(debt => debt.status === 'active').length
  const overdueDebts = debts.filter(debt => {
    if (debt.status !== 'active') return false
    const nextPayment = new Date(debt.next_payment_date)
    const today = new Date()
    return nextPayment < today
  }).length

  if (loading && debts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deudas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus deudas y pagos</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <AddIcon className="mr-2" />
          Nueva Deuda
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Total Deudas
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalDebts}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Monto Total
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {formatCurrency(totalDebt.toString())}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Activas
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              {activeDebts}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Vencidas
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {overdueDebts}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Input
              label="Buscar"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o acreedor..."
              className="w-full"
            />
          </div>
          
          <Select
            label="Estado"
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="paid">Pagadas</option>
            <option value="cancelled">Canceladas</option>
          </Select>
        </div>
      </div>

      {/* Alerts */}
      {overdueDebts > 0 && (
        <Alert 
          type="error" 
          message={`${overdueDebts} deuda(s) vencida(s). Revisa los pagos pendientes.`} 
        />
      )}

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Debts Grid */}
      {filteredDebts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {debts.length === 0 
              ? 'No tienes deudas registradas'
              : 'No se encontraron deudas'}
          </h3>
          <p className="text-gray-600 mb-6">
            {debts.length === 0
              ? 'Registra tus deudas para llevar un mejor control de tus pagos'
              : 'Intenta cambiar los filtros para ver más resultados'}
          </p>
          {debts.length === 0 && (
            <Button
              onClick={() => handleOpenForm()}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white"
            >
              <AddIcon className="mr-2" />
              Registrar Primera Deuda
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDebts.map((debt) => (
            <Card key={debt.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {debt.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {debt.creditor_name}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      debt.status === 'active' ? 'warning' : 
                      debt.status === 'paid' ? 'success' : 
                      'secondary'
                    }
                    size="sm"
                  >
                    {debt.status}
                  </Badge>
                </div>

                {/* Progress */}
                {debt.status === 'active' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progreso</span>
                      <span>{((parseFloat(debt.original_amount) - parseFloat(debt.remaining_amount)) / parseFloat(debt.original_amount) * 100).toFixed(0)}%</span>
                    </div>
                    <ProgressBar
                      value={parseFloat(debt.original_amount) - parseFloat(debt.remaining_amount)}
                      max={parseFloat(debt.original_amount)}
                      color="red"
                      showPercentage={false}
                    />
                  </div>
                )}

                {/* Amounts */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monto restante</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(debt.remaining_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pago mensual</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(debt.monthly_payment)}
                    </span>
                  </div>
                  {debt.status === 'active' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Próximo pago</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(debt.next_payment_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status */}
                {debt.status === 'active' && (
                  <div className="mb-4">
                    {new Date(debt.next_payment_date) < new Date() ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <Warning className="text-sm" />
                        <span className="text-sm font-medium">Pago vencido</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="text-sm" />
                        <span className="text-sm font-medium">Al día</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {debt.status === 'active' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenPaymentDialog(debt)}
                      className="flex-1"
                    >
                      Pagar
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenDetailsDialog(debt)}
                    className="flex-1"
                  >
                    Detalles
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenForm(debt)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(debt.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Debt Form Modal */}
      <DebtForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        debt={selectedDebt}
        loading={loading}
      />

      {/* Payment Dialog */}
      {selectedDebt && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={handleClosePaymentDialog}
          onSubmit={handlePaymentSubmit}
          debt={selectedDebt}
          loading={loading}
        />
      )}

      {/* Debt Details Dialog */}
      {selectedDebt && (
        <DebtDetailsDialog
          open={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          debt={selectedDebt}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eliminar Deuda
          </h3>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar esta deuda? Esta acción no se puede deshacer y eliminará todo el historial de pagos.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}