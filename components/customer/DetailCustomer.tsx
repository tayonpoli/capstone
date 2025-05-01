import { formatIDR } from "@/lib/formatCurrency"
import { Customer } from "@prisma/client"
import { InfoIcon, Undo2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"

interface CustomerDetailProps {
    customer: Customer
}

export function DetailCustomer({ customer }: CustomerDetailProps) {
    return (
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Customers
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Customer Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/customer`}>
                            <Undo2Icon />  Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/customer/${customer.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>
            <h1 className="text-2xl font-semibold mb-4">{customer.name}</h1>
            <div>
                <div className="lg:w-150 grid grid-cols-2 gap-8 mt-4">
                    <div className="mt-4 col-span-2 flex flex-center items-center text-lg font-semibold">
                        <InfoIcon />
                        <h2 className="ml-3">Customer Information</h2>
                    </div>
                    <div className="font-medium text-gray-500">
                        Email
                    </div>
                    <div className="font-medium">{customer.email}</div>
                    <div className="font-medium text-gray-500">
                        Phone Number
                    </div>
                    <div className="font-medium">{customer.phone}</div>
                    <div className="font-medium text-gray-500">
                        Address
                    </div>
                    <div className="font-medium">{customer.address}</div>
                </div>
            </div>
        </div>
    )
}