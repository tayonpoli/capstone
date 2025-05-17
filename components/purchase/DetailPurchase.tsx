import { formatIDR } from "@/lib/formatCurrency"
import { Inventory, PurchaseOrder, Staff, Supplier, PurchaseItem, Invoice } from "@prisma/client"
import { CalendarIcon, TagIcon, FileTextIcon, MapPinIcon, MailIcon, CreditCardIcon } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Order Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Staff Name</p>
                            <p>{purchase.staff.name}</p>
                        </div>
                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Order Date</p>
                                <p>{format(new Date(purchase.purchaseDate), "dd MMMM yyyy")}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Payment Status</p>
                                <p className="capitalize">{purchase.paymentStatus}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Tag</p>
                                <p>{purchase.tag || "-"}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FileTextIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Memo</p>
                                <p>{purchase.memo || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Supplier Information</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Supplier Name</p>
                            <p>{purchase.supplier.name}</p>
                        </div>
                        <div className="flex items-center">
                            <MailIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p>{purchase.supplier.email || "-"}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <MapPinIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p>{purchase.supplier.address || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Order Items */}
            <div className="mb-8">
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