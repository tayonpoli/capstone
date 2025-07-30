import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { prisma } from "@/lib/prisma"
import { formatIDR } from "@/lib/formatCurrency"
import { format } from "date-fns"
import { Badge } from "../ui/badge"
import { getTranslations } from "next-intl/server"

type RecentPurchase = {
    id: string
    total: number
    paymentStatus: string
    supplierId: string
    supplier: {
        name: string | null
    }
    purchaseDate: Date
}

async function getData(): Promise<RecentPurchase[]> {
    try {
        const purchase = await prisma.purchaseOrder.findMany({
            include: {
                supplier: {
                    select: {
                        name: true
                    }
                },
            },
            orderBy: {
                purchaseDate: 'desc'
            },
            take: 5,
        })

        return purchase

    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

export async function RecentTransactions() {
    const t = await getTranslations('HomePage.purchaseChart');

    const data = await getData();

    return (
        <Card>
            <CardHeader className="mb-4">
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-3 px-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('date')}</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">{t('total')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((transaction) => (
                                <TableRow key={transaction.id} className="lg:h-[56px]">
                                    <TableCell>{format(new Date(transaction.purchaseDate), "dd MMMM yyyy")}</TableCell>
                                    <TableCell>{transaction.supplier.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="px-1.5 text-muted-foreground">
                                            {transaction.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatIDR(transaction.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}