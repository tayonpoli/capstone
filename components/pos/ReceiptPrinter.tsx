"use client"

import { Button } from "@/components/ui/button"
import { useReactToPrint } from "react-to-print"
import { useRef, useState } from "react"
import { printBluetoothReceipt } from "@/lib/bluetooth"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ReceiptPrinter({ order }: { order: any }) {
    const receiptRef = useRef<HTMLDivElement>(null)
    const [isPrinting, setIsPrinting] = useState(false)

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        pageStyle: `
      @page { size: 80mm; margin: 0; }
      @media print { 
        body { visibility: hidden; }
        #receipt { visibility: visible; }
      }
    `,
        onAfterPrint: () => toast.success("Receipt successfully printed!")
    })

    const handleBluetoothPrint = async () => {
        setIsPrinting(true)
        try {
            await printBluetoothReceipt(order)
            toast.success("Struk terkirim ke printer!")
        } catch (error) {
            toast.error("Failed to print the receipt")
            console.error("Print error:", error)
        } finally {
            setIsPrinting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div
                ref={receiptRef}
                id="receipt"
                className="p-4 bg-white text-black text-sm"
                style={{ width: "80mm" }}
            >
                <h2 className="text-center font-bold text-lg">MauNgopi</h2>
                <p className="text-center">Jl. Raya Mustikasari</p>
                <p className="text-center">08123456789</p>
                <div className="border-t border-dashed my-2"></div>

                <div className="flex justify-between">
                    <span>Order type</span>
                    <span>{order.tag}</span>
                </div>

                <div className="flex justify-between">
                    <span>#{order.id.slice(0, 4)}</span>
                    <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier</span>
                    <span>{order.user.name}</span>
                </div>
                <div className="flex justify-between">
                    <span>Customer</span>
                    <span>{order.customerName}</span>
                </div>

                <div className="border-t border-dashed my-2"></div>

                {order.items.map((item: any) => (
                    <div key={item.code} className="flex justify-between py-1">
                        <div>
                            <span className="font-medium">{item.product.product}</span>
                            <span className="text-xs ml-2">x{item.quantity}</span>
                        </div>
                        <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                    </div>
                ))}

                <div className="border-t border-dashed my-2"></div>
                <div className="flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>Rp {order.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Payment</span>
                    <span>{order.invoice.paymentMethod}</span>
                </div>

                <div className="border-t border-dashed my-2"></div>
                <div className="flex justify-between">
                    <span>Note</span>
                    <span>{order.memo}</span>
                </div>

                <div className="border-t border-dashed my-2"></div>
                <p className="text-center">Have a good day</p>
                <p className="text-center">Thanks!</p>
            </div>

            <div className="flex gap-2">
                <Button onClick={handlePrint} className="flex-1">
                    Print Struk
                </Button>
                <Button
                    variant="outline"
                    onClick={handleBluetoothPrint}
                    disabled={isPrinting}
                    className="flex-1"
                >
                    {isPrinting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Print Bluetooth"
                    )}
                </Button>
            </div>
        </div>
    )
}