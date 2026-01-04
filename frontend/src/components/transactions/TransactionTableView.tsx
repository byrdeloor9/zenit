/**
 * TransactionTableView - Table view with date grouping
 */

import { useState } from 'react'
import { MoreVert, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { formatCurrency } from '../../utils/formatters'
import type { Transaction } from '../../types'

interface TransactionGroup {
    key: string
    label: string
    count: number
    transactions: Transaction[]
}

interface TransactionTableViewProps {
    groups: TransactionGroup[]
    compact?: boolean
    onEdit: (transaction: Transaction) => void
    onDelete: (id: number) => void
}

export function TransactionTableView({
    groups,
    compact = false,
    onEdit,
    onDelete
}: TransactionTableViewProps) {
    if (groups.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No se encontraron transacciones
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Intenta cambiar los filtros para ver más resultados
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <div key={group.key} className="space-y-2">
                    {/* Group Header */}
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            📅 {group.label}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {group.count} {group.count === 1 ? 'transacción' : 'transacciones'}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <th className="px-4 py-2 text-left font-semibold">Descripción</th>
                                        {!compact && <th className="px-4 py-2 text-left font-semibold">Cuenta</th>}
                                        <th className="px-4 py-2 text-left font-semibold">Categoría</th>
                                        <th className="px-4 py-2 text-right font-semibold">Monto</th>
                                        <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {group.transactions.map((tx) => (
                                        <TransactionTableRow
                                            key={tx.id}
                                            transaction={tx}
                                            compact={compact}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

interface TransactionTableRowProps {
    transaction: Transaction
    compact?: boolean
    onEdit: (transaction: Transaction) => void
    onDelete: (id: number) => void
}

function TransactionTableRow({ transaction: tx, compact, onEdit, onDelete }: TransactionTableRowProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    // Extract emoji from category name or use fallback
    const getCategoryIcon = () => {
        const categoryName = tx.category_name || ''
        // Match any emoji character
        const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
        const match = categoryName.match(emojiRegex)
        if (match && match[0]) {
            return match[0]
        }
        // Fallback to type-based arrow
        return tx.type === 'Income' ? '↗️' : '↘️'
    }

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 group transition-colors">
            {/* Descripción + Icono */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${tx.type === 'Income'
                            ? 'bg-green-100 dark:bg-green-900/20'
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                        {getCategoryIcon()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tx.description || 'Sin descripción'}
                    </span>
                </div>
            </td>

            {/* Cuenta */}
            {!compact && (
                <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {tx.account_name}
                    </span>
                </td>
            )}

            {/* Categoría */}
            <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${tx.type === 'Income'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                    {tx.category_name || 'Sin categoría'}
                </span>
            </td>

            {/* Monto */}
            <td className="px-4 py-3 text-right">
                <span className={`font-bold ${tx.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {tx.type === 'Income' ? '+' : '−'}{formatCurrency(tx.amount)}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                    <MoreVert className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(false)}
                        />
                        <div className="absolute right-4 top-12 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]">
                            <button
                                onClick={() => {
                                    onEdit(tx)
                                    setMenuOpen(false)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <EditIcon className="w-4 h-4" />
                                Editar
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(tx.id)
                                    setMenuOpen(false)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <DeleteIcon className="w-4 h-4" />
                                Eliminar
                            </button>
                        </div>
                    </>
                )}
            </td>
        </tr>
    )
}
