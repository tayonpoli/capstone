import { formatIDR } from "@/lib/formatCurrency"
import { Inventory, PurchaseOrder, Staff, Supplier, PurchaseItem } from "@prisma/client"
import { InfoIcon, Undo2Icon, CalendarIcon, TagIcon, FileTextIcon, MapPinIcon, MailIcon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"

interface PurchaseDetailProps {
    purchase: PurchaseOrder & {
        staff: Staff
        supplier: Supplier
        items: (PurchaseItem & {
            product: Inventory
        })[]
    }
}

export function DetailPurchase({ purchase }: PurchaseDetailProps) {
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
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="capitalize">{purchase.status}</p>
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
            <div>
                <h2 className="text-xl font-semibold mb-4">Purchase Items</h2>
                <div className="p-2">
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
        </div>
    )
}