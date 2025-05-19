import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { User, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

async function getData(): Promise<User[]> {
    try {
        const users = await prisma.user.findMany()
        return users
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

export default async function page() {
    const session = await getServerSession(authOptions);

    const allowedRoles = ['Owner'];

    // Jika tidak ada session, redirect ke login
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/unauthorized")
    }

    const data = await getData();

    return (
        <div className="min-h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-6">
                <div className="text-3xl font-semibold pl-1">
                    User Management
                </div>
                <div className="flex justify-end">
                    <Link href='/user/create'>
                        <Button>
                            <PlusIcon />Invite User
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="container mx-auto py-4">
                <DataTable
                    columns={columns}
                    data={data}
                    searchColumn="name"
                    searchPlaceholder="Search user ..."
                    facetedFilters={[
                        {
                            columnId: "role",
                            title: "Role",
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
            </div>
        </div>
    )
}