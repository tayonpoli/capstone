"use client"

import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartStyle,
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
import { useEffect, useMemo, useState } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

// Default chart configuration
const chartConfig = {
    expenses: {
        label: "Expenses",
    },
    Electricity: {
        label: "Electricity",
        color: "hsl(var(--chart-1))",
    },
    Rent: {
        label: "Rent",
        color: "hsl(var(--chart-2))",
    },
    Utilities: {
        label: "Utilities",
        color: "hsl(var(--chart-3))",
    },
    Other: {
        label: "Other",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig

// Simplified type definitions
interface ExpenseCategory {
    category: string
    total: number
    fill: string
}

interface ExpenseApiResponse {
    categories: ExpenseCategory[]
    percentageChange: number
}

export function ExpensesPieChart() {
    const id = "expenses-pie-chart"
    const [activeCategory, setActiveCategory] = useState<string>("")
    const [data, setData] = useState<ExpenseCategory[]>([])
    const [percentageChange, setPercentageChange] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch expense data from API
    useEffect(() => {
        async function fetchExpenseData() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await fetch('/api/livechart/expenses')

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const apiData: ExpenseApiResponse = await response.json()

                if (!apiData || !apiData.categories || !Array.isArray(apiData.categories)) {
                    throw new Error("Invalid data format received from API")
                }

                setData(apiData.categories)
                setPercentageChange(apiData.percentageChange || 0)

                if (apiData.categories.length > 0) {
                    setActiveCategory(apiData.categories[0].category)
                }
            } catch (err) {
                console.error("Failed to fetch expense data:", err)
                setError(err instanceof Error ? err.message : "Failed to load data")
                setData([])
                setPercentageChange(0)
            } finally {
                setIsLoading(false)
            }
        }

        fetchExpenseData()
    }, [])

    const activeIndex = useMemo(
        () => data.findIndex((item) => item.category === activeCategory),
        [activeCategory, data]
    )

    const categories = useMemo(() => data.map((item) => item.category), [data])

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    }

    // Get trend info based on percentage change
    const getTrendInfo = () => {
        if (percentageChange > 0) {
            return {
                icon: TrendingUp,
                color: "text-red-500",
                text: `Trending up by ${Math.abs(percentageChange)}% this month`
            }
        } else if (percentageChange < 0) {
            return {
                icon: TrendingDown,
                color: "text-green-500",
                text: `Trending down by ${Math.abs(percentageChange)}% this month`
            }
        } else {
            return {
                icon: Minus,
                color: "text-muted-foreground",
                text: "No change this month"
            }
        }
    }

    if (isLoading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                    <div className="grid gap-1">
                        <CardTitle>Expenses by Category</CardTitle>
                        <CardDescription>Loading expense data...</CardDescription>
                    </div>
                    <Skeleton className="ml-auto h-7 w-[130px] rounded-lg" />
                </CardHeader>
                <CardContent className="flex flex-1 justify-center pb-0">
                    <Skeleton className="mx-auto aspect-square w-full max-w-[300px] rounded-full" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                    <div className="grid gap-1">
                        <CardTitle>Expenses by Category</CardTitle>
                        <CardDescription className="text-destructive">
                            Error: {error}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center pb-0 text-destructive">
                    Failed to load expense data. Please try again later.
                </CardContent>
            </Card>
        )
    }

    if (data.length === 0) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                    <div className="grid gap-1">
                        <CardTitle>Expenses by Category</CardTitle>
                        <CardDescription>No expense data available</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center pb-0 text-muted-foreground">
                    No expense records found
                </CardContent>
            </Card>
        )
    }

    const trendInfo = getTrendInfo()
    const TrendIcon = trendInfo.icon

    return (
        <Card data-chart={id} className="flex flex-col">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <CardTitle>Monthly Expenses</CardTitle>
                    <CardDescription>Showing expenses by category</CardDescription>
                </div>
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select a category"
                    >
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {categories.map((key) => {
                            const config = chartConfig[key as keyof typeof chartConfig]

                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-xs"
                                            style={{
                                                backgroundColor: `var(--color-${key})`,
                                            }}
                                        />
                                        {config?.label}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center items-center gap-2 pb-6">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px] max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="category"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({
                                outerRadius = 0,
                                ...props
                            }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 25}
                                        innerRadius={outerRadius + 12}
                                    />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        const activeItem = data[activeIndex];
                                        const total = data.reduce((sum, item) => sum + item.total, 0);
                                        const percentage = total > 0
                                            ? Math.round((activeItem.total / total) * 100)
                                            : 0;

                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {percentage}%
                                                </tspan>
                                            </text>
                                        )
                                    }
                                    return null;
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="text-center">
                    {data[activeIndex] && (
                        <>
                            <div className="text-muted-foreground">
                                Total
                            </div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(data[activeIndex].total)}
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className={`flex items-center gap-2 leading-none font-medium ${trendInfo.color}`}>
                    {trendInfo.text} <TrendIcon className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total expenses for this current month
                </div>
            </CardFooter>
        </Card>
    )
}