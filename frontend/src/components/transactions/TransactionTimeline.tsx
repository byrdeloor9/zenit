import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Edit, Delete } from '@mui/icons-material'
import { formatCurrency } from '../../utils/formatters'
import type { Transaction } from '../../types'

interface TransactionTimelineProps {
    transactions: Transaction[]
    onEdit: (transaction: Transaction) => void
    onDelete: (id: number) => void
}

interface DailyGroup {
    date: string
    dateObj: Date
    label: string
    transactions: Transaction[]
    dailyTotal: number
}

export function TransactionTimeline({ transactions, onEdit, onDelete }: TransactionTimelineProps): JSX.Element {
    const [activeId, setActiveId] = useState<number | null>(null)

    const groups = useMemo(() => {
        const grouped: Record<string, DailyGroup> = {}
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        transactions.forEach(tx => {
            const txDate = new Date(tx.transaction_date + 'T12:00:00')
            const dateKey = tx.transaction_date // YYYY-MM-DD

            if (!grouped[dateKey]) {
                let label = ''
                const compareDate = new Date(txDate)
                compareDate.setHours(0, 0, 0, 0)

                if (compareDate.getTime() === today.getTime()) {
                    label = 'HOY'
                } else if (compareDate.getTime() === yesterday.getTime()) {
                    label = 'AYER'
                } else {
                    label = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(txDate).toUpperCase()
                }

                grouped[dateKey] = {
                    date: dateKey,
                    dateObj: txDate,
                    label,
                    transactions: [],
                    dailyTotal: 0
                }
            }

            grouped[dateKey].transactions.push(tx)
            const amount = parseFloat(tx.amount)
            grouped[dateKey].dailyTotal += tx.type === 'Income' ? amount : -amount
        })

        return Object.values(grouped).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
    }, [transactions])

    if (transactions.length === 0) return <></>

    const handleRowClick = (id: number) => {
        if (activeId === id) {
            setActiveId(null)
        } else {
            setActiveId(id)
        }
    }

    return (
        <div className="space-y-6 pb-24">
            {groups.map((group) => (
                <div key={group.date} className="space-y-1">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50/95 dark:bg-gray-800/95 sticky top-0 backdrop-blur-sm z-10 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                                {group.label}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                                {group.date}
                            </span>
                        </div>
                        <span className={`text-xs font-bold ${group.dailyTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                            }`}>
                            {group.dailyTotal >= 0 ? '+' : ''}{formatCurrency(group.dailyTotal.toFixed(2))}
                        </span>
                    </div>

                    {/* List */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-50 dark:divide-gray-700/50">
                        {group.transactions.map((tx) => {
                            const isActive = activeId === tx.id
                            return (
                                <div key={tx.id} className="transition-all duration-300 ease-in-out">
                                    <div
                                        onClick={() => handleRowClick(tx.id)}
                                        className={`flex items-center p-3 transition-colors cursor-pointer ${isActive ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 mr-3 transition-transform duration-300 ${isActive ? 'scale-110 shadow-sm' : ''} ${tx.type === 'Income' ? 'bg-green-50 dark:bg-green-900/10 text-green-600' : 'bg-red-50 dark:bg-red-900/10 text-red-600'
                                            }`}>
                                            {tx.category_icon || (tx.type === 'Income' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
                                                    {tx.description}
                                                </h4>
                                                <span className={`text-sm font-bold whitespace-nowrap ${tx.type === 'Income' ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'
                                                    }`}>
                                                    {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <span className="truncate max-w-[120px]">
                                                        {tx.account_name}
                                                    </span>
                                                    <span>•</span>
                                                    <span className={tx.category_name ? '' : 'italic'}>
                                                        {tx.category_name || 'Sin categoría'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Reveal - Minimalist Icons */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-14 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="flex items-center justify-end gap-3 p-2 pr-4 bg-gray-50/50 dark:bg-gray-800/50">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onEdit(tx)
                                                }}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                                                title="Editar"
                                            >
                                                <Edit fontSize="small" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDelete(tx.id)
                                                }}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                                                title="Eliminar"
                                            >
                                                <Delete fontSize="small" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
