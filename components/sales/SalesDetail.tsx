import { formatIDR } from "@/lib/formatCurrency"
import { SalesOrder, Customer, SalesItem, Inventory } from "@prisma/client"
import { InfoIcon, Undo2Icon, CalendarIcon, TagIcon, FileTextIcon, MapPinIcon, MailIcon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"

interface SalesDetailProps {
    sales: SalesOrder & {
        customer: Customer
        items: (SalesItem & {
            product: Inventory
        })[]
    }
}

export function SalesDetail({ sales }: SalesDetailProps) {
    return (
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Sales
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Sales Order Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/sales`}>
                            <Undo2Icon className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/sales/${sales.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Order Information */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p>{format(new Date(sales.orderDate), "dd MMMM yyyy")}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="capitalize">{sales.status}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Tag</p>
                                    <p>{sales.tag || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FileTextIcon className="mr-2 h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Memo</p>
                                    <p>{sales.memo || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Customer Name</p>
                                <p>{sales.customer.name}</p>
                            </div>
                            <div className="flex items-center">
                                <MailIcon className="mr-2 h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p>{sales.email || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <MapPinIcon className="mr-2 h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p>{sales.address || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                {/* Right Column - Order Items */}
<div>
  <h2 className="text-xl font-semibold mb-4">Order Items</h2>
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
        {sales.items.map((item) => (
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
            {formatIDR(sales.total)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</div>
            </div>
    )
}