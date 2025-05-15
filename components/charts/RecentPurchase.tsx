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

async function getData(): Promise<any[]> {
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

    const data = await getData();

    return (
        <Card>
            <CardHeader className="mb-4">
                <CardTitle>Recent Purchase</CardTitle>
                <CardDescription>Showing recent purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((transaction) => (
                                <TableRow key={transaction.id} className="lg:h-[56px]">
                                    <TableCell>{format(new Date(transaction.purchaseDate), "dd MMMM yyyy")}</TableCell>
                                    <TableCell>{transaction.supplier.name}</TableCell>
                                    <TableCell>{transaction.paymentStatus}</TableCell>
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