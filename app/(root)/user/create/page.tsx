import InviteForm from "@/components/form/InviteForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Undo2Icon } from "lucide-react";
import Link from "next/link";

const page = () => {
    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="flex flex-center items-start p-3 mb-8">
                <div>
                    <div className='text-sm font-light text-gray-400'>
                        Users
                    </div>
                    <div className='mb-8 text-3xl font-semibold'>
                        Invite New User
                    </div>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/user`}>
                            <Undo2Icon />  Back
                        </Link>
                    </Button>
                </div>
            </div>
            <div className='flex items-center justify-center'>
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Invite user</CardTitle>
                        <CardDescription>Invite new user and assign the role.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InviteForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default page;