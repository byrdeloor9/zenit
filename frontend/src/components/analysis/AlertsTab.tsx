/**
 * AlertsTab - Financial alerts and notifications configuration (migrated to Tailwind CSS)
 * Placeholder for future implementation
 */

import { Notifications } from '@mui/icons-material'
import { Card } from '../ui/Card'

export function AlertsTab(): JSX.Element {
  return (
    <Card className="text-center py-16">
      {/* Coming Soon Placeholder */}
      <div className="text-cyan-500 dark:text-cyan-400 mb-6">
        <Notifications className="text-8xl mx-auto opacity-50" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Sistema de Alertas
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Próximamente
      </p>
      <div className="max-w-2xl mx-auto text-left">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Esta sección incluirá:
        </p>
        <ul className="text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            Configuración de alertas personalizadas
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            Alertas de presupuesto (cuando alcance X%)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            Recordatorios de metas y fechas límite
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            Notificaciones de vencimientos de deudas
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            Sistema de notificaciones en tiempo real
          </li>
        </ul>
      </div>
    </Card>
  )
}


