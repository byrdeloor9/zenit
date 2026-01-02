/**
 * GoalProgress - Display 3-5 goals closest to completion redesigned with Tailwind CSS
 */

import { EmojiEvents } from '@mui/icons-material'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../utils/formatters'

interface Goal {
  id: number
  name: string
  target_amount: string
  current_amount: string
  progress_percentage: number
}

interface GoalProgressProps {
  goals?: Goal[]
}

export function GoalProgress({ goals = [] }: GoalProgressProps): JSX.Element {
  // Sort by progress percentage (highest first) and take top 5
  const topGoals = [...goals]
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, 5)

  if (topGoals.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <EmojiEvents className="text-purple-600 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Metas</h3>
        </div>
        <div className="text-center py-4 bg-purple-50 rounded-lg">
          <div className="text-purple-400 text-4xl mb-3">🎯</div>
          <p className="text-purple-700 font-medium">¡Establece tus primeras metas!</p>
          <p className="text-purple-600 text-sm mt-1">Comienza a planificar tu futuro financiero</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <EmojiEvents className="text-purple-600 text-lg" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Progreso de Metas</h3>
        <Badge variant="info" size="sm">
          {topGoals.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {topGoals.map((goal) => (
          <div key={goal.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 truncate">{goal.name}</h4>
              <Badge 
                variant={goal.progress_percentage >= 100 ? 'success' : 'info'}
                size="sm"
              >
                {goal.progress_percentage.toFixed(0)}%
              </Badge>
            </div>
            
            <ProgressBar
              value={goal.progress_percentage}
              max={100}
              color={goal.progress_percentage >= 100 ? 'green' : 'purple'}
              showPercentage={false}
            />
            
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Ahorrado: {formatCurrency(goal.current_amount)}</span>
              <span>Meta: {formatCurrency(goal.target_amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}