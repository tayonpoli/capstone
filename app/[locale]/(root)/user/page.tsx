import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { UserDataTable } from "./columns"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Invitation, User } from "@prisma/client"
import { InviteDataTable } from "./inviteColumns"
import { getTranslations } from "next-intl/server"

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

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/unauthorized")
    }

    const t = await getTranslations('user');
    const data = await getData();
    const inviteData = await getInviteData();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-6">
                <div className="text-3xl font-semibold pl-1">
                    {t('title')}
                </div>
                <div className="flex justify-end">
                    <Link href='/user/create'>
                        <Button>
                            <PlusIcon /> {t('create')}
                        </Button>
                    </Link>
                </div>
            </div>
            <Tabs defaultValue="user" className="py-4">
                <div className="flex justify-between">
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="user">{t('tabs.users')}</TabsTrigger>
                        <TabsTrigger value="invite">{t('tabs.invitation')}</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="user" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <UserDataTable
                            data={data}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="invite" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <InviteDataTable
                            data={inviteData}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}