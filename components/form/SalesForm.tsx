'use client';

import { useForm, useWatch } from 'react-hook-form';
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
import { Customer, Inventory } from '@prisma/client';
import { OrderItem } from '../sales/OrderItem';

const FormSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    address: z.string().optional(),
    email: z.string().optional(),
    orderDate: z.string().min(1, 'Order date is required'),
    tag: z.string().optional(),
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

type SalesFormProps = {
    initialData?: {
        id?: string;
        customerId: string;
        address?: string;
        email?: string;
        orderDate: string;
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
    customers: Customer[];
    products: Inventory[];
};

export function SalesForm({ initialData, customers, products }: SalesFormProps) {
    const router = useRouter();
    const isEditMode = Boolean(initialData?.id);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialData ? {
            ...initialData,
            orderDate: initialData.orderDate ? new Date(initialData.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        } : {
            customerId: '',
            address: '',
            email: '',
            orderDate: new Date().toISOString().split('T')[0],
            tag: '',
            status: 'Completed',
            memo: '',
            items: [{ productId: '', note: '', quantity: 1, price: 0 }],
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
            const url = isEditMode
                ? `/api/sales/${initialData?.id}`
                : '/api/sales';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    orderDate: new Date(values.orderDate).toISOString(),
                }),
            });

            if (response.ok) {
                toast.success(
                    isEditMode ? "Sales order updated successfully!" : "Sales order created successfully!"
                );
                router.push('/sales');
                router.refresh();
            } else {
                throw new Error("Failed to save sales order");
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
                                name='customerId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl className='w-full'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        {customer.name}
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
                                name='orderDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormField
                                control={form.control}
                                name='status'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
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
                        <h3 className="text-lg font-medium mb-4">Order Items</h3>
                        {items.map((item, index) => (
                            <OrderItem
                                key={index}
                                form={form} // Oper seluruh objek form
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

                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href={isEditMode ? `/sales/${initialData?.id}` : '/sales'}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type='submit'>
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default SalesForm;