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
import { DeleteProduct } from "@/components/products/DeleteProduct"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { DeleteProduction } from "@/components/production/DeleteProduction"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Production = {
    id: string
    name: string
    description: string | null
    productId: string
    product: {
        product: string
    }
    // status: "pending" | "processing" | "success" | "failed"
}

export const columns: ColumnDef<Production>[] = [
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
        header: "Title",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorFn: (row) => row.product.product,
        header: "Output",
        id: "productName", // Berikan ID yang lebih sederhana
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const production = row.original
            const router = useRouter()

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
                            <DeleteProduction productionId={production.id} onConfirm={handleDelete} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    }
]


