import { prisma } from "@/lib/prisma"
import { ProductionDetail } from "@/components/production/ProductionDetail";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Undo2Icon } from "lucide-react";

export default async function ProductionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const isStaff = session.user.role === 'Staff'

    const { id } = await params
    const production = await prisma.production.findUnique({
        where: { id: id },
        include: {
            product: true,
            materials: {
                include: {
                    material: true
                }
            }
        }
    });

    if (!production) {
        notFound()
    }

    return (
        <div className="h-min-full m-3 p-5 rounded-md">
            <div className="flex flex-center items-start p-4 pb-0">
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
                    {!isStaff && (
                        <Button asChild>
                            <Link href={`/production/${production.id}/edit`}>
                                Edit
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
            <ProductionDetail production={production} />
        </div>
    );
}