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

const FormSchema = z.object({
    email: z.string().min(1, 'User email is required').max(100),
    role: z.string().min(1, 'Role is required'),
});

export function InviteForm() {
    const router = useRouter();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: '',
            role: '',
        },
    });

    const roleOptions = [
        { value: 'Owner', label: 'Owner' },
        { value: 'Admin', label: 'Admin' },
        { value: 'Staff', label: 'Staff' },
    ] as const;

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email.toLowerCase(),
                    role: values.role // Pastikan konsisten dengan API
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create invitation");
            }

            toast.success(data.message || "Invitation sent successfully");
            router.push('/user');
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
            console.error('Submission error:', error);
        }
    }

    return (
        <div className='p-3'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4 items-start'>
                        <div className='col-span-2 space-y-6 gap-6 grid grid-cols-1 items-start'>
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='email@mail' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                    <FormItem className='w-50'>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roleOptions.map((role) => (
                                                    <SelectItem key={role.value} value={role.value}>
                                                        {role.label}
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
                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href='/user' >
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

export default InviteForm;