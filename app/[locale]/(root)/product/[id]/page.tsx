import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductDetail } from "@/components/products/DetailProduct"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdjustCard } from "@/components/products/AdjustForm"
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
        where: { id: id },
        include: {
            purchaseItems: {
                include: {
                    purchaseOrder: {
                        include: {
                            supplier: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    purchaseOrder: {
                        purchaseDate: 'desc'
                    }
                }
            }
        }
    });

    if (!product) return notFound()

    const isProduct = product.category === 'product'
    return (
        <div className="h-full m-3 p-5 rounded-md">
            <ProductDetail product={product} />
            {!isStaff && (
                <div className='flex justify-end mt-auto space-x-4'>
                    {!isProduct && (
                        <AdjustCard product={product} />
                    )}
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