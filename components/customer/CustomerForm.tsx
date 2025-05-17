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

const FormSchema = z.object({
    name: z.string().min(1, 'Customer name is required').max(100),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
});

export function CustomerForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const isEditMode = Boolean(initialData?.id);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialData ? {
            ...initialData,
        } : {
            name: '',
            email: '',
            phone: '',
            address: '',
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const url = isEditMode
                ? `/api/customer/${initialData.id}`
                : '/api/customer';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success(
                    isEditMode ? "Customer updated successfully!" : "Customer created successfully!"
                );
                router.push('/customer');
                router.refresh();
            } else {
                throw new Error("Failed to save product");
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
                    <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4 items-start'>
                        <div className='col-span-2 space-y-6 gap-6 grid md:grid-cols-1 lg:grid-cols-2 items-start'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='John doe' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem className='w-50'>
                                        <FormLabel>Customer Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='customer@mail.com' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='phone'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder='+62' {...field} />
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
                                    className='col-span-2 max-w-lg'
                                >
                                    <FormLabel>Customer Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Customer Street'
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href={'/customer'}>
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

export default CustomerForm;