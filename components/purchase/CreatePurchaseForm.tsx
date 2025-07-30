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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';

const FormSchema = z.object({
    staffId: z.string().min(1, 'Staff is required'),
    supplierId: z.string().min(1, 'Customer is required'),
    contact: z.string().min(1, 'Supplier contact is required'), // Stores contact name
    address: z.string().optional(),
    email: z.string().optional(),
    purchaseDate: z.date({
        required_error: "Purchase date is required.",
    }),
    dueDate: z.date({
        required_error: "due date is required.",
    }),
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

type CreatePurchaseFormProps = {
    staffs: Staff[];
    suppliers: (Supplier & {
        contacts?: {
            id: string;
            name: string;
            department: string;
        }[];
    })[];
    products: Inventory[];
};

export function CreatePurchaseForm({ staffs, suppliers, products }: CreatePurchaseFormProps) {
    const router = useRouter();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            staffId: '',
            supplierId: '',
            contact: '',
            address: '',
            email: '',
            purchaseDate: new Date(),
            dueDate: new Date(),
            urgency: 'Medium',
            tag: '',
            status: 'Completed',
            memo: '',
            items: [{ productId: '', note: '', quantity: 1, price: 0 }],
        },
    });

    const selectedSupplierId = form.watch('supplierId');
    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
    const items = form.watch('items');

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    purchaseDate: new Date(values.purchaseDate).toISOString(),
                    dueDate: new Date(values.dueDate).toISOString(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Purchase order created successfully!");
                router.push(`/purchase/${data.id}`);
                router.refresh();
            } else {
                throw new Error("Failed to create Purchase order");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    }

    return (
        <div className='p-3'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-start'>
                        <div className='col-span-2 space-y-6 gap-6 grid md:grid-cols-1 lg:grid-cols-2 items-start'>
                            {/* Staff Select */}
                            <FormField
                                control={form.control}
                                name='staffId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Staff</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl className='w-full'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select staff" />
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

                            {/* Supplier Select */}
                            <FormField
                                control={form.control}
                                name='supplierId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                form.resetField('contact'); // Reset contact when supplier changes

                                                const selectedSupplier = suppliers.find(s => s.id === value);
                                                if (selectedSupplier) {
                                                    form.setValue('email', selectedSupplier.email || '');
                                                    form.setValue('address', selectedSupplier.address || '');
                                                }
                                            }}
                                            defaultValue={field.value}
                                        >
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

                            {/* Contact Select - Shows names but stores name */}
                            <FormField
                                control={form.control}
                                name='contact'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!selectedSupplierId || !selectedSupplier?.contacts?.length}
                                        >
                                            <FormControl className='w-full'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={
                                                        !selectedSupplierId
                                                            ? "Select a supplier first"
                                                            : !selectedSupplier?.contacts?.length
                                                                ? "No contacts available"
                                                                : "Select contact"
                                                    } />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {selectedSupplier?.contacts?.map((contact) => (
                                                    <SelectItem key={contact.id} value={contact.name}>
                                                        {contact.name} ({contact.department})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled
                                                placeholder='Supplier email' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Purchase Date */}
                            <FormField
                                control={form.control}
                                name='purchaseDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Date</FormLabel>
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
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Due Date */}
                            <FormField
                                control={form.control}
                                name='dueDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
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
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Address, Tag, and Memo Fields */}
                        <div className='mx-8 space-y-6'>
                            <FormField
                                control={form.control}
                                name='address'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Supplier address' {...field} disabled />
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
                        </div>
                    </div>

                    {/* Purchase Items Section */}
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

                    {/* Form Actions */}
                    <div className='flex justify-end my-6 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href='/purchase'>
                                Cancel
                            </Link>
                        </Button>
                        <Button type='submit'>
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};