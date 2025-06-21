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
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ScrollArea } from "../ui/scroll-area"

// Define validation schema
const orderFormSchema = z.object({
    customerName: z.string().min(1, "Customer name is required").max(100),
    paymentMethod: z.enum(["Cash", "QRIS", "Debit", "Online Payment"]),
    tag: z.enum(["Takeaway", "GoFood", "GrabFood", "ShopeeFood", "Other"]),
    memo: z.string().max(500).optional()
})

type OrderFormValues = z.infer<typeof orderFormSchema>

type OrderSummaryProps = {
    userId: string
}

export function OrderSummary({ userId }: OrderSummaryProps) {
    const { items, clearCart } = useCart()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [orderData, setOrderData] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const total = items.reduce(
        (sum, item) => sum + (item.sellprice || 0) * item.quantity,
        0
    )

    // Initialize form with react-hook-form and zod
    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            customerName: "",
            paymentMethod: "Cash",
            tag: "Takeaway",
            memo: ""
        }
    })

    const handleCheckout = async (values: OrderFormValues) => {
        if (items.length === 0) {
            toast.error("Please add item to the cart")
            return
        }

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
                    customerName: values.customerName,
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.sellprice
                    })),
                    paymentMethod: values.paymentMethod,
                    tag: values.tag,
                    memo: values.memo,
                    total
                })
            })

            if (response.ok) {
                const data = await response.json()
                setOrderData(data)
                setIsDialogOpen(true)
                clearCart()
                form.reset()
                toast.success("Sales Order created successfully!")
            } else {
                throw new Error('Failed to save the transaction')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheckout)} className="h-full">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 mt-2">
                            {/* Customer Name Field */}
                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Input the customer name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <ScrollArea className='max-h-[70vh] overflow-y-auto border-t'>
                                <div className="space-y-2 mt-2">
                                    {items.length > 0 ? (
                                        items.map(item => (
                                            <div key={item.code} className="flex justify-between md:text-sm xl:text-base">
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
                            </ScrollArea>

                            <div className="border-t pt-4">
                                <div className="flex justify-between font-semibold md:text-base xl:text-lg">
                                    <span>Total</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col mt-auto gap-2">
                            <div className="w-full grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select payment method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="QRIS">QRIS</SelectItem>
                                                    <SelectItem value="Debit">Debit</SelectItem>
                                                    <SelectItem value="Online Payment">Online Payment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tag"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select order type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Takeaway">Takeaway</SelectItem>
                                                    <SelectItem value="GoFood">GoFood</SelectItem>
                                                    <SelectItem value="GrabFood">GrabFood</SelectItem>
                                                    <SelectItem value="ShopeeFood">ShopeeFood</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="memo"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <Textarea
                                                placeholder="Note (additional)"
                                                {...field}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                className="w-full"
                                type="submit"
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
            </Form>

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