import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { reportType, startDate, endDate, includeSummary } = await req.json()

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
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  product: true,
                  code: true
                }
              }
            }
          }
        },
        orderBy: {
          orderDate: 'desc'
        }
      })

      if (includeSummary) {
        const summary = {
          totalAmount: salesData.reduce((sum, order) => sum + order.total, 0),
          totalOrders: salesData.length,
          averageOrder: salesData.length > 0
            ? salesData.reduce((sum, order) => sum + order.total, 0) / salesData.length
            : 0,
          paidOrders: salesData.filter(order => order.paymentStatus === 'Paid').length,
          unpaidOrders: salesData.filter(order => order.paymentStatus === 'Unpaid').length,
          statusCounts: {
            completed: salesData.filter(order => order.status === 'Completed').length,
            approved: salesData.filter(order => order.status === 'Approved').length,
            draft: salesData.filter(order => order.status === 'Draft').length,
            cancelled: salesData.filter(order => order.status === 'Cancelled').length
          }
        }

        return NextResponse.json({
          records: salesData,
          summary
        })
      }

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
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  product: true,
                  code: true
                }
              }
            }
          }
        },
        orderBy: {
          purchaseDate: 'desc'
        }
      })

      if (includeSummary) {
        const summary = {
          totalAmount: purchasingData.reduce((sum, order) => sum + order.total, 0),
          totalOrders: purchasingData.length,
          averageOrder: purchasingData.length > 0
            ? purchasingData.reduce((sum, order) => sum + order.total, 0) / purchasingData.length
            : 0,
          paidOrders: purchasingData.filter(order => order.paymentStatus === 'Paid').length,
          unpaidOrders: purchasingData.filter(order => order.paymentStatus === 'Unpaid').length,
          statusCounts: {
            completed: purchasingData.filter(order => order.status === 'Completed').length,
            approved: purchasingData.filter(order => order.status === 'Approved').length,
            draft: purchasingData.filter(order => order.status === 'Draft').length,
            cancelled: purchasingData.filter(order => order.status === 'Cancelled').length
          },
          urgencyCounts: {
            low: purchasingData.filter(order => order.urgency === 'Low').length,
            medium: purchasingData.filter(order => order.urgency === 'Medium').length,
            high: purchasingData.filter(order => order.urgency === 'High').length
          }
        }

        return NextResponse.json({
          records: purchasingData,
          summary
        })
      }

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