import { Supplier } from "@prisma/client"
import { InfoIcon, Undo2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"

interface SupplierDetailProps {
    supplier: Supplier
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
            <div>
                <div className="lg:w-150 grid grid-cols-2 gap-8 mt-2">
                    <div className="mt-4 col-span-2 flex flex-center items-center text-lg font-semibold">
                        <InfoIcon />
                        <h2 className="ml-3">Supplier Information</h2>
                    </div>
                    <div className="font-medium text-gray-500">
                        Name
                    </div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="font-medium text-gray-500">
                        Email
                    </div>
                    <div className="font-medium">{supplier.email}</div>
                    <div className="font-medium text-gray-500">
                        Phone Number
                    </div>
                    <div className="font-medium">{supplier.phone}</div>
                    <div className="font-medium text-gray-500">
                        Address
                    </div>
                    <div className="font-medium">{supplier.address}</div>
                </div>
            </div>
        </div>
    )
}