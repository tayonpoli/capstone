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
import { useEffect, useState } from 'react';

const ProductSchema = z.object({
    productId: z.string(),
    name: z.string().min(1, 'Product name is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unit: z.string().min(1, 'Unit is required'),
    unitPrice: z.coerce.number().min(0, 'Unit price must be positive'),
    description: z.string().optional(),
    total: z.coerce.number().min(0, 'Total must be positive').default(0),
});

const FormSchema = z.object({
    staffId: z.string().min(1, 'Staff is required'),
    staffEmail: z.string(),
    supplierId: z.string().min(1, 'Supplier is required'),
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
    // const isEditMode = Boolean(initialData?.id);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialData ? {
            ...initialData,
            products: initialData.products || [{
                name: '',
                quantity: 1,
                unit: '',
                unitPrice: 0,
                description: '',
                total: 0,
            }],
        } : {
            staffId: '',
            staffEmail: '',
            supplierId: '',
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
                productId: '',
                name: '',
                quantity: 1,
                unit: '',
                unitPrice: 0,
                description: '',
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

    const [inventoryItems, setInventoryItems] = useState<Inventory[]>([])
    const [staffList, setStaffList] = useState<Staff[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])

    useEffect(() => {
        const fetchInventory = async () => {
            const response = await fetch('/api/product')
            const data = await response.json()
            setInventoryItems(data)
        }
        fetchInventory()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const [staffRes, suppliersRes] = await Promise.all([
                fetch('/api/staff'),
                fetch('/api/supplier')
            ])
            const staffData = await staffRes.json()
            const suppliersData = await suppliersRes.json()
            setStaffList(staffData)
            setSuppliers(suppliersData)
        }
        fetchData()
    }, [])

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
            productId: '',
            name: '',
            quantity: 1,
            unit: '',
            unitPrice: 0,
            description: '',
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
        console.log("Form values:", JSON.stringify(values, null, 2));
        try {
            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    purchasedate: values.purchasedate.toISOString(),
                    duedate: values.duedate.toISOString(),
                })
            });

            if (response.ok) {
                toast.success("Purchase created successfully!");
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
                <form onSubmit={(e) => {
                    e.preventDefault(); // ← Ini penting!
                    form.handleSubmit((data) => {
                        console.log("Form data before submit:", data);
                        onSubmit(data);
                    })();
                }}>
                    <div className='space-y-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4 my-4 items-start'>
                        <FormField
                            control={form.control}
                            name='staffId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Staff Name</FormLabel>
                                    <Select onValueChange={(value) => {
                                        field.onChange(value)
                                        const selectedStaff = staffList.find(s => s.id === value)
                                        if (selectedStaff) {
                                            form.setValue('staffEmail', selectedStaff.email)
                                        }
                                    }}
                                        value={field.value}
                                    >
                                        <FormControl className='w-full'>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select staff" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {staffList.map((staff) => (
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
                            name='staffEmail'
                            render={({ field }) => (
                                <FormItem
                                    className='col-span-3 col-start-2 col-end-2'>
                                    <FormLabel>Staff Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Staff email' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='space-y-6 gap-6 items-start col-start-1'>
                            <FormField
                                control={form.control}
                                name='supplierId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendor Name</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                // Auto-fill vendor details
                                                const selectedSupplier = suppliers.find(s => s.id === value)
                                                if (selectedSupplier) {
                                                    form.setValue('address', selectedSupplier.address)
                                                    form.setValue('email', selectedSupplier.email)
                                                }
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl className='w-full'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select vendor" />
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
                                    className='col-start-2 col-end-2'
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
                                <FormItem className="col-start-1">
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
                            <TableHeader className='bg-muted/50'>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Quantity</TableHead>
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
                                                name={`products.${index}.productId`} // Ubah name menjadi productId
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value)
                                                                // Set product name dan unit secara otomatis
                                                                const selectedProduct = inventoryItems.find(item => item.id === value)
                                                                if (selectedProduct) {
                                                                    form.setValue(`products.${index}.name`, selectedProduct.product)
                                                                    form.setValue(`products.${index}.unit`, selectedProduct.unit)
                                                                    form.setValue(`products.${index}.unitPrice`, selectedProduct.buyprice || 0)
                                                                }
                                                            }}
                                                            value={field.value}
                                                        >
                                                            <FormControl className='w-full'>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select product" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {inventoryItems.map((item) => (
                                                                    <SelectItem key={item.id} value={item.id}>
                                                                        {item.product} ({item.code})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>

                                        <TableCell className="p-0">
                                            <FormField
                                                name={`products.${index}.productId`}
                                                render={({ field }) => (
                                                    <input type="hidden" {...field} />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Description" {...field} />
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
                                        <TableCell className="w-42">
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.unitPrice`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative flex items-center">
                                                                <span className="absolute left-3 text-sm text-muted-foreground">Rp</span>
                                                                <Input
                                                                    type="number"
                                                                    className='justify-items-end'
                                                                    min="0"
                                                                    {...field}
                                                                    onChange={(e) => {
                                                                        const value = parseFloat(e.target.value) || 0;
                                                                        field.onChange(value);
                                                                    }}
                                                                />
                                                            </div>
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
                                        <TableCell className="w-42">
                                            <FormField
                                                control={form.control}
                                                name={`products.${index}.total`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative flex items-center">
                                                                <span className="absolute left-3 text-sm text-muted-foreground">Rp</span>
                                                                <Input
                                                                    className='justify-items-end'
                                                                    readOnly
                                                                    {...field}
                                                                    value={field.value.toLocaleString('id-ID')}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="w-32">
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
                    <div className="flex justify-end my-6">
                        <div className="space-y-3 w-120 p-4">
                            <div className="flex justify-between">
                                <h2 className='text-xl font-semibold'>Subtotal</h2>
                                <span className="font-semibold text-xl">
                                    {form.watch('buyprice').toLocaleString('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <h2 className='text-xl font-semibold'>Tax (10%)</h2>
                                <span className="font-semibold text-xl">
                                    {(form.watch('buyprice') * 0.1).toLocaleString('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    })}
                                </span>
                            </div>
                            <div className="border-t my-4"></div>

                            {/* Total */}
                            <div className="flex justify-between font-medium">
                                <h1 className='text-2xl font-semibold'>Total</h1>
                                <span className="font-semibold text-2xl">
                                    {(form.watch('buyprice') * 1.1).toLocaleString('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end space-x-4'>
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

export default PurchaseForm;