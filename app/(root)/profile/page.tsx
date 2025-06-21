import { ChangePasswordCard } from "@/components/profile/ChangePassword";
import { CompanyCard } from "@/components/profile/EditCompany";
import { ProfileCard } from "@/components/profile/EditProfile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const isOwner = session.user.role === 'Owner'

    const profile = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    const company = await prisma.company.findFirst()


    return (
        <div className="m-3 mb-6 pb-0 px-5 rounded-md space-y-2">
            <div className="grid grid-cols-2 p-3">
                <div>
                    <p className="text-sm text-gray-500">
                        Account
                    </p>
                    <h1 className="font-semibold text-3xl">
                        User Profile
                    </h1>
                </div>
            </div>
            <Card>
                <CardHeader className="grid grid-cols-2">
                    <CardTitle>
                        Personal Information
                    </CardTitle>
                    <div className="flex justify-end">
                        <ProfileCard profile={profile} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="w-2/3 flex grid grid-cols-2">
                        <div className="space-y-1">
                            <CardDescription>
                                Full name
                            </CardDescription>
                            <Label className="text-md font-medium">{profile?.name}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Email
                            </CardDescription>
                            <Label className="text-md font-medium">{profile?.email}</Label>
                        </div>
                    </div>
                    <div className="w-2/3 flex grid grid-cols-2">
                        <div className="space-y-1">
                            <CardDescription>
                                Phone
                            </CardDescription>
                            <Label className="text-md font-medium">{profile?.phone || "-"}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Address
                            </CardDescription>
                            <Label className="text-md font-medium">{profile?.address || "-"}</Label>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardDescription>
                            Role
                        </CardDescription>
                        <Badge variant='secondary' className="text-sm">
                            {profile?.role}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
            {isOwner && (
                <Card className="my-4">
                    <CardHeader className="grid grid-cols-2">
                        <CardTitle>
                            Company Information
                        </CardTitle>
                        <div className="flex justify-end">
                            <CompanyCard company={company} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="w-2/3 flex grid grid-cols-2">
                            <div className="space-y-1">
                                <CardDescription>
                                    Company name
                                </CardDescription>
                                <Label className="text-md font-medium">{company?.name}</Label>
                            </div>
                            <div className="space-y-1">
                                <CardDescription>
                                    Email
                                </CardDescription>
                                <Label className="text-md font-medium">{company?.email}</Label>
                            </div>
                        </div>
                        <div className="w-2/3 flex grid grid-cols-2">
                            <div className="space-y-1">
                                <CardDescription>
                                    Phone
                                </CardDescription>
                                <Label className="text-md font-medium">{company?.phone}</Label>
                            </div>
                            <div className="space-y-1">
                                <CardDescription>
                                    Address
                                </CardDescription>
                                <Label className="text-md font-medium">{company?.address}</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            <Card className="my-4">
                <CardHeader>
                    <CardTitle>
                        Change Password
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <CardDescription>
                        You can change your password account here.
                    </CardDescription>
                    <Button asChild>
                        <ChangePasswordCard id={session.user.id} />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}