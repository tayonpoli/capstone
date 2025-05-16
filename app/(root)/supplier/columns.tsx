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
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DeleteSupplier } from "@/components/supplier/DeleteSupplier"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Supplier = {
    id: string
    name: string | null
    email: string
    phone: string
    address: string
    createdAt: Date
}

const SupplierActions = ({ supplier }: { supplier: Supplier }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/supplier', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: supplier.id }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(result.message || "Supplier deleted successfully")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to delete supplier")
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
                    <Link href={`/supplier/${supplier.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/supplier/${supplier.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteSupplier onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const columns: ColumnDef<Supplier>[] = [
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
        header: "Name",
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "address",
        header: "Address",
    },
    {
        id: "actions",
        cell: ({ row }) => <SupplierActions supplier={row.original} />,
    },
]


