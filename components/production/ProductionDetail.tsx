import { formatIDR } from "@/lib/formatCurrency"
import { Inventory, Production, Material } from "@prisma/client"
import { Undo2Icon, CalendarIcon, TagIcon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"

interface ProductionDetailProps {
    production: Production & {
        product: Inventory
        materials: (Material & {
            material: Inventory
        })[]
    }
}

export function ProductionDetail({ production }: ProductionDetailProps) {
    return (
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Production
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Bills of Material Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/production`}>
                            <Undo2Icon className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/production/${production.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Order Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">General Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Created Date</p>
                                <p>{format(new Date(production.createdAt), "dd MMMM yyyy")}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Title</p>
                                <p className="capitalize">{production.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Tag</p>
                                <p className="capitalize">{production.tag}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="capitalize">{production.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Product Output</p>
                                <p className="capitalize">{production.product.product}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Order Items */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Components</h2>
                <div className="p-2 lg:w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead >Component</TableHead>
                                <TableHead >Item Code/SKU</TableHead>
                                <TableHead className="text-center w-[100px]">Qty</TableHead>
                                <TableHead className="text-center">Unit</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {production.materials.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.material.product}</TableCell>
                                    <TableCell className="font-medium">{item.material.code}</TableCell>
                                    <TableCell className="text-center">{item.qty}</TableCell>
                                    <TableCell className="text-center">{item.unit}</TableCell>
                                    <TableCell className="text-right">{formatIDR(item.price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="font-medium">
                                    Total Cost
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatIDR(production.total)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </div>
    )
}