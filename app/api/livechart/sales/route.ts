
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, format } from 'date-fns'

export async function GET() {
    try {
        const startDate = subDays(new Date(), 7)

        // 1. Ambil data penjualan per hari
        const dailySales = await prisma.salesOrder.groupBy({
            by: ['orderDate'],
            where: {
                orderDate: {
                    gte: startDate,
                    lte: new Date()
                },
                status: 'Completed' // Hanya pesanan yang selesai
            },
            _sum: {
                total: true
            },
            orderBy: {
                orderDate: 'asc'
            }
        })

        // 2. Format data untuk chart
        const formattedData = dailySales
            .filter(item => item.orderDate !== null)
            .map(item => ({
                date: format(new Date(item.orderDate), 'yyyy-MM-dd'), // ⬅ full date
                sales: item._sum.total || 0
            }))

        const allDays = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i)
            return {
                date: format(date, 'yyyy-MM-dd'),
                sales: 0
            }
        })

        const completeData = allDays.map(day => {
            const existing = formattedData.find(d => d.date === day.date)
            return existing || day
        })

        return NextResponse.json(completeData)

    } catch (error) {
        console.error('Error fetching sales data:', error)
        return NextResponse.json(
            { error: "Failed to fetch sales data" },
            { status: 500 }
        )
    }
}