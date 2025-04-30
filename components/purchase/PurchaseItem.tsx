'use client';

// OrderItem.tsx (buat file terpisah)
import { useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Inventory } from '@prisma/client';
import { formatIDR } from '@/lib/formatCurrency';

export function PurchaseItem({
    form,
    index,
    products,
    onRemove,
    canRemove,
}: {
    form: any; // Gunakan tipe yang lebih spesifik jika ada
    index: number;
    products: Inventory[];
    onRemove: () => void;
    canRemove: boolean;
}) {
    const price = useWatch({
        control: form.control,
        name: `items.${index}.price`,
    });
    const quantity = useWatch({
        control: form.control,
        name: `items.${index}.quantity`,
    });
    const total = (Number(price) || 0) * (Number(quantity) || 0);

    return (
        <div className="grid grid-cols-12 gap-4 mb-4 items-end">
            <FormField
                control={form.control}
                name={`items.${index}.productId`}
                render={({ field }) => (
                    <FormItem className="col-span-3">
                        <FormLabel>Product</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                const selectedProduct = products.find((p) => p.id === value);
                                if (selectedProduct) {
                                    form.setValue(`items.${index}.price`, selectedProduct.buyprice);
                                }
                            }}
                            value={field.value}
                        >
                            <FormControl className="w-full">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.product} ({product.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`items.${index}.note`}
                render={({ field }) => (
                    <FormItem className="col-span-3">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Input placeholder='e.g. Less Sugar' {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`items.${index}.price`}
                render={({ field }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min="1"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormItem className="col-span-2">
                <FormLabel>Total</FormLabel>
                <FormControl>
                    <Input
                        value={formatIDR(total)}
                        readOnly
                        className="text-end font-medium"
                    />
                </FormControl>
            </FormItem>

            <div>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={onRemove}
                    disabled={!canRemove}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
}