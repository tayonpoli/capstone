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
import { useEffect } from 'react';
import { CardHeader, CardTitle } from '../ui/card';
import { Blocks } from 'lucide-react';

const FormSchema = z.object({
    name: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string()
        .min(1, 'Password is required')
        .min(8, 'Password must have at least 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    token: z.string().min(1, 'Invitation token is required')
}).refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
});

interface SignUpFormProps {
    token?: string | null
}

export const SignUpForm = ({ token }: SignUpFormProps) => {
    const router = useRouter()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            token: token || ''
        },
    });

    // Set email jika ada di invitation
    useEffect(() => {
        const fetchInvitation = async () => {
            if (token) {
                try {
                    const response = await fetch(`/api/invite?token=${token}`);
                    if (response.ok) {
                        const data = await response.json();
                        form.setValue('email', data.email);
                        form.setValue('token', token);
                    }
                } catch (error) {
                    console.error('Failed to fetch invitation:', error);
                }
            }
        };

        fetchInvitation();
    }, [token, form]);

    const onSubmit = async (values: z.infer<typeof FormSchema>) => {
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    token: values.token
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Account created successfully!");
                router.push('/sign-in');
            } else {
                throw new Error(data.message || "Registration failed");
            }
        } catch (error) {
            toast.error("Oops! Something went wrong!");
            console.error('Registration error:', error);
        }
    };

    return (
        <Form {...form}>
            <CardHeader>
                <CardHeader className='grid items-center justify-center space-y-4'>
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg ml-2">
                        <Blocks className="size-5" />
                    </div>
                    {/* <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">MauManage</span>
                        <span className="truncate text-xs">Enterprise</span>
                    </div> */}
                    <CardTitle className='text-center mb-6'>
                        Sign Up
                    </CardTitle>
                </CardHeader>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                <div className='space-y-6'>
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder='johndoe' {...field} />
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
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='mail@example.com'
                                        {...field}
                                        readOnly={!!token} // Email readonly jika dari invitation
                                        className={token ? 'bg-gray-100' : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type='password'
                                        placeholder='Enter your password'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='confirmPassword'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Re-Enter your password'
                                        type='password'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <input type="hidden" {...form.register('token')} />
                </div>
                <Button className='w-full mt-6' type='submit'>
                    Sign up
                </Button>
            </form>
            <div className='mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400'>
                or
            </div>
            <p className='text-center text-sm text-gray-600 mt-2'>
                Already have an account?&nbsp;
                <Link className='text-blue-500 hover:underline' href='/sign-in'>
                    Sign in
                </Link>
            </p>
        </Form>
    );
};

export default SignUpForm;