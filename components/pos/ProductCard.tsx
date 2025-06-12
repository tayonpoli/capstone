"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus } from "lucide-react"
import { Inventory } from "@prisma/client"
import { useCart } from "./CartContext"

export function ProductCard({ product }: { product: Inventory }) {
    const { addToCart, removeFromCart, getItemQuantity } = useCart()

    const quantity = getItemQuantity(product.code)

    return (
        <Card>
            <CardHeader className="items-center space-y-0 pb-1">
                <CardTitle className="font-medium text-center">
                    {product.product}
                </CardTitle>
                <CardDescription className="text-center">
                    {product.category || 'No category'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="xl:text-2xl text-lg font-semibold text-center">
                    Rp {product.sellprice?.toLocaleString('id-ID') || '0'}
                </div>
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromCart(product.code)}
                        disabled={quantity === 0}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="xl:text-2xl text-xl font-semibold">{quantity}</div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addToCart(product)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}