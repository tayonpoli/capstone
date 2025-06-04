import { formatIDR } from "@/lib/formatCurrency"
import { Inventory, PurchaseOrder, Staff, Supplier, PurchaseItem, Invoice, Expenses, ExpenseInvoice } from "@prisma/client"
import { CalendarIcon, TagIcon, FileTextIcon, MapPinIcon, MailIcon, CreditCardIcon, Undo2Icon, InfoIcon } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import Link from "next/link"

interface ExpenseDetailProps {
    expenses: Expenses & {
        supplier: Supplier
        ExpenseInvoice?: ExpenseInvoice[]
    }
}

export function DetailExpense({ expenses }: ExpenseDetailProps) {

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
            <div>
                <div className="lg:w-150 grid grid-cols-2 gap-8 mt-2">
                    <div className="col-span-2 flex flex-center items-center text-lg font-semibold">
                        <InfoIcon />
                        <h2 className="ml-3">Expenses Information</h2>
                    </div>
                    <div className="font-medium text-gray-500">
                        Vendor
                    </div>
                    <div className="font-medium">{expenses.supplier.name}</div>
                    <div className="font-medium text-gray-500">
                        Date
                    </div>
                    <div className="font-medium">{format(new Date(expenses.expenseDate), "dd MMMM yyyy")}</div>
                    <div className="font-medium text-gray-500">
                        Category
                    </div>
                    <div className="font-medium">{expenses.category}</div>
                    <div className="font-medium text-gray-500">
                        Payment Status
                    </div>
                    <div className="font-medium">{expenses.paymentStatus}</div>
                    <div className="font-medium text-gray-500">
                        Memo
                    </div>
                    <div className="font-medium">{expenses.memo}</div>
                    <div className="font-medium text-gray-500">
                        Total amount
                    </div>
                    <div className="font-medium">{formatIDR(expenses.total)}</div>
                </div>
            </div>

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