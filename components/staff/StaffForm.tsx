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

const FormSchema = z.object({
    name: z.string().min(1, 'Staff name is required').max(100),
    email: z.string(),
    position: z.string(),
    phone: z.string(),
    address: z.string(),
});

export function StaffForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const isEditMode = Boolean(initialData?.id);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialData ? {
            ...initialData,
        } : {
            name: '',
            email: '',
            position: '',
            phone: '',
            address: '',
        },
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const url = isEditMode
                ? `/api/staff/${initialData.id}`
                : '/api/staff';
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
                    isEditMode ? "Staff updated successfully!" : "Staff created successfully!"
                );
                router.push('/staff');
                router.refresh();
            } else {
                throw new Error("Failed to save staff");
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
                                        <FormLabel>Staff Name</FormLabel>
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
                                    <FormItem>
                                        <FormLabel>Staff Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='staff@mail.com' {...field} />
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
                            <FormField
                                control={form.control}
                                name='position'
                                render={({ field }) => (
                                    <FormItem className='w-50'>
                                        <FormLabel>Position</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Select staff position" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Cashier">Cashier</SelectItem>
                                                <SelectItem value="Barista">Barista</SelectItem>
                                                <SelectItem value="Headbar">Head Bar</SelectItem>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name='address'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Staff Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Staff Street'
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href={isEditMode ? `/staff/${initialData.id}` : '/staff'}>
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

export default StaffForm;