// app/auth/new-password/page.tsx
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

const formSchema = z.object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"]
})

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// export async function generateMetadata(props: {
//     params: Params;
//     searchParams: SearchParams;
// }) {
//     const searchParams = await props.searchParams;
//     const token = Array.isArray(searchParams.token)
//         ? searchParams.token[0]
//         : searchParams.token;

//     return {
//         title: token ? 'Accept Invitation' : 'Sign Up',
//         description: token
//             ? 'Accept your invitation to join our platform'
//             : 'Create a new account',
//     } satisfies Metadata;
// }

export default async function SignUpPage(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const token = Array.isArray(searchParams.token)
        ? searchParams.token[0]
        : searchParams.token;
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Gagal reset password")
            }

            toast.success("Password berhasil diubah. Silakan login dengan password baru Anda.")
            window.location.href = '/sign-in'
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        } finally {
            setIsLoading(false)
        }
    }

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
        <div className="w-full">
            <CardHeader>
                <CardTitle className='text-center mb-4'>Reset Password</CardTitle>
            </CardHeader>
            <Form {...form}>
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
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Memproses..." : "Atur Password Baru"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}