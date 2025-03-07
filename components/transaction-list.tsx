"use client"

import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2 } from "lucide-react"

type Transaction = {
  id: string
  description: string
  amount: number
  date: string
  type: "income" | "expense"
  category?: string
}

type TransactionListProps = {
  transactions: Transaction[]
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 px-6">Nenhuma transação encontrada no período selecionado.</div>
    )
  }

  return (
    <div className="space-y-1 px-6">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between py-2 px-3 hover:bg-black/30 rounded-md transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 w-10">{transaction.id.slice(-4)}</div>
            <div>
              <div className="text-sm text-white">{transaction.description}</div>
              <div className="text-xs text-gray-500">
                {format(parseISO(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
              {transaction.type === "income" ? "+" : "-"}R${Math.abs(transaction.amount).toFixed(2)}
            </div>
            <div className="flex items-center gap-1">
              {transaction.type === "income" ? (
                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 text-xs">PAGO</Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 text-xs">PAGO</Badge>
              )}
              <button
                onClick={() => onDelete(transaction.id)}
                className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

