/**
 * UpcomingPayments - Display upcoming debt payments (next 7-15 days) redesigned with Tailwind CSS
 */

import { CreditCard, CalendarToday } from '@mui/icons-material'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate } from '../../utils/formatters'

interface Payment {
  id: number
  debt_name: string
  next_payment_date: string
  payment_amount: string
  days_until_due: number
}

interface UpcomingPaymentsProps {
  payments?: Payment[]
}

export function UpcomingPayments({ payments = [] }: UpcomingPaymentsProps): JSX.Element {
  // Filter payments within next 15 days and sort by due date
  const upcomingPayments = payments
    .filter((p) => p.days_until_due <= 15)
    .sort((a, b) => a.days_until_due - b.days_until_due)
    .slice(0, 5)

  if (upcomingPayments.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <CreditCard className="text-green-600 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Próximos Pagos</h3>
        </div>
        <div className="text-center py-8 bg-green-50 rounded-lg">
          <div className="text-green-400 text-4xl mb-3">💳</div>
          <p className="text-green-700 font-medium">¡Sin pagos próximos!</p>
          <p className="text-green-600 text-sm mt-1">No tienes deudas pendientes</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <CreditCard className="text-blue-600 text-lg" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Próximos Pagos</h3>
        <Badge variant="info" size="sm">
          {upcomingPayments.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {upcomingPayments.map((payment) => (
          <div key={payment.id} className={`p-3 rounded-lg border ${
            payment.days_until_due <= 3 
              ? 'bg-red-50 border-red-200' 
              : payment.days_until_due <= 7 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 truncate">{payment.debt_name}</h4>
              <Badge 
                variant={
                  payment.days_until_due <= 3 
                    ? 'error' 
                    : payment.days_until_due <= 7 
                      ? 'warning' 
                      : 'info'
                }
                size="sm"
              >
                {payment.days_until_due === 0 ? 'Hoy' : 
                 payment.days_until_due === 1 ? 'Mañana' : 
                 `${payment.days_until_due} días`}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarToday className="text-xs" />
                <span>{formatDate(payment.next_payment_date)}</span>
              </div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(payment.payment_amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}