"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatIDR } from "@/lib/formatCurrency"
import { format } from "date-fns"
import { DeleteSales } from "@/components/sales/DeleteSales"

export type SalesInvoice = {
    id: string
    amount: number
    paymentMethod: string | null
    bankName: string | null
    accountNumber: string | null
    paymentDate: Date | null
    salesOrderId: string
    salesOrder: {
        customerId: string
        customer: {
            name: string | null
        }
    }
    createdAt: Date
    updatedAt: Date
}

const InvoiceActions = ({ sales }: { sales: SalesInvoice }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/sales', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: sales.id }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(result.message || "Sales order deleted successfully")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to delete sales order")
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
            console.error('Delete error:', error)
            throw error // Penting untuk ditangkap oleh DeleteProduct
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/sales/${sales.salesOrderId}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/sales/${sales.salesOrderId}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteSales onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const invoiceColumns: ColumnDef<SalesInvoice>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "createdAt",
        header: "Invoice Number",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as Date
            // Format tanggal ke dalam bentuk ddmmyy (140525 untuk 14 May 2025)
            const invoiceNumber = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
            return <div>Sales Invoice #{invoiceNumber}</div>;
        },
    },
    {
        accessorFn: (row) => row.salesOrder.customer.name,
        header: "Customer",
        id: "customerName",
    },
    {
        accessorKey: "paymentMethod",
        header: "Payment Method",
    },
    {
        accessorKey: "paymentDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Payment Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("paymentDate") as Date
            return <div className="ml-4">{format(new Date(date), "dd MMM yyyy")}</div>
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            return <div className="font-medium">{formatIDR(amount)}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <InvoiceActions sales={row.original} />,
    },
]