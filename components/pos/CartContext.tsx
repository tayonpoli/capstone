"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Inventory } from "@prisma/client"
import { CartItem } from "@/lib/types"

type CartContextType = {
    items: CartItem[]
    addToCart: (product: Inventory) => void
    removeFromCart: (productId: string) => void
    getItemQuantity: (productId: string) => number
    clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    const addToCart = (product: Inventory) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.code === product.code)
            if (existingItem) {
                return prevItems.map(item =>
                    item.code === product.code
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prevItems, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId: string) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.code === productId)
            if (existingItem?.quantity === 1) {
                return prevItems.filter(item => item.code !== productId)
            }
            return prevItems.map(item =>
                item.code === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        })
    }

    const getItemQuantity = (productId: string) => {
        return items.find(item => item.code === productId)?.quantity || 0
    }

    const clearCart = () => {
        setItems([])
    }

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, getItemQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}