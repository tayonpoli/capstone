'use client';

import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Inventory } from '@prisma/client';
import { MaterialItem } from './MaterialItem';

// Schema validasi
const BomFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    tag: z.string().optional(),
    productId: z.string().min(1, 'Product is required'),
    materials: z.array(
        z.object({
            materialId: z.string().min(1, 'Material is required'),
            qty: z.coerce.number().min(1, 'Quantity must be greater than 0'),
            unit: z.string().min(1, 'Unit is required'),
            price: z.coerce.number().min(1, 'Price must be greater than 0'),
        })
    ).min(1, 'At least one material is required'),
});

type CreateBomFormProps = {
    finishedProducts: Inventory[];  // Produk jadi
    rawMaterials: Inventory[];     // Bahan baku
};

export function ProductionForm({ finishedProducts, rawMaterials }: CreateBomFormProps) {
    const router = useRouter();

    const form = useForm<z.infer<typeof BomFormSchema>>({
        resolver: zodResolver(BomFormSchema),
        defaultValues: {
            name: '',
            description: '',
            productId: '',
            materials: [{ materialId: '', qty: 0, unit: 'gram', price: 0 }],
        },
    });

    const unitOptions = [
        { value: 'gram', label: 'Gram' },
        { value: 'Kg', label: 'Kilogram' },
        { value: 'ml', label: 'Milliliter' },
        { value: 'Litre', label: 'Liter' },
        { value: 'Pcs', label: 'Pieces' },
    ];

    async function onSubmit(values: z.infer<typeof BomFormSchema>) {
        try {
            const response = await fetch('/api/production', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success("BOM created successfully!");
                router.push('/production');
                router.refresh();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create BOM");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
            console.error(error);
        }
    }

    const materials = form.watch('materials');

    return (
        <div className='p-3'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-start'>
                        <div className='space-y-6'>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., BOM Coffee Latte V1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tag"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tag</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Coffee" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g., Standar resep kopi latte"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="productId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Output Product</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Select finished product" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {finishedProducts.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.product}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Daftar Bahan Baku */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Components</h3>
                        {materials.map((item, index) => (
                            <MaterialItem
                                key={index}
                                form={form}
                                index={index}
                                rawMaterials={rawMaterials}
                                unitOptions={unitOptions}
                                onRemove={() => {
                                    const newItems = [...materials];
                                    newItems.splice(index, 1);
                                    form.setValue('materials', newItems);
                                }}
                                canRemove={materials.length > 1}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                                form.setValue('materials', [
                                    ...materials,
                                    { materialId: '', qty: 0, unit: 'gram', price: 0 }
                                ]);
                            }}
                        >
                            Add Material
                        </Button>
                    </div>

                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href='/production'>
                                Cancel
                            </Link>
                        </Button>
                        <Button type='submit'>
                            Create BOM
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}