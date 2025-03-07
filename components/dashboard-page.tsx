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

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  category: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: string;
}

export function DashboardPage() {
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([]) // Tipado como Category
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

  // Função para carregar dados iniciais do localStorage
  const loadInitialData = () => {
    try {
      const savedTransactions = localStorage.getItem("transactions")
      const savedCategories = localStorage.getItem("categories")

      if (savedTransactions) {
        setAllTransactions(JSON.parse(savedTransactions))
      }
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error)
      showToast("Erro ao carregar dados salvos.", "error")
    }
  }

  // Carrega os dados ao montar o componente
  useEffect(() => {
    loadInitialData()
  }, [])

  // Salva transações no localStorage quando mudarem
  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(allTransactions))
    } catch (error) {
      console.error("Erro ao salvar transações no localStorage:", error)
      showToast("Erro ao salvar transações.", "error")
    }
  }, [allTransactions])

  // Salva categorias no localStorage quando mudarem
  useEffect(() => {
    try {
      localStorage.setItem("categories", JSON.stringify(categories))
    } catch (error) {
      console.error("Erro ao salvar categorias no localStorage:", error)
      showToast("Erro ao salvar categorias.", "error")
    }
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
    } else {
      filtered = filtered.filter((transaction) =>
        searchTerm === "" || transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
    setShowTransactions(true)

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
    const newTransaction: Transaction = {
      id: `t${Date.now()}`, // ID único baseado em timestamp
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
    const newCategory: Category = {
      id: `c${Date.now()}`, // ID único baseado em timestamp
      name: category.name,
      color: category.color,
      type: category.type,
    }

    setCategories((prev) => [...prev, newCategory])
    setShowNewCategory(false)
    showToast("Categoria cadastrada com sucesso!")
  }

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find((c) => c.id === categoryId)

    if (!categoryToDelete) {
      showToast("Categoria não encontrada.", "error")
      return
    }

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
    // Filtro já aplicado automaticamente pelo useEffect
  }

  const handleClearFilter = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setSearchTerm("")
  }

  return (
    <div className="container">
      <div className="flex-1 p-6">
        <div className="section">
          <h1>Receitas e Gastos no período</h1>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Saldo</h2>
            <p className="text-sm text-gray-400">Receitas e despesas no período</p>
          </div>

          {/* Cards de Saldo, Receitas e Gastos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
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

      {/* Painel lateral de transações */}
      <div className="sidebar">
        <div className="p-6">
          <h3 className="text-base font-semibold text-white">Transações</h3>
          <p className="text-xs text-gray-400">Todas as transações</p>
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