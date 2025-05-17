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

const adjustStockSchema = z.object({
    product: z.string(),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export function AdjustForm({ product }: any) {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(adjustStockSchema),
        defaultValues: {
            ...product,
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