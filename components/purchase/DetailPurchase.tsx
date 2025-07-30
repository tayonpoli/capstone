import { formatIDR } from "@/lib/formatCurrency"
import { Inventory, PurchaseOrder, Staff, Supplier, PurchaseItem, Invoice } from "@prisma/client"
import { CreditCardIcon } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"

interface PurchaseDetailProps {
    purchase: PurchaseOrder & {
        staff: Staff
        supplier: Supplier
        items: (PurchaseItem & {
            product: Inventory
        })[]
        Invoice?: Invoice[]
    }
}

export function DetailPurchase({ purchase }: PurchaseDetailProps) {

    const totalPaid = purchase.Invoice?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0

    return (
        <div className="px-4">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>
                        Order Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-2/3 flex grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <CardDescription>
                                Purchase date
                            </CardDescription>
                            <Label className="text-md font-medium">{format(new Date(purchase.purchaseDate), "dd MMMM yyyy")}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Due Date
                            </CardDescription>
                            <Label className="text-md font-medium">{format(new Date(purchase.dueDate), "dd MMMM yyyy")}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Staff name
                            </CardDescription>
                            <Label className="text-md font-medium">{purchase.staff.name}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Tag
                            </CardDescription>
                            <Label className="text-md font-medium">{purchase.tag || "-"}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Payment status
                            </CardDescription>
                            {(purchase.paymentStatus === 'Paid') && (
                                <Badge className="text-sm font-medium">
                                    {purchase.paymentStatus}
                                </Badge>
                            ) || (
                                    <Badge variant='secondary' className="text-sm font-medium">
                                        {purchase.paymentStatus}
                                    </Badge>
                                )}
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Memo
                            </CardDescription>
                            <Label className="text-md font-medium">{purchase.memo || "-"}</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="my-4">
                <CardHeader>
                    <CardTitle>
                        Supplier Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-2/3 flex grid grid-cols-2 space-y-6">
                        <div className="space-y-1">
                            <CardDescription>
                                Name
                            </CardDescription>
                            <Label className="text-md font-medium">{purchase.supplier.name}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Contact
                            </CardDescription>
                            <Label className="text-md font-medium">{purchase.contact}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Email
                            </CardDescription>
                            <Label className="text-md font-medium">{purchase.supplier.email || "-"}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Address
                            </CardDescription>
                            <Label className="text-md font-medium">{purchase.supplier.address || "-"}</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Column - Order Items */}
            <div className="my-6">
                <h2 className="text-xl font-semibold mb-4">Purchase Items</h2>
                <div className="p-2 border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Product</TableHead>
                                <TableHead className="text-center w-[100px]">SKU</TableHead>
                                <TableHead className="w-[200px]">Note</TableHead>
                                <TableHead className="text-center w-[100px]">Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchase.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product.product}</TableCell>
                                    <TableCell className="text-center">{item.product.code}</TableCell>
                                    <TableCell>{item.note}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        {formatIDR(item.price)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatIDR(item.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5} className="font-medium">
                                    Grand Total
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatIDR(purchase.total)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>

            {purchase.Invoice && purchase.Invoice.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    <div className="p-2 border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead>Payment Date</TableHead>
                                    {purchase.Invoice.some(inv => inv.paymentMethod === 'Transfer') && (
                                        <>
                                            <TableHead>Bank Name</TableHead>
                                            <TableHead>Account Number</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-right">Amount Paid</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchase.Invoice.map((invoice) => (
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
                                            purchase.Invoice?.some(inv => inv.paymentMethod === 'Transfer') && (
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
                                    <TableCell colSpan={purchase.Invoice.some(inv => inv.paymentMethod === 'Transfer') ? 4 : 2}
                                        className="font-medium">
                                        Remaining Balance
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatIDR(purchase.total - totalPaid)}
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