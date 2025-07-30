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
import { Badge } from "@/components/ui/badge"
import { DeleteProduction } from "@/components/production/DeleteProduction"
import { formatIDR } from "@/lib/formatCurrency"
import { useTranslations } from "next-intl"
import { DataTable } from "@/components/ui/data-table"
import { Production } from "@/types/product"

const ProductionActions = ({ production }: { production: Production }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/production', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: production.id }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(result.message || "BOM deleted successfully")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to delete BOM")
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
                    <Link href={`/production/${production.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/production/${production.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteProduction onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const useProductionColumns = (): ColumnDef<Production>[] => {
    const t = useTranslations('production.column');

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
            accessorKey: "name",
            header: t('title')
        },
        {
            accessorKey: "description",
            header: t('desc')
        },
        {
            accessorKey: "tag",
            header: t('tag'),
            cell: ({ row }) => (
                <div>
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {row.original.tag}
                    </Badge>
                </div>
            ),

        },
        {
            accessorFn: (row) => row.product.product,
            header: t('output'),
            id: "productName",
        },
        {
            accessorKey: "total",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('cost')}
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
            cell: ({ row }) => <ProductionActions production={row.original} />,
        },
    ]
}

interface ProductionDataTableProps {
    data: Production[]
}

export function ProductionDataTable({ data }: ProductionDataTableProps) {
    const columns = useProductionColumns()
    const t = useTranslations('production.column');
    return <DataTable
        columns={columns}
        data={data}
        searchColumn="name"
        searchPlaceholder={t('search')}
        facetedFilters={[
            {
                columnId: "tag",
                title: "Tag",
                options: [
                    { label: "Milk", value: "Milk" },
                    { label: "Coffee", value: "Coffee" },
                ],
            },
        ]}
    />
}

