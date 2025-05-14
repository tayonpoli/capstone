import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const start = searchParams.get('start')
        const end = searchParams.get('end')

        if (!start || !end) {
            return NextResponse.json(
                { error: 'Missing date range parameters' },
                { status: 400 }
            )
        }

        const startDate = new Date(start)
        const endDate = new Date(end)

        // Get completed sales orders within date range
        const sales = await prisma.salesOrder.findMany({
            where: {
                orderDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'Completed',
            },
            select: {
                orderDate: true,
                total: true,
            },
            orderBy: {
                orderDate: 'asc',
            },
        })

        // Get completed purchase orders within date range
        const purchases = await prisma.purchaseOrder.findMany({
            where: {
                purchaseDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'Completed',
            },
            select: {
                purchaseDate: true,
                total: true,
            },
            orderBy: {
                purchaseDate: 'asc',
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                sales,
                purchases,
            },
        })
    } catch (error) {
        console.error('[SALES_EXPENSES_ERROR]', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}