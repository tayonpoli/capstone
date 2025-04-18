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
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const FormSchema = z
    .object({
        product: z.string().min(1, 'Product name is required').max(100),
        code: z.string().min(1, 'SKU is required'),
        category: z.string().min(1, 'Category is required'),
        description: z.string(),
        unit: z.string().min(1, 'Unit is required'),
        isBuyable: z.boolean().default(false),
        buyprice: z.coerce.number().int(),
        isSellable: z.boolean().default(false),
        sellprice: z.coerce.number().int(),
        isTrack: z.boolean().default(false),
        limit: z.coerce.number().int(),
    })

const ProductForm = () => {
    const router = useRouter();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            product: '',
            code: '',
            category: '',
            description: '',
            unit: '',
            isBuyable: false,
            isSellable: false,
            isTrack: false,
            buyprice: 0,
            sellprice: 0,
            limit: 0,
        },
    });

    const isBuyable = form.watch('isBuyable');
    const isSellable = form.watch('isSellable');
    const isTrack = form.watch('isTrack');

    const unitOptions = [
        { value: 'Pcs', label: 'Pcs' },
        { value: 'Box', label: 'Box' },
        { value: 'Kg', label: 'Kg' },
        { value: 'gram', label: 'gram' },
        { value: 'Litre', label: 'Litre' },
        { value: 'ml', label: 'ml' },
    ] as const;

    const onSubmit = async (values: z.infer<typeof FormSchema>) => {
        const response = await fetch('/api/product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: values.product,
                code: values.code,
                category: values.category,
                unit: values.unit,
                description: values.description,
                buyprice: values.buyprice,
                sellprice: values.sellprice,
                limit: values.limit,
            })
        })

        if (response.ok) {
            router.push('/product');
        } else {
            toast("Error", {
                description: "Oops! Something went wrong!"
            })
        }
    };

    return (
        <div className='p-3'>
            <div className='text-sm font-light text-gray-400'>
                Inventory
            </div>
            <div className='mb-10 text-3xl font-semibold'>
                Add New Product
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4 items-start'>
                        <div className='col-span-2 space-y-6 gap-6 grid md:grid-cols-1 lg:grid-cols-2 items-start'>
                            <FormField
                                control={form.control}
                                name='product'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Milk' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='code'
                                render={({ field }) => (
                                    <FormItem className='w-50'>
                                        <FormLabel>Product Code / SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder='P001' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='category'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Coffee' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='unit'
                                render={({ field }) => (
                                    <FormItem className='w-50'>
                                        <FormLabel>Unit</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        </div>
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem
                                    className='col-span-2 max-w-lg'
                                >
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Describe the product'
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='space-y-4'>
                            <FormField
                                control={form.control}
                                name="isBuyable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start p-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>I buy this product</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {isBuyable && (
                                <FormField
                                    control={form.control}
                                    name='buyprice'
                                    render={({ field }) => (
                                        <FormItem className='w-50'>
                                            <FormLabel>Buy Price</FormLabel>
                                            <FormControl>
                                                <Input placeholder='0' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        <div className='space-y-4'>
                            <FormField
                                control={form.control}
                                name="isSellable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start p-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>I sell this product</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {isSellable && (
                                <FormField
                                    control={form.control}
                                    name='sellprice'
                                    render={({ field }) => (
                                        <FormItem className='w-50'>
                                            <FormLabel>Sell Price</FormLabel>
                                            <FormControl>
                                                <Input placeholder='0' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        <div className='space-y-4'>
                            <FormField
                                control={form.control}
                                name="isTrack"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start p-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Track stock for this product</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {isTrack && (
                                <FormField
                                    control={form.control}
                                    name='limit'
                                    render={({ field }) => (
                                        <FormItem className='w-20'>
                                            <FormLabel>Stock limit</FormLabel>
                                            <FormControl>
                                                <Input type='number' placeholder='0' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href='/product'>
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

export default ProductForm;