import { Staff } from "@prisma/client"
import { Undo2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"

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
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>
                        Staff Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-2/3 flex grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <CardDescription>
                                Name
                            </CardDescription>
                            <Label className="text-md font-medium">{staff.name}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Email
                            </CardDescription>
                            <Label className="text-md font-medium">{staff.email}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Phone Number
                            </CardDescription>
                            <Label className="text-md font-medium">{staff.phone}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Address
                            </CardDescription>
                            <Label className="text-md font-medium">{staff.address}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Position
                            </CardDescription>
                            <Badge variant='outline' className="text-md font-medium">{staff.position}</Badge>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Type
                            </CardDescription>
                            {(staff.type === 'FullTime') && (
                                <Badge className="text-md font-medium">
                                    Full-Time
                                </Badge>
                            ) || (
                                    <Badge variant='secondary' className="text-md font-medium">
                                        Part-Time
                                    </Badge>
                                )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}