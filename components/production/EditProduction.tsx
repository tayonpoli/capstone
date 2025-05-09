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
import { Inventory, Unit } from '@prisma/client';
import { MaterialItem } from './MaterialItem';

const FormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    productId: z.string().min(1, 'Product is required'),
    materials: z.array(
        z.object({
            materialId: z.string().min(1, 'Material is required'),
            qty: z.coerce.number().min(0.01, 'Quantity must be at least 0.01'),
            unit: z.string().min(1, 'Unit is required'),
        })
    ).min(1, 'At least one material is required'),
});

type EditBomFormProps = {
    initialData: {
        id: string;
        name: string;
        description: string | null;
        productId: string;
        materials: {
            materialId: string;
            qty: number;
            unit: Unit;
        }[];
    };
    finishedProducts: Inventory[];
    rawMaterials: Inventory[];
};

export function EditBomForm({ initialData, finishedProducts, rawMaterials }: EditBomFormProps) {
    const router = useRouter();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: initialData.name,
            description: initialData.description || '',
            productId: initialData.productId,
            materials: initialData.materials.map(material => ({
                materialId: material.materialId,
                qty: material.qty,
                unit: material.unit
            }))
        },
    });

    const unitOptions = [
        { value: 'gram', label: 'Gram' },
        { value: 'Kg', label: 'Kilogram' },
        { value: 'ml', label: 'Milliliter' },
        { value: 'Litre', label: 'Liter' },
        { value: 'Pcs', label: 'Pieces' },
    ];

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const response = await fetch(`/api/production/${initialData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success("BOM updated successfully!");
                router.push('/production');
                router.refresh();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update BOM");
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
                        {/* Informasi Utama BOM */}
                        <div className='space-y-6'>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., BOM Kopi Latte V1" {...field} />
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
                                                placeholder="e.g., Standar resep kopi latte dengan bahan premium"
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
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className='w-full'>
                                                    <SelectValue placeholder="Select finished product" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {finishedProducts.map((product) => (
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
                        </div>
                    </div>

                    {/* Daftar Bahan Baku */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Materials</h3>
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
                                    { materialId: '', qty: 0, unit: 'gram' }
                                ]);
                            }}
                        >
                            Add Material
                        </Button>
                    </div>

                    <div className='flex justify-end space-x-4 mt-8'>
                        <Button asChild variant='outline'>
                            <Link href={`/production/${initialData.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type='submit'>
                            Update BOM
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}