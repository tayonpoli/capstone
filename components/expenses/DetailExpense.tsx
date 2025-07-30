import { formatIDR } from "@/lib/formatCurrency"
import { Supplier, Expenses, ExpenseInvoice } from "@prisma/client"
import { CreditCardIcon, Undo2Icon, InfoIcon } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { useTranslations } from "next-intl"

interface ExpenseDetailProps {
    expenses: Expenses & {
        supplier: Supplier
        ExpenseInvoice?: ExpenseInvoice[]
    }
}

export function DetailExpense({ expenses }: ExpenseDetailProps) {

    const t = useTranslations('expenses');

    const totalPaid = expenses.ExpenseInvoice?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0

    return (
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Expenses
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Expenses Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/expenses`}>
                            <Undo2Icon />  Back
                        </Link>
                    </Button>
                </div>
            </div>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>
                        Expenses Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-2/3 flex grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.vendor')}
                            </CardDescription>
                            <Label className="text-md font-medium">{expenses.supplier.name}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.date')}
                            </CardDescription>
                            <Label className="text-md font-medium">{format(new Date(expenses.expenseDate), "dd MMMM yyyy")}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.category')}
                            </CardDescription>
                            <Label className="text-md font-medium">{expenses.category}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.status')}
                            </CardDescription>
                            <Label className="text-md font-medium">{expenses.paymentStatus}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.memo')}
                            </CardDescription>
                            <Label className="text-md font-medium">{expenses.memo}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.total')}
                            </CardDescription>
                            <Label className="text-md font-medium">{formatIDR(expenses.total)}</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {expenses.ExpenseInvoice && expenses.ExpenseInvoice.length > 0 && (
                <div className="my-10">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    <div className="p-2 border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead>Payment Date</TableHead>
                                    {expenses.ExpenseInvoice.some(inv => inv.paymentMethod === 'Transfer') && (
                                        <>
                                            <TableHead>Bank Name</TableHead>
                                            <TableHead>Account Number</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-right">Amount Paid</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.ExpenseInvoice.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <CreditCardIcon className="mr-2 h-4 w-4" />
                                                {invoice.paymentMethod || "Unknown"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {invoice.paymentDate ?
                                                format(new Date(invoice.paymentDate), "dd MMMM yyyy") :
                                                "Not paid"}
                                        </TableCell>
                                        {invoice.paymentMethod === 'Transfer' && (
                                            <>
                                                <TableCell>
                                                    {invoice.bankName || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {invoice.accountNumber || "-"}
                                                </TableCell>
                                            </>
                                        )}
                                        {invoice.paymentMethod !== 'Transfer' &&
                                            expenses.ExpenseInvoice?.some(inv => inv.paymentMethod === 'Transfer') && (
                                                <>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                </>
                                            )}
                                        <TableCell className="text-right">
                                            {formatIDR(invoice.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={expenses.ExpenseInvoice.some(inv => inv.paymentMethod === 'Transfer') ? 4 : 2}
                                        className="font-medium">
                                        Remaining Balance
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatIDR(expenses.total - totalPaid)}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    )
}