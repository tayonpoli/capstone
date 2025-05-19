"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FormSchema = z.object({
    token: z.string().min(1, 'Invitation token is required'),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"]
})

interface NewPasswordFormProps {
    token?: string | null
}

export const NewPasswordForm = ({ token }: NewPasswordFormProps) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    })

    // Set email jika ada di invitation
    useEffect(() => {
        const fetchReset = async () => {
            if (token) {
                try {
                    const response = await fetch(`/api/auth/forgot-password?token=${token}`);
                    if (response.ok) {
                        const data = await response.json();
                        form.setValue('token', token);
                    }
                } catch (error) {
                    console.error('Failed to fetch reset pasword:', error);
                }
            }
        };

        fetchReset();
    }, [token, form]);

    const onSubmit = async (values: z.infer<typeof FormSchema>) => {
        if (!token) {
            toast.error("Token tidak valid")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: values.password
                }),
            })

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Password changed successfully!");
                router.push('/sign-in');
            } else {
                throw new Error(data.message || "Failed to change password");
            }
        } catch (error) {
            toast.error("Oops! Something went wrong!");
            console.error('Reset password error:', error);
        } finally {
            setIsLoading(false)
        }
    };

    if (!token) {
        return (
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Token Tidak Valid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-sm text-muted-foreground">
                            Link reset password tidak valid atau sudah kadaluarsa.
                        </p>
                        <Button asChild className="w-full mt-4">
                            <Link href="/auth/forgot-password">
                                Minta link reset baru
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <Form {...form}>
            <CardHeader>
                <CardTitle className='text-center mb-4'>Reset Password</CardTitle>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password Baru</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Konfirmasi Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <input type="hidden" {...form.register('token')} />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Change Password"}
                </Button>
            </form>
        </Form>
    );
};

export default NewPasswordForm;