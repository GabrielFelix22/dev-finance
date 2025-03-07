"use client"

import { BarChart, PieChart } from "@/components/charts"
import { NewCategoryForm } from "@/components/new-category-form"
import { NewTransactionForm } from "@/components/new-transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isWithinInterval, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertCircle, Calendar, CheckCircle2, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"

// Dados iniciais de exemplo removidos
// const initialTransactionsData = [ ... ]
// const initialCategories = [ ... ]

export function DashboardPage() {
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [allTransactions, setAllTransactions] = useState([]) // Inicializa como vazio
  const [filteredTransactions, setFilteredTransactions] = useState([]) // Inicializa como vazio
  const [categories, setCategories] = useState([]) // Inicializa como vazio
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  })
  const [categoryData, setCategoryData] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })

  // Recupera as transações do localStorage após a montagem do componente
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    if (savedTransactions) {
      setAllTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  // Recupera as categorias do localStorage após a montagem do componente
  useEffect(() => {
    const savedCategories = localStorage.getItem("categories")
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }
  }, [])

  // Salva as transações no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(allTransactions))
  }, [allTransactions])

  // Salva as categorias no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories))
  }, [categories])

  // Aplicar filtro quando as datas, termo de busca ou transações mudarem
  useEffect(() => {
    let filtered = [...allTransactions]

    if (dateFrom && dateTo) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = parseISO(transaction.date)
        const matchesDate = isWithinInterval(transactionDate, { start: dateFrom, end: dateTo })
        const matchesSearch =
          searchTerm === "" || transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesDate && matchesSearch
      })

      setFilteredTransactions(filtered)
      setShowTransactions(true)
    } else {
      // Se não houver filtro de data, mostrar todas as transações
      filtered = filtered.filter((transaction) => {
        return searchTerm === "" || transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      })
      setFilteredTransactions(filtered)
      setShowTransactions(true)
    }

    // Calcular saldo, receitas e despesas
    const income = filtered.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = filtered.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

    setBalanceData({
      income,
      expenses,
      balance: income - expenses,
    })

    // Calcular dados para o gráfico de categorias
    const categoryAmounts: Record<string, number> = {}
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!categoryAmounts[t.category]) {
          categoryAmounts[t.category] = 0
        }
        categoryAmounts[t.category] += Math.abs(t.amount)
      })

    setCategoryData(categoryAmounts)
  }, [dateFrom, dateTo, searchTerm, allTransactions])

  const handleAddTransaction = (transaction: any) => {
    const newTransaction = {
      id: `t${allTransactions.length + 1}`,
      description: transaction.name,
      amount: transaction.type === "expense" ? -Math.abs(transaction.value) : Math.abs(transaction.value),
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
    }

    setAllTransactions((prev) => [...prev, newTransaction])
    setShowNewTransaction(false)
    showToast("Transação cadastrada com sucesso!")
  }

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      setAllTransactions((prev) => prev.filter((t) => t.id !== id))
      showToast("Transação excluída com sucesso!")
    }
  }

  const handleAddCategory = (category: any) => {
    const newCategory = {
      id: `c${categories.length + 1}`,
      name: category.name,
      color: category.color,
      type: category.type,
    }

    setCategories((prev) => [...prev, newCategory])
    setShowNewCategory(false)
    showToast("Categoria cadastrada com sucesso!")
  }

  const handleDeleteCategory = (categoryId: string) => {
    // Encontrar a categoria pelo ID
    const categoryToDelete = categories.find((c) => c.id === categoryId)

    if (!categoryToDelete) {
      showToast("Categoria não encontrada.", "error")
      return
    }

    // Verificar se a categoria está sendo usada em alguma transação
    const isUsed = allTransactions.some((t) => t.category === categoryToDelete.name)

    if (isUsed) {
      showToast("Não é possível excluir uma categoria que está sendo usada em transações.", "error")
      return
    }

    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete.name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId))
      showToast("Categoria excluída com sucesso!")
    }
  }

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" })
    }, 3000)
  }

  const handleApplyFilter = () => {
    // O filtro já é aplicado automaticamente pelo useEffect
  }

  const handleClearFilter = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setSearchTerm("")
  }

  return (
    <div className="flex min-h-screen bg-[#000]">
      <div className="flex-1 p-6 pr-[340px]">
        {" "}
        {/* Ajustado para acomodar o painel lateral fixo */}
        <div className="mb-6">
          <h1 className="text-green-500 font-semibold text-xl mb-1">
            <span className="text-white">Dev</span>bills<span className="text-green-500">/</span>
          </h1>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Saldo</h2>
            <p className="text-sm text-gray-400">Receitas e despesas no período</p>
          </div>

          {/* Cards de Saldo, Receitas e Gastos */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#111] border-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Saldo</p>
                  <p className="text-lg font-semibold text-blue-500">
                    {showTransactions ? `+R$${balanceData.balance.toFixed(2)}` : "R$0,00"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Receitas</p>
                  <p className="text-lg font-semibold text-green-500">
                    {showTransactions ? `+R$${balanceData.income.toFixed(2)}` : "R$0,00"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Gastos</p>
                  <p className="text-lg font-semibold text-red-500">
                    {showTransactions ? `-R$${balanceData.expenses.toFixed(2)}` : "R$0,00"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="bg-[#111] border-none">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-white">Gastos</h3>
                  <p className="text-xs text-gray-400">Despesas por categoria no período</p>
                </div>
                <div className="h-[240px] mt-4">
                  <PieChart data={categoryData} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-none">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-white">Evolução Financeira</h3>
                  <p className="text-xs text-gray-400">Saldo, Receitas e Despesas por mês</p>
                </div>
                <div className="h-[240px] mt-4">
                  <BarChart transactions={filteredTransactions} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cabeçalho de Transações */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Transações</h3>
              <p className="text-xs text-gray-400">Receitas e Gastos no período</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowNewTransaction(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                Nova transação
              </Button>
              <Button
                onClick={() => setShowNewCategory(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                Nova categoria
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mb-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Procurar transação..."
                  className="pl-8 bg-[#111] border-gray-800 text-sm text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-xs text-gray-400">Data:</div>
              <div className="flex gap-2 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[130px] justify-start text-left font-normal bg-[#111] border-gray-800 text-sm text-white"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : <span>Data inicial</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>

                <span className="text-xs text-white">até</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[130px] justify-start text-left font-normal bg-[#111] border-gray-800 text-sm text-white"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : <span>Data final</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-[#111] border-gray-800"
                onClick={handleApplyFilter}
                disabled={!dateFrom || !dateTo}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 bg-[#111] border-gray-800 text-xs text-gray-400"
                onClick={handleClearFilter}
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Painel lateral fixo de transações */}
      <div className="fixed right-0 top-0 w-[320px] h-full bg-[#111] border-l border-gray-800 overflow-hidden flex flex-col">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Transações</h3>
            <p className="text-xs text-gray-400">
              {dateFrom && dateTo ? (
                <>
                  {format(dateFrom, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                  {format(dateTo, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                "Todas as transações"
              )}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <TransactionList transactions={allTransactions} onDelete={handleDeleteTransaction} />
        </div>
      </div>

      {/* Painéis de formulário */}
      {showNewTransaction && (
        <div className="fixed inset-y-0 right-[320px] w-80 bg-[#111] border-l border-gray-800 z-20">
          <NewTransactionForm
            onClose={() => setShowNewTransaction(false)}
            onAdd={handleAddTransaction}
            categories={categories}
          />
        </div>
      )}

      {showNewCategory && (
        <div className="fixed inset-y-0 right-[320px] w-80 bg-[#111] border-l border-gray-800 z-20">
          <NewCategoryForm
            onClose={() => setShowNewCategory(false)}
            onAdd={handleAddCategory}
            categories={categories}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>
      )}

      {/* Toast de notificação */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} text-white p-4 rounded-md shadow-lg flex items-center gap-2 z-50 animate-in fade-in`}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

