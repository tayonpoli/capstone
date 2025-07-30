"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { useTranslations } from "next-intl"
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
import { DeleteCustomer } from "@/components/customer/DeleteCustomer"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Customer } from "@prisma/client"

const CustomerActions = ({ customer }: { customer: Customer }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/customer', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: customer.id }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || "Customer deleted successfully");
                router.refresh();
            } else {
                throw new Error(result.error || "Failed to delete customer");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
            console.error('Delete error:', error);
            throw error;
        }
    };

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
                    <Link href={`/customer/${customer.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/customer/${customer.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteCustomer onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const useCustomerColumns = (): ColumnDef<Customer>[] => {
    const t = useTranslations('contacts.column');

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
            header: t('name'),
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('email')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "phone",
            header: t('phone'),
        },
        {
            accessorKey: "address",
            header: t('address'),
        },
        {
            id: "actions",
            cell: ({ row }) => <CustomerActions customer={row.original} />,
        },
    ];
};

interface CustomerDataTableProps {
    data: Customer[]
}

export function CustomerDataTable({ data }: CustomerDataTableProps) {
    const columns = useCustomerColumns()
    const t = useTranslations('contacts.customer');
    return <DataTable
        columns={columns}
        data={data}
        searchColumn="name"
        searchPlaceholder={t('search')}
    />
}