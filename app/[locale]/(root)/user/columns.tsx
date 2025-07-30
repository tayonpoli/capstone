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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { DeleteUser } from "@/components/form/DeleteUser"
import { useTranslations } from "next-intl"
import { User } from "@prisma/client"
import { DataTable } from "@/components/ui/data-table"

const UserActions = ({ user }: { user: User }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/user', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user.id }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(result.message || "User deleted successfully")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to delete user")
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
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DeleteUser onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const useUserColumns = (): ColumnDef<User>[] => {
    const t = useTranslations('user.userColumn');

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
            accessorKey: "role",
            header: t('role'),
            cell: ({ row }) => (
                <div className="w-32">
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {row.original.role}
                    </Badge>
                </div>
            ),

        },
        {
            accessorKey: "status",
            header: t('Status'),
            cell: ({ row }) => (
                <div className="w-32">
                    <Badge variant="success" className="px-1.5 text-muted-foreground text-gray-50">
                        {row.original.status}
                    </Badge>
                </div>
            ),

        },
        {
            id: "actions",
            cell: ({ row }) => <UserActions user={row.original} />,
        },
    ]
}

interface UserDataTableProps {
    data: User[]
}

export function UserDataTable({ data }: UserDataTableProps) {
    const columns = useUserColumns()
    const t = useTranslations('user.userColumn');
    return <DataTable
        columns={columns}
        data={data}
        searchColumn="name"
        searchPlaceholder={t('search')}
        facetedFilters={[
            {
                columnId: "role",
                title: t('role'),
                options: [
                    { label: "Owner", value: "Owner" },
                    { label: "Admin", value: "Admin" },
                    { label: "Staff", value: "Staff" },
                ],
            },
            {
                columnId: "status",
                title: "Status",
                options: [
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "Inactive" },
                ],
            },
        ]}
    />
}
