import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductDetail } from "@/components/products/DetailProduct"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AdjustForm } from "@/components/products/AdjustForm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ProductDetailPage({
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
    const product = await prisma.inventory.findUnique({
        where: { id: id }
    })

    if (!product) return notFound()

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <ProductDetail product={product} />
            {!isStaff && (
                <div className='fixed bottom-16 right-14 space-x-4'>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline'>
                                Adjust stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Adjust Stock</DialogTitle>
                                <DialogDescription>
                                    Adjust stock for this product.
                                </DialogDescription>
                            </DialogHeader>
                            <AdjustForm product={product} />
                        </DialogContent>
                    </Dialog>
                    <Button asChild>
                        <Link href={`/product/${product.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}