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
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect } from 'react';

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

const SignUpForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

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

// const FormSchema = z
//     .object({
//         name: z.string().min(1, 'Username is required').max(100),
//         email: z.string().min(1, 'Email is required').email('Invalid email'),
//         password: z
//             .string()
//             .min(1, 'Password is required')
//             .min(8, 'Password must have than 8 characters'),
//         confirmPassword: z.string().min(1, 'Password confirmation is required'),
//     })
//     .refine((data) => data.password === data.confirmPassword, {
//         path: ['confirmPassword'],
//         message: 'Password do not match',
//     });

// const SignUpForm = () => {
//     const router = useRouter();
//     const form = useForm<z.infer<typeof FormSchema>>({
//         resolver: zodResolver(FormSchema),
//         defaultValues: {
//             name: '',
//             email: '',
//             password: '',
//             confirmPassword: '',
//         },
//     });

//     const onSubmit = async (values: z.infer<typeof FormSchema>) => {
//         const response = await fetch('/api/user', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 name: values.name,
//                 email: values.email,
//                 password: values.password
//             })
//         })

//         if (response.ok) {
//             router.push('/sign-in');
//         } else {
//             toast("Error", {
//                 description: "Oops! Something went wrong!"
//             })
//         }
//     };

//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
//                 <div className='space-y-6'>
//                     <FormField
//                         control={form.control}
//                         name='name'
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Username</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder='johndoe' {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name='email'
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Email</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder='mail@example.com' {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name='password'
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Password</FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         type='password'
//                                         placeholder='Enter your password'
//                                         {...field}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name='confirmPassword'
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Re-Enter your password</FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         placeholder='Re-Enter your password'
//                                         type='password'
//                                         {...field}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>
//                 <Button className='w-full mt-6' type='submit'>
//                     Sign up
//                 </Button>
//             </form>
//             <div className='mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400'>
//                 or
//             </div>
//             <p className='text-center text-sm text-gray-600 mt-2'>
//                 If you don&apos;t have an account, please&nbsp;
//                 <Link className='text-blue-500 hover:underline' href='/sign-in'>
//                     Sign in
//                 </Link>
//             </p>
//         </Form>
//     );
// };

// export default SignUpForm;