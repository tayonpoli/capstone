"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "./CartContext"
import { useState } from "react"
import { PaymentMethod, Tag } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import ReceiptPrinter from "./ReceiptPrinter"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"

type OrderSummaryProps = {
    userId: string
}

export function OrderSummary({ userId }: OrderSummaryProps) {
    const { items, clearCart } = useCart()
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash')
    const [tag, setTag] = useState<Tag>('Takeaway')
    const [customerName, setCustomerName] = useState('')
    const [memo, setMemo] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [orderData, setOrderData] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const total = items.reduce(
        (sum, item) => sum + (item.sellprice || 0) * item.quantity,
        0
    )

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/pos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    customerId: '001',
                    customerName,
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.sellprice
                    })),
                    paymentMethod,
                    tag,
                    memo,
                    total
                })
            })

            if (response.ok) {
                const data = await response.json()
                setOrderData(data)
                setIsDialogOpen(true)
                clearCart()
                setCustomerName('')
                setMemo('')
                toast.success("Sales Order created successfully!");
            } else {
                throw new Error('Failed to save the transaction')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <form className="h-full" onSubmit={handleCheckout}>
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Customer Name Field */}
                        <div className="space-y-2">
                            <Input
                                id="customerName"
                                placeholder="Input the customer name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2 mt-6">
                            {items.length > 0 ? (
                                items.map(item => (
                                    <div key={item.code} className="flex justify-between">
                                        <div>
                                            <span className="font-medium">{item.product}</span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <div>
                                            Rp {((item.sellprice || 0) * (item.quantity ?? 0)).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No products</p>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col mt-auto gap-2">
                        <div className="w-full grid grid-cols-2 gap-2">
                            <Select
                                value={paymentMethod}
                                onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                                required
                            >
                                <SelectTrigger id="paymentMethod" className="w-full">
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="QRIS">QRIS</SelectItem>
                                    <SelectItem value="Debit">Debit</SelectItem>
                                    <SelectItem value="Online Payment">Online Payment</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={tag}
                                onValueChange={(value: Tag) => setTag(value)}
                                required
                            >
                                <SelectTrigger id="tag" className="w-full">
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Takeaway">Takeaway</SelectItem>
                                    <SelectItem value="GoFood">GoFood</SelectItem>
                                    <SelectItem value="GrabFood">GrabFood</SelectItem>
                                    <SelectItem value="ShopeeFood">ShopeeFood</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full">
                            <Textarea
                                id="memo"
                                placeholder="Note (additional)"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleCheckout}
                            disabled={items.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : 'Create Order'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Print Receipt</DialogTitle>
                    </DialogHeader>
                    <div className="justify-items-center mb-6">
                        {orderData ? (
                            <ReceiptPrinter order={orderData} />
                        ) : (
                            <p>Loading receipt...</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}