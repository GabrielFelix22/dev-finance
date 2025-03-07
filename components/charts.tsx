"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"

Chart.register(...registerables)

type Transaction = {
  id: string
  description: string
  amount: number
  date: string
  type: "income" | "expense"
  category?: string
}

type PieChartProps = {
  data: Record<string, number>
}

export function PieChart({ data }: PieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")

      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        const categories = Object.keys(data)
        const values = Object.values(data)

        if (categories.length === 0) {
          ctx.font = "14px Inter"
          ctx.fillStyle = "#9ca3af"
          ctx.textAlign = "center"
          ctx.fillText(
            "Selecione um período para visualizar os gastos",
            chartRef.current.width / 2,
            chartRef.current.height / 2,
          )
          return
        }

        const colors = [
          "#3b82f6", // azul
          "#22c55e", // verde
          "#06b6d4", // ciano
          "#ef4444", // vermelho
          "#f59e0b", // amarelo
          "#8b5cf6", // roxo
          "#ec4899", // rosa
          "#14b8a6", // teal
        ]

        chartInstance.current = new Chart(ctx, {
          type: "pie",
          data: {
            labels: categories,
            datasets: [
              {
                data: values,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: "#9ca3af",
                  font: {
                    size: 11,
                    family: "Inter",
                  },
                  padding: 12,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number
                    return `R$ ${value.toFixed(2)}`
                  },
                },
              },
            },
          },
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

type BarChartProps = {
  transactions: Transaction[]
}

export function BarChart({ transactions }: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")

      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        if (transactions.length === 0) {
          ctx.font = "14px Inter"
          ctx.fillStyle = "#9ca3af"
          ctx.textAlign = "center"
          ctx.fillText(
            "Selecione um período para visualizar a evolução financeira",
            chartRef.current.width / 2,
            chartRef.current.height / 2,
          )
          return
        }

        const dates = transactions.map((t) => parseISO(t.date))
        const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

        const startDate = startOfMonth(minDate)
        const endDate = endOfMonth(maxDate)

        const months = eachMonthOfInterval({ start: startDate, end: endDate })

        const labels = months.map((date) => format(date, "MMM", { locale: ptBR }))

        const incomeData = months.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)

          return transactions
            .filter((t) => {
              const date = parseISO(t.date)
              return date >= monthStart && date <= monthEnd && t.type === "income"
            })
            .reduce((sum, t) => sum + t.amount, 0)
        })

        const expenseData = months.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)

          return transactions
            .filter((t) => {
              const date = parseISO(t.date)
              return date >= monthStart && date <= monthEnd && t.type === "expense"
            })
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        })

        const balanceData = months.map((_, index) => {
          return incomeData[index] - expenseData[index]
        })

        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Receitas",
                data: incomeData,
                backgroundColor: "#22c55e",
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
              },
              {
                label: "Despesas",
                data: expenseData,
                backgroundColor: "#ef4444",
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
              },
              {
                label: "Saldo",
                data: balanceData,
                backgroundColor: "#3b82f6",
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                  drawBorder: false,
                },
                ticks: {
                  color: "#9ca3af",
                  font: {
                    size: 11,
                    family: "Inter",
                  },
                },
              },
              y: {
                grid: {
                  color: "#1f2937",
                },
                border: {
                  display: false,
                },
                ticks: {
                  color: "#9ca3af",
                  font: {
                    size: 11,
                    family: "Inter",
                  },
                },
              },
            },
            plugins: {
              legend: {
                position: "top",
                align: "start",
                labels: {
                  color: "#9ca3af",
                  font: {
                    size: 11,
                    family: "Inter",
                  },
                  boxWidth: 12,
                  padding: 12,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number
                    return `R$ ${value.toFixed(2)}`
                  },
                },
              },
            },
          },
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [transactions])

  return <canvas ref={chartRef} />
}

