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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Invitation } from "@prisma/client"
import { format } from "date-fns"
import { DeleteInvitation } from "@/components/form/DeleteInvitation"


const InviteActions = ({ invitation }: { invitation: Invitation }) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/invite', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: invitation.id }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(result.message || "User invitation deleted successfully")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to delete the invitation")
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
                    <DeleteInvitation onConfirm={handleDelete} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const inviteColumns: ColumnDef<Invitation>[] = [
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
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <div className="w-32">
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {row.original.role}
                </Badge>
            </div>
        ),

    },
    {
        accessorKey: "expiresAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Expired Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("expiresAt") as Date
            return <div className="ml-4">{format(new Date(date), "dd MMM yyyy")}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <InviteActions invitation={row.original} />,
    },
]


