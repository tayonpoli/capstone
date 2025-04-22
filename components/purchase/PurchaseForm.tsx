'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useEffect } from 'react';

const ProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unit: z.string().min(1, 'Unit is required'),
    unitPrice: z.coerce.number().min(0, 'Unit price must be positive'),
    memo: z.string().optional(),
    total: z.coerce.number().min(0, 'Total must be positive').default(0),
});

const FormSchema = z.object({
    supplier: z.string().min(1, 'Choose the supplier').max(100),
    address: z.string().min(1, 'Supplier address is required'),
    email: z.string().min(1, 'Supplier email is required'),
    purchasedate: z.date(),
    duedate: z.date(),
    urgency: z.string().min(1, 'Supplier address is required'),
    memo: z.string(),
    buyprice: z.coerce.number().int(),
    sellprice: z.coerce.number().int(),
    limit: z.coerce.number().int(),
    products: z.array(ProductSchema).min(1, 'At least one product is required'),
});

export function PurchaseForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const isEditMode = Boolean(initialData?.id);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialData ? {
            ...initialData,
            products: initialData.products || [{
                name: '',
                quantity: 1,
                unit: '',
                unitPrice: 0,
                memo: '',
                total: 0,
            }],
        } : {
            supplier: '',
            address: '',
            email: '',
            purchasedate: '',
            duedate: '',
            urgency: '',
            memo: '',
            buyprice: 0,
            sellprice: 0,
            limit: 0,
            products: [{
                name: '',
                quantity: 1,
                unit: '',
                unitPrice: 0,
                memo: '',
                total: 0,
            }],
        },
    });

    const urgencyOptions = [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
    ] as const;

    const unitOptions = [
        { value: 'pcs', label: 'Pieces' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'g', label: 'Grams' },
        { value: 'l', label: 'Liters' },
        { value: 'm', label: 'Meters' },
        { value: 'box', label: 'Boxes' },
    ];

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'products',
    });

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name && (name.includes('quantity') || name?.includes('unitPrice'))) {
                const index = name?.split('.')[1];
                if (index !== undefined) {
                    const quantity = value.products?.[index]?.quantity || 0;
                    const unitPrice = value.products?.[index]?.unitPrice || 0;
                    const total = quantity * unitPrice;
                    form.setValue(`products.${index}.total`, total);

                    // Update total buy price
                    const totalBuyPrice = value.products?.reduce((sum: number, product: any) =>
                        sum + (product.quantity * product.unitPrice), 0) || 0;
                    form.setValue('buyprice', totalBuyPrice);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);


    const addProduct = () => {
        append({
            name: '',
            quantity: 1,
            unit: '',
            unitPrice: 0,
            memo: '',
            total: 0,
        });
    };

    const removeProduct = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        } else {
            toast.error('You must have at least one product');
        }
    };

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            // Calculate final totals before submission
            const productsWithTotals = values.products.map(product => ({
                ...product,
                total: product.quantity * product.unitPrice
            }));

            const totalBuyPrice = productsWithTotals.reduce((sum, product) => sum + product.total, 0);

            const submissionData = {
                ...values,
                products: productsWithTotals,
                buyprice: totalBuyPrice
            };

            const url = isEditMode
                ? `/api/product/${initialData.id}`
                : '/api/product';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                toast.success(
                    isEditMode ? "Purchase updated successfully!" : "Purchase created successfully!"
                );
                router.push('/purchase');
                router.refresh();
            } else {
                throw new Error("Failed to save purchase");
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
                    <div className='space-y-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4 my-4 items-start'>
                        <div className='space-y-6 gap-6 items-start'>
                            <FormField
                                control={form.control}
                                name='supplier'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendor Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Your vendor name' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendor Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Your vendor email' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name='address'
                            render={({ field }) => (
                                <FormItem
                                    className='col-span-3 max-w-lg'
                                >
                                    <FormLabel>Vendor Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Your vendor address'
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="purchasedate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
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
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="duedate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
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
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='urgency'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Urgency Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {urgencyOptions.map((urgency) => (
                                                <SelectItem key={urgency.value} value={urgency.value}>
                                                    {urgency.label}
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
                            name='memo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Memo</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Purchase Memo'
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Products Table */}
                    <div className="my-8">
                        <h3 className="text-lg font-medium mb-4">Products</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Memo</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Product name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="w-24">
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const value = parseInt(e.target.value) || 0;
                                                                    field.onChange(value);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="w-32">
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.unit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select unit" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {unitOptions.map((unit) => (
                                                                    <SelectItem key={unit.value} value={unit.value}>
                                                                        {unit.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="w-32">
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.unitPrice`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value) || 0;
                                                                    field.onChange(value);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.memo`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Memo" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="w-32">
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.total`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                readOnly
                                                                {...field}
                                                                value={field.value.toFixed(2)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="w-20">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeProduct(index)}
                                            >
                                                <Trash2Icon className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addProduct}
                                className="flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Product
                            </Button>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="grid grid-cols-3 gap-4 my-6">
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name='buyprice'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Purchase Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                readOnly
                                                {...field}
                                                value={field.value.toFixed(2)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name='sellprice'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Sell Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name='limit'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Limit</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                min="0"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href={isEditMode ? `/purchase/${initialData.id}` : '/purchase'}>
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

export default PurchaseForm;