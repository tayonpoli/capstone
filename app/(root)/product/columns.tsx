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
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export type Product = {
    id: string
    product: string
    code: string
    category: string
    buyprice: number | null
    sellprice: number | null
    stock: number
}

const ProductActions = ({ product }: { product: Product }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/product', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: product.id }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(result.message || "Product deleted successfully")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to delete product")
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
                    <Link href={`/product/${product.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/products/${product.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteProduct onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};


export const columns: ColumnDef<Product>[] = [
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
        accessorKey: "product",
        header: "Product",
    },
    {
        accessorKey: "code",
        header: "Product Code",
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <div className="w-32">
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {row.original.category}
                </Badge>
            </div>
        ),

    },
    {
        accessorKey: "buyprice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Buy Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("buyprice"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "IDR",
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "sellprice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Sell Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("sellprice"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "IDR",
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "stock",
        header: ({ column }) => {
            return (
                <div className="w-full text-center">
                    <Button
                        variant="ghost"
                        className="mx-auto"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Stock
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const stockValue = row.getValue("stock");
            // Handle berbagai tipe data dan lakukan floor
            const flooredStock = Math.floor(Number(stockValue));
            return (
                <div className="text-center">{flooredStock}</div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ProductActions product={row.original} />,
    },
]


