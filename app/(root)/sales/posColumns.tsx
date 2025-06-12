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
import { Badge } from "@/components/ui/badge"
import { SalesInvoice } from "@prisma/client"

export type POS = {
    id: string
    customerName: string | null
    total: number
    tag: string | null
    memo: string | null
    paymentStatus: string
    userId: string
    user: {
        name: string | null
    }
    orderDate: Date
    createdAt: Date
    updatedAt: Date
    SalesInvoice: {
        paymentMethod: string | null
    }[]
}

const PosActions = ({ sales }: { sales: POS }) => {
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
            throw error
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
                    <Link href={`/sales/${sales.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/sales/${sales.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteSales onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const posColumns: ColumnDef<POS>[] = [
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
        accessorFn: (row) => row.user.name,
        header: "Staff",
        id: "staffName",
    },
    {
        accessorKey: "customerName",
        header: "Customer Name"
    },
    {
        accessorKey: "orderDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Order Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("orderDate") as Date
            return <div className="ml-4">{format(new Date(date), "dd MMM yyyy")}</div>
        },
    },
    {
        accessorKey: "tag",
        header: "Type",
        cell: ({ row }) => (
            <div className="w-32">
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {row.original.tag || "No tag"}
                </Badge>
            </div>
        ),
    },
    {
        id: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }) => {
            const method = row.original.SalesInvoice?.[0]?.paymentMethod || "Unknown"
            return (
                <div className="w-32">
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {method}
                    </Badge>
                </div>
            )
        },
    },

    {
        accessorKey: "total",
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
            const amount = parseFloat(row.getValue("total"))
            return <div className="font-medium">{formatIDR(amount)}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <PosActions sales={row.original} />,
    },
]