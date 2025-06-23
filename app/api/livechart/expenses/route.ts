import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const start = searchParams.get('start')
        const end = searchParams.get('end')

        // Calculate current month dates
        const now = new Date()
        const currentMonthStart = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth(), 1)
        const currentMonthEnd = end ? new Date(end) : new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // Calculate previous month dates
        const previousMonthStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1, 1)
        const previousMonthEnd = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth(), 0)

        // Get current month expenses by category
        const expensesByCategory = await prisma.expenses.groupBy({
            by: ['category'],
            _sum: {
                total: true
            },
            where: {
                expenseDate: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd
                }
            }
        })

        // Get current month total
        const currentMonthTotal = await prisma.expenses.aggregate({
            _sum: {
                total: true
            },
            where: {
                expenseDate: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd
                }
            }
        })

        // Get previous month total
        const previousMonthTotal = await prisma.expenses.aggregate({
            _sum: {
                total: true
            },
            where: {
                expenseDate: {
                    gte: previousMonthStart,
                    lte: previousMonthEnd
                }
            }
        })

        // Calculate percentage change
        const currentTotal = currentMonthTotal._sum.total || 0
        const previousTotal = previousMonthTotal._sum.total || 0

        let percentageChange = 0
        if (previousTotal > 0) {
            percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100
        } else if (currentTotal > 0) {
            percentageChange = 100 // 100% increase if previous month was 0
        }

        // Transform category data
        const categories = expensesByCategory.map(item => ({
            category: item.category,
            total: item._sum.total || 0,
            fill: `var(--color-${item.category})`
        }))

        // Return simplified data
        return NextResponse.json({
            categories,
            percentageChange: Math.round(percentageChange * 100) / 100 // Round to 2 decimal places
        })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch expense data',
                categories: [],
                percentageChange: 0
            },
            { status: 500 }
        )
    }
}