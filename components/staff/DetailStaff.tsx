import { Staff } from "@prisma/client"
import { InfoIcon, Undo2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"

interface StaffDetailProps {
    staff: Staff
}

export function DetailStaff({ staff }: StaffDetailProps) {
    return (
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Contacts
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Staff Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/staff`}>
                            <Undo2Icon />  Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/staff/${staff.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="lg:w-150 grid grid-cols-2 gap-8 mt-2">
                <div className="mt-4 col-span-2 flex flex-center items-center text-lg font-semibold">
                    <InfoIcon />
                    <h2 className="ml-3">Staff Information</h2>
                </div>
                <div className="font-medium text-gray-500">
                    Name
                </div>
                <div className="font-medium">{staff.name}</div>
                <div className="font-medium text-gray-500">
                    Email
                </div>
                <div className="font-medium">{staff.email}</div>
                <div className="font-medium text-gray-500">
                    Position
                </div>
                <div className="font-medium">{staff.position}</div>
                <div className="font-medium text-gray-500">
                    Phone Number
                </div>
                <div className="font-medium">{staff.phone}</div>
                <div className="font-medium text-gray-500">
                    Address
                </div>
                <div className="font-medium">{staff.address}</div>
            </div>
        </div>
    )
}