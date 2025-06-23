"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
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
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"

const chartConfig = {
    sales: {
        label: "Total ",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function DailySalesChart() {

    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/livechart/sales')
                const data = await response.json()
                setChartData(data.map((item: any) => ({
                    date: format(new Date(item.date), 'EEE'), // tampilkan nama hari
                    sales: item.sales
                })))

            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <Card>
            <CardHeader className="mb-4">
                <CardTitle>Daily Sales</CardTitle>
                <CardDescription>Showing daily sales for the Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer className="lg:h-[350px] w-full" config={chartConfig}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={30}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toLocaleString()}`}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent
                                indicator="line" />}
                            cursor={{
                                stroke: "hsl(var(--border))",
                                strokeDasharray: "3 3",
                            }}
                        />
                        <Bar
                            dataKey="sales"
                            fill="hsl(var(--chart-1))"
                            radius={8}
                            barSize={56}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {percentageChange > 0 ? (
            <>
              Trending up by {percentageChange}% this week <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>Trending down by {Math.abs(percentageChange)}% this week</>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Total sales: Rp{totalSales.toLocaleString()}
        </div>
      </CardFooter> */}
        </Card>
    )
}