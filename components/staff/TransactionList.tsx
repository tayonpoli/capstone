"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Staff } from "@prisma/client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "../ui/badge"
import Link from "next/link"
import { Button } from "../ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { formatIDR } from "@/lib/formatCurrency"
import { Checkbox } from "../ui/checkbox"
import { useTranslations } from "next-intl"
import { DataTable } from "../ui/data-table"
import { Sales } from "@/types/sales"

interface TransactionListProps {
    sales: (Sales & { user: { email: string } })[]
    staff: Staff
}

const SalesActions = ({ sales }: { sales: Sales }) => {
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
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export const useSalesColumns = (): ColumnDef<Sales>[] => {
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
            accessorFn: (row) => row.customerName || row.customer.name,
            header: t('customer'),
            id: "customerName",
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
            accessorKey: "paymentStatus",
            header: t('status'),
            cell: ({ row }) => (
                <div className="w-32">
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {row.original.paymentStatus}
                    </Badge>
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => <SalesActions sales={row.original} />,
        },
    ]
}

export function TransactionList({ sales, staff }: TransactionListProps) {
    const filteredSales = sales.filter(sales => sales.user.email === staff.email)
    const columns = useSalesColumns()
    const t = useTranslations('sales.column');
    return (
        <div className="px-4 mb-4">
            <DataTable
                columns={columns}
                data={filteredSales}
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
                    {
                        columnId: "paymentStatus",
                        title: "Status",
                        options: [
                            { label: "Unpaid", value: "Unpaid" },
                            { label: "Paid", value: "Paid" },
                        ],
                    },
                ]}
            />
        </div>
    )
}

// export function TransactionList({ sales, staff }: TransactionListProps) {

//     return (
//         <div className="p-4">
//             <Card>
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <CardTitle>Recent Transactions</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     {filteredSales.length === 0 ? (
//                         <div className="text-center py-4 text-gray-500">
//                             No transactions found for this staff.
//                         </div>
//                     ) : (
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>
//                                         <div className="flex items-center">
//                                             Date
//                                             <ArrowUpDown className="ml-2 h-4 w-4" />
//                                         </div>
//                                     </TableHead>
//                                     <TableHead>Invoice</TableHead>
//                                     <TableHead>Customer</TableHead>
//                                     <TableHead>Amount</TableHead>
//                                     <TableHead>Status</TableHead>
//                                     <TableHead className="text-right">Action</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {filteredSales.map((sales) => (
//                                     <TableRow key={sales.id}>
//                                         <TableCell>{format(new Date(sales.orderDate), "dd MMMM yyyy")}</TableCell>
//                                         <TableCell>{sales.customerName || '-'}</TableCell>
//                                         <TableCell>{formatIDR(sales.total)}</TableCell>
//                                         <TableCell>
//                                             <Badge variant={sales.paymentStatus === 'Paid' ? 'success' : 'secondary'}>
//                                                 {sales.paymentStatus}
//                                             </Badge>
//                                         </TableCell>
//                                         <TableCell className="text-right">
//                                             <Button asChild variant="ghost" size="sm">
//                                                 <Link href={`/sales/${sales.id}`}>
//                                                     View
//                                                 </Link>
//                                             </Button>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     )
// }