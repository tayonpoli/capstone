"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Inventory } from "@prisma/client";

const adjustStockSchema = z.object({
    product: z.string(),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

interface AdjustStockProps {
    product: Inventory;
    onSuccess?: () => void;
}

export function AdjustCard({
    product
}: {
    product: any
}) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                <AdjustForm
                    product={product}
                    onSuccess={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

export function AdjustForm({ product, onSuccess }: AdjustStockProps) {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(adjustStockSchema),
        defaultValues: {
            ...product,
            stock: Math.round(product.stock)
        },
    });

    async function onSubmit(values: z.infer<typeof adjustStockSchema>) {
        try {
            const response = await fetch(`/api/product/${product.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stock: values.stock
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to adjust stock");
            }

            toast.success("Stock adjusted successfully!");
            onSuccess?.();
            router.refresh();
        } catch (error) {
            console.error('Adjust stock error', error);
            toast.error("Failed to adjust stock");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled
                                    className="text-gray-600 bg-gray-100"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adjust Stock Quantity</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    min={0}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Update Stock
                </Button>
            </form>
        </Form>
    );
}