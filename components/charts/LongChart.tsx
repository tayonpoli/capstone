"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"
import { format, subDays } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatIDR } from "@/lib/formatCurrency"

interface ChartData {
  date: string
  revenue: number
  expenses: number
}

const chartConfig = {
  visitors: {
    label: "Total",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function LongChart() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("90d")
  const [chartData, setChartData] = React.useState<ChartData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Calculate date range
        let daysToSubtract = 90
        if (timeRange === "30d") daysToSubtract = 30
        if (timeRange === "7d") daysToSubtract = 7

        const endDate = new Date()
        const startDate = subDays(endDate, daysToSubtract)

        // Fetch data from API
        const response = await fetch(
          `/api/livechart?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }

        const { data } = await response.json()
        const { sales, purchases } = data

        // Create a map to aggregate data by date
        const dataMap = new Map<string, { revenue: number; expenses: number }>()

        // Process sales data (revenue)
        sales.forEach((sale: { orderDate: string; total: number }) => {
          const dateStr = format(new Date(sale.orderDate), "yyyy-MM-dd")
          const current = dataMap.get(dateStr) || { revenue: 0, expenses: 0 }
          dataMap.set(dateStr, {
            ...current,
            revenue: current.revenue + sale.total,
          })
        })

        // Process purchase data (expenses)
        purchases.forEach((purchase: { purchaseDate: string; total: number }) => {
          const dateStr = format(new Date(purchase.purchaseDate), "yyyy-MM-dd")
          const current = dataMap.get(dateStr) || { revenue: 0, expenses: 0 }
          dataMap.set(dateStr, {
            ...current,
            expenses: current.expenses + purchase.total,
          })
        })

        // Convert map to array and sort by date
        const sortedData = Array.from(dataMap.entries())
          .map(([date, values]) => ({
            date,
            revenue: parseFloat(values.revenue.toFixed(2)),
            expenses: parseFloat(values.expenses.toFixed(2)),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Fill in missing dates with zero values
        const filledData: ChartData[] = []
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
          const dateStr = format(currentDate, "yyyy-MM-dd")
          const existingData = sortedData.find((d) => d.date === dateStr)

          filledData.push({
            date: dateStr,
            revenue: existingData?.revenue || 0,
            expenses: existingData?.expenses || 0,
          })

          currentDate.setDate(currentDate.getDate() + 1)
        }

        setChartData(filledData)
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setError("Failed to load data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [timeRange])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Revenue & Expenses</CardTitle>
          <CardDescription>
            {timeRange === "7d"
              ? "Showing revenue and expenses for the last 7 days"
              : timeRange === "30d"
                ? "Showing revenue and expenses for the last 30 days"
                : "Showing revenue and expenses for the last 3 months"}
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}
        >
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="fillRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id="fillExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={40}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return format(date, "MMM d")
                  }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip
                  cursor={{
                    stroke: "hsl(var(--border))",
                    strokeDasharray: "3 3",
                  }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return format(new Date(value), "MMM d, yyyy")
                      }}
                      formatter={(value) => [
                        `${formatIDR(Number(value))}`,
                        value === chartData[0]?.revenue
                      ]}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--chart-1))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
                <Area
                  dataKey="expenses"
                  type="monotone"
                  fill="url(#fillExpenses)"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--chart-2))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}