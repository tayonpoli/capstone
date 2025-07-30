import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const allowedRoles = ['Admin', 'Owner'];

  // Jika tidak ada session, redirect ke login
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: 'You are unauthorized' },
      { status: 401 }
    );
  }

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
          SalesInvoice: {
            select: {
              paymentMethod: true,
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
        const unpaidOrders = salesData.filter(order => order.paymentStatus === 'Unpaid');
        const receivable = unpaidOrders.reduce((sum, order) => sum + order.total, 0);

        const summary = {
          totalAmount: salesData.reduce((sum, order) => sum + order.total, 0),
          totalOrders: salesData.length,
          paidOrders: salesData.filter(order => order.paymentStatus === 'Paid').length,
          unpaidOrders: unpaidOrders.length,
          account: receivable,
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
          Invoice: {
            select: {
              paymentMethod: true,
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
        const unpaidOrders = purchasingData.filter(order => order.paymentStatus === 'Unpaid');
        const payable = unpaidOrders.reduce((sum, order) => sum + order.total, 0);

        const summary = {
          totalAmount: purchasingData.reduce((sum, order) => sum + order.total, 0),
          totalOrders: purchasingData.length,
          paidOrders: purchasingData.filter(order => order.paymentStatus === 'Paid').length,
          unpaidOrders: unpaidOrders.length,
          account: payable,
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