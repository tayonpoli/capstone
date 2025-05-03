import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { reportType, startDate, endDate } = await req.json()

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (reportType === 'sales') {
      const salesData = await prisma.salesOrder.findMany({
        where: {
          orderDate: {
            gte: start,
            lte: end
          }
        },
        include: {
          customer: {
            select: {
              name: true
            }
          },
          items: true
        },
        orderBy: {
          orderDate: 'desc'
        }
      })
      return NextResponse.json(salesData)
    }

    if (reportType === 'purchasing') {
      const purchasingData = await prisma.purchaseOrder.findMany({
        where: {
          purchaseDate: {
            gte: start,
            lte: end
          }
        },
        include: {
          supplier: {
            select: {
              name: true
            }
          },
          items: true
        },
        orderBy: {
          purchaseDate: 'desc'
        }
      })
      return NextResponse.json(purchasingData)
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}