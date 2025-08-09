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
import { Customer } from '@prisma/client';
import { OrderItem } from '../sales/OrderItem';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';

const FormSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    address: z.string().optional(),
    email: z.string().optional(),
    orderDate: z.date({
        required_error: "An order date is required.",
    }),
    tag: z.string().optional(),
    status: z.string().optional(),
    memo: z.string().optional(),
    customerName: z.string().nullable(),
    items: z.array(
        z.object({
            productId: z.string().min(1, 'Product is required'),
            note: z.string().optional(),
            quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
            price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
        })
    ).min(1, 'At least one item is required'),
});

export function EditSalesForm({ initialData, customers, products }: any) {
    const router = useRouter();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            ...initialData,
            orderDate: initialData.orderDate ? new Date(initialData.orderDate) : new Date(),
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            console.log(values);
            const response = await fetch(`/api/sales/${initialData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    // customerName: values.customerName ?? '',
                }),
            });

            if (response.ok) {
                toast.success("Sales order updated successfully!");
                router.push('/sales');
                router.refresh();
            } else {
                throw new Error("Failed to update sales order");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    }

    const items = form.watch('items');
    const hasCustomerName = initialData.customerName !== undefined && initialData.customerName !== null && initialData.customerName !== '';
    const showEmailField = initialData.email !== undefined && initialData.email !== null && initialData.email !== '';
    const showAddressField = initialData.address !== undefined && initialData.address !== null && initialData.address !== '';

    return (
        <div className='p-3'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-start'>
                        <div className='col-span-2 space-y-6 gap-6 grid md:grid-cols-1 lg:grid-cols-2 items-start'>
                            {!hasCustomerName && (
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
                                                    {customers.map((customer: Customer) => (
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
                            )}
                            {hasCustomerName && (
                                <FormField
                                    control={form.control}
                                    name='customerName'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Customer name"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {showEmailField && (
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
                            )}
                            <FormField
                                control={form.control}
                                name='orderDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='tag'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Select sales tag" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Other">Others</SelectItem>
                                                <SelectItem value="Takeaway">Take away</SelectItem>
                                                <SelectItem value="GoFood">GoFood</SelectItem>
                                                <SelectItem value="GrabFood">GrabFood</SelectItem>
                                                <SelectItem value="ShopeeFood">ShopeeFood</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                            {showAddressField && (
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
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Order Items</h3>
                        {items.map((item, index) => (
                            <OrderItem
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
                                form.setValue('items', [...items, { productId: '', note: '', quantity: 1, price: 0 }]);
                            }}
                        >
                            Add Item
                        </Button>
                    </div>

                    <div className='flex justify-end space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href={`/sales/${initialData.id}`}>
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