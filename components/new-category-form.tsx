"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2 } from "lucide-react"

type Category = {
  id: string
  name: string
  color: string
  type: "income" | "expense"
}

type CategoryFormProps = {
  onClose: () => void
  onAdd: (category: any) => void
  categories: Category[]
  onDeleteCategory: (id: string) => void
}

export function NewCategoryForm({ onClose, onAdd, categories, onDeleteCategory }: CategoryFormProps) {
  const [categoryType, setCategoryType] = useState<"income" | "expense">("expense")
  const [formData, setFormData] = useState({
    name: "",
    color: "#ef4444",
    type: "expense" as "income" | "expense",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTypeChange = (value: "income" | "expense") => {
    setCategoryType(value)
    setFormData((prev) => ({
      ...prev,
      type: value,
    }))
  }

  const handleSubmit = () => {
    if (!formData.name) {
      alert("Por favor, informe o nome da categoria")
      return
    }

    const newCategory = {
      name: formData.name,
      color: formData.color,
      type: formData.type,
    }

    onAdd(newCategory)
  }

  // Filtrar categorias pelo tipo selecionado
  const filteredCategories = categories.filter((cat) => cat.type === categoryType)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold mb-1 text-white">Nova Categoria</h2>
        <p className="text-xs text-gray-400">Crie uma nova categoria para suas transações</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Tipo</Label>
          <RadioGroup
            value={categoryType}
            onValueChange={(value) => handleTypeChange(value as "income" | "expense")}
            className="flex gap-4"
          >
            <div className="flex-1">
              <Label
                htmlFor="cat-income"
                className={`flex items-center justify-center space-x-2 p-2 rounded cursor-pointer border text-white ${
                  categoryType === "income" ? "bg-green-500/20 border-green-500" : "border-gray-800"
                }`}
              >
                <RadioGroupItem value="income" id="cat-income" className="sr-only" />
                <span>Receita</span>
              </Label>
            </div>
            <div className="flex-1">
              <Label
                htmlFor="cat-expense"
                className={`flex items-center justify-center space-x-2 p-2 rounded cursor-pointer border text-white ${
                  categoryType === "expense" ? "bg-red-500/20 border-red-500" : "border-gray-800"
                }`}
              >
                <RadioGroupItem value="expense" id="cat-expense" className="sr-only" />
                <span>Gasto</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Nome
          </Label>
          <Input
            id="name"
            placeholder="Nome da categoria..."
            className="bg-black border-gray-800 text-white placeholder:text-gray-500"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Cor</Label>
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
            className="block w-full h-10 p-1 bg-black border-gray-800"
          />
        </div>

        {filteredCategories.length > 0 && (
          <div className="space-y-2 mt-6">
            <Label className="text-white">Categorias existentes</Label>
            <div className="space-y-1 max-h-[150px] overflow-y-auto pr-2 rounded-md bg-black/30 p-2">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between py-2 px-3 hover:bg-black/30 rounded-md transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm text-white">{category.name}</span>
                  </div>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
            categoryType === "income" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          } text-white`}
          onClick={handleSubmit}
        >
          Cadastrar
        </Button>
      </div>
    </div>
  )
}

