import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { User, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Invitation } from "@prisma/client"
import { inviteColumns } from "./inviteColumns"

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

async function getInviteData(): Promise<Invitation[]> {
    try {
        const invite = await prisma.invitation.findMany()
        return invite
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
    const inviteData = await getInviteData();

    return (
        <div className="h-full m-3 p-5 rounded-md">
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
            <Tabs defaultValue="user" className="py-4">
                <div className="flex justify-between">
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="user">Users</TabsTrigger>
                        <TabsTrigger value="invite">Invitation</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="user" className="space-y-2">
                    <div className="container mx-auto py-2">
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
                </TabsContent>
                <TabsContent value="invite" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <DataTable
                            columns={inviteColumns}
                            data={inviteData}
                            searchColumn="email"
                            searchPlaceholder="Search email ..."
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
                            ]}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}