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
import { useTranslations } from "next-intl"
import { DataTable } from "@/components/ui/data-table"
import { POS } from "@/types/sales"

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

export const usePOSColumns = (): ColumnDef<POS>[] => {
    const t = useTranslations('sales.column');

    return [
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
            header: t('staff'),
            id: "staffName",
        },
        {
            accessorKey: "customerName",
            header: t('customer')
        },
        {
            accessorKey: "orderDate",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('date')}
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
            header: t('type'),
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
            header: t('payment'),
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
                        {t('total')}
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
}

interface POSDataTableProps {
    data: POS[]
}

export function POSDataTable({ data }: POSDataTableProps) {
    const columns = usePOSColumns()
    const t = useTranslations('sales.column');
    return <DataTable
        columns={columns}
        data={data}
        searchColumn="customerName"
        searchPlaceholder={t('search')}
        facetedFilters={[
            {
                columnId: "tag",
                title: t('type'),
                options: [
                    { label: "Other", value: "other" },
                    { label: "Shopee", value: "Shopee" },
                    { label: "Grab", value: "Grab" },
                    { label: "Gofood", value: "Gofood" },
                    { label: "Takeaway", value: "Takeaway" },
                ],
            },
        ]}
    />
}