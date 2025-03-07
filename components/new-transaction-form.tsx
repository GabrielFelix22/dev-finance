"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Category = {
  id: string
  name: string
  color: string
  type: "income" | "expense"
}

type TransactionFormProps = {
  onClose: () => void
  onAdd: (transaction: any) => void
  categories: Category[]
}

export function NewTransactionForm({ onClose, onAdd, categories }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense")
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    type: "expense" as "income" | "expense",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTypeChange = (value: "income" | "expense") => {
    setTransactionType(value)
    setFormData((prev) => ({
      ...prev,
      type: value,
      category: "", // Reset category when type changes
    }))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.value || !formData.date || !formData.category) {
      return // Validação simples
    }

    onAdd({
      ...formData,
      value: Number.parseFloat(formData.value),
    })
  }

  // Filtrar categorias pelo tipo selecionado
  const filteredCategories = categories.filter((cat) => cat.type === transactionType)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold mb-1 text-white">Nova Transação</h2>
        <p className="text-xs text-gray-400">Crie uma nova transação para seu controle financeiro</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Tipo</Label>
          <RadioGroup
            defaultValue="expense"
            className="flex gap-4"
            value={transactionType}
            onValueChange={(value) => handleTypeChange(value as "income" | "expense")}
          >
            <div className="flex-1">
              <Label
                htmlFor="income"
                className={`flex items-center justify-center space-x-2 p-2 rounded cursor-pointer border text-white ${
                  transactionType === "income" ? "bg-green-500/20 border-green-500" : "border-gray-800"
                }`}
              >
                <RadioGroupItem value="income" id="income" className="sr-only" />
                <span>Receita</span>
              </Label>
            </div>
            <div className="flex-1">
              <Label
                htmlFor="expense"
                className={`flex items-center justify-center space-x-2 p-2 rounded cursor-pointer border text-white ${
                  transactionType === "expense" ? "bg-red-500/20 border-red-500" : "border-gray-800"
                }`}
              >
                <RadioGroupItem value="expense" id="expense" className="sr-only" />
                <span>Gasto</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-white">
            Categoria
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
            <SelectTrigger className="bg-black border-gray-800 text-white">
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-gray-800">
              {filteredCategories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.name}
                  className="text-white focus:bg-gray-800 focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Nome
          </Label>
          <Input
            id="name"
            placeholder="Nome da Transação..."
            className="bg-black border-gray-800 text-white placeholder:text-gray-500"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="value" className="text-white">
            Valor
          </Label>
          <Input
            id="value"
            type="number"
            placeholder="0.00"
            className="bg-black border-gray-800 text-white placeholder:text-gray-500"
            value={formData.value}
            onChange={(e) => handleChange("value", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-white">
            Data
          </Label>
          <Input
            id="date"
            type="date"
            className="bg-black border-gray-800 text-white"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          className="flex-1 border-gray-800 hover:bg-gray-900 text-black bg-white"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          className={`flex-1 ${
            transactionType === "income" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          } text-white`}
          onClick={handleSubmit}
        >
          Cadastrar
        </Button>
      </div>
    </div>
  )
}

