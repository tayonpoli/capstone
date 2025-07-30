"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

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
import { DeleteStaff } from "@/components/staff/DeleteStaff"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { Staff } from "@prisma/client"
import { DataTable } from "@/components/ui/data-table"

const StaffActions = ({ staff }: { staff: Staff }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/staff', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: staff.id }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(result.message || "Staff deleted successfully")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to delete staff")
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
                    <Link href={`/staff/${staff.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/staff/${staff.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteStaff onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const useStaffColumns = (): ColumnDef<Staff>[] => {
    const t = useTranslations('staff.column');

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
            header: t('name')
        },
        {
            accessorKey: "email",
            header: t('email')
        },
        {
            accessorKey: "position",
            header: t('position'),
            cell: ({ row }) => (
                <div>
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {row.original.position}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: t('type'),
            cell: ({ row }) => (
                <div>
                    {(row.original.type === 'FullTime') && (
                        <Badge className="px-1.5">
                            Full-Time
                        </Badge>
                    ) || (
                            <Badge variant="secondary" className="px-1.5">
                                Part-Time
                            </Badge>
                        )}
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: t('phone')
        },
        {
            accessorKey: "address",
            header: t('address')
        },
        {
            id: "actions",
            cell: ({ row }) => <StaffActions staff={row.original} />,
        },
    ]
}

interface StaffDataTableProps {
    data: Staff[]
}

export function StaffDataTable({ data }: StaffDataTableProps) {
    const columns = useStaffColumns()
    const t = useTranslations('staff.column');
    return <DataTable
        columns={columns}
        data={data}
        searchColumn="name"
        searchPlaceholder={t('search')}
        facetedFilters={[
            {
                columnId: "position",
                title: t('position'),
                options: [
                    { label: "Cashier", value: "Cashier" },
                    { label: "Barista", value: "Barista" },
                    { label: "Head Bar", value: "Headbar" },
                    { label: "Admin", value: "Admin" },
                ],
            },
        ]}
    />
}