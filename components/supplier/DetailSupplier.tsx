import { Supplier } from "@prisma/client"
import { Undo2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface SupplierDetailProps {
    supplier: Supplier & {
        contacts?: {
            id: string
            name: string
            department: string
            email: string | null
            phone: string | null
        }[]
    }
}

export function DetailSupplier({ supplier }: SupplierDetailProps) {
    return (
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Suppliers
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Supplier Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/supplier`}>
                            <Undo2Icon />  Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/supplier/${supplier.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>
                        Supplier Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-2/3 flex grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <CardDescription>
                                Name
                            </CardDescription>
                            <Label className="text-md font-medium">{supplier.name}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Email
                            </CardDescription>
                            <Label className="text-md font-medium">{supplier.email || '-'}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Phone Number
                            </CardDescription>
                            <Label className="text-md font-medium">{supplier.phone || '-'}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Address
                            </CardDescription>
                            <Label className="text-md font-medium">{supplier.address || '-'}</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {supplier.contacts && supplier.contacts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Contacts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {supplier.contacts.map((contact) => (
                                    <TableRow key={contact.id}>
                                        <TableCell>{contact.name}</TableCell>
                                        <TableCell>
                                            <Badge variant='secondary'>
                                                {contact.department}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{contact.email || '-'}</TableCell>
                                        <TableCell>{contact.phone || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}