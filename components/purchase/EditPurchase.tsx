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
import { Inventory, Staff, Supplier } from '@prisma/client';
import { PurchaseItem } from './PurchaseItem';

const FormSchema = z.object({
    staffId: z.string().min(1, 'Staff is required'),
    supplierId: z.string().min(1, 'Customer is required'),
    address: z.string().optional(),
    email: z.string().optional(),
    purchaseDate: z.string().min(1, 'Order date is required'),
    dueDate: z.string().min(1, 'Order date is required'),
    tag: z.string().optional(),
    urgency: z.string().min(1, 'urgency is required'),
    status: z.string().min(1, 'Status is required'),
    memo: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string().min(1, 'Product is required'),
            note: z.string().optional(),
            quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
            price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
        })
    ).min(1, 'At least one item is required'),
});

type EditPurchaseFormProps = {
    initialData: {
        id: string;
        staffId: string;
        supplierId: string;
        purchaseDate: string;
        dueDate: string;
        tag?: string;
        status: string;
        memo?: string;
        items: {
            productId: string;
            note: string;
            quantity: number;
            price: number;
        }[];
    };
     staffs: Staff[];
        suppliers: Supplier[];
        products: Inventory[];
};

export function EditPurchase({ initialData, staffs, suppliers, products }: EditPurchaseFormProps) {
    const router = useRouter();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            ...initialData,
            purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        },
    });

    const statusOptions = [
        { value: 'Draft', label: 'Draft' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
    ] as const;

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const response = await fetch(`/api/purchase/${initialData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    purchaseDate: new Date(values.purchaseDate).toISOString(),
                    dueDate: new Date(values.dueDate).toISOString(),
                }),
            });

            if (response.ok) {
                toast.success("Purchase order updated successfully!");
                router.push('/purchase');
                router.refresh();
            } else {
                throw new Error("Failed to update purchase order");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    }

    const items = form.watch('items');

    return (
        <div className='p-3'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-start'>
                        <div className='col-span-2 space-y-6 gap-6 grid md:grid-cols-1 lg:grid-cols-2 items-start'>
                            <FormField
                                control={form.control}
                                name='staffId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Staff</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl className='w-full'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Staff" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {staffs.map((staff) => (
                                                    <SelectItem key={staff.id} value={staff.id}>
                                                        {staff.name}
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
                                                            name='supplierId'
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Supplier</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl className='w-full'>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select supplier" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {suppliers.map((supplier) => (
                                                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                                                    {supplier.name}
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
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Customer email' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='purchaseDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='dueDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='tag'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tag</FormLabel>
                                        <FormControl>
                                            <Input placeholder='e.g. Urgent, Wholesale' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='ml-4 space-y-6'>
                            <FormField
                                control={form.control}
                                name='memo'
                                render={({ field }) => (
                                    <FormItem className='col-span-2 max-w-lg'>
                                        <FormLabel>Memo</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Additional notes' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='address'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Shipping address' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Purchase Items</h3>
                        {items.map((item, index) => (
                            <PurchaseItem
                                key={index}
                                form={form}
                                index={index}
                                products={products}
                                onRemove={() => {
                                    const newItems = [...items];
                                    newItems.splice(index, 1);
                                    form.setValue('items', newItems);
                                }}
                                canRemove={items.length > 1}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                                form.setValue('items', [...items, { productId: '', quantity: 1, price: 0 }]);
                            }}
                        >
                            Add Item
                        </Button>
                    </div>

                    <div className='flex justify-end space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href={`/purchase/${initialData.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type='submit'>
                            Update
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};