// app/pos/page.tsx
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Inventory } from "@prisma/client"
import { ProductCard } from "@/components/pos/ProductCard"
import { CartProvider } from "@/components/pos/CartContext"
import { OrderSummary } from "@/components/pos/OrderSummary"
import { ScrollArea } from "@/components/ui/scroll-area"

async function getData(): Promise<Inventory[]> {
    try {
        const products = await prisma.inventory.findMany({
            where: {
                category: 'product'
            },
            orderBy: {
                code: 'desc'
            }
        })
        return products
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

export default async function PosPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const data = await getData();

    return (
        <div className="h-full m-3 p-5 rounded-md flex gap-6">
            <CartProvider>
                <div className="w-2/3 xl:w-3/4 space-y-4">
                    <div className="text-3xl font-semibold pl-1">
                        Point of Sales
                    </div>
                    <ScrollArea className="h-full w-full">
                        <div className="grid gap-4 grid-cols-3 xl:grid-cols-4 my-4">
                            {data.map((product) => (
                                <ProductCard key={product.code} product={product} />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="w-1/3 xl:w-1/4">
                    <OrderSummary userId={session.user.id} />
                </div>
            </CartProvider>
        </div>
    )
}