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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';

const FormSchema = z.object({
    email: z.string().min(1, 'User email is required').max(100),
    role: z.string().min(1, 'Role is required'),
});

export function InviteForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email.toLowerCase(),
                    role: values.role
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
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-full mt-4'>
                <div className='space-y-6'>
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>User Email</FormLabel>
                                <FormControl>
                                    <Input placeholder='mail@example.com' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='role'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
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
                <Button
                    className='w-full mt-6'
                    type='submit'
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : <>
                        Send Invitation <Send />
                    </>}
                </Button>
            </form>
        </Form>
    );
};

export default InviteForm;