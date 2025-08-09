"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

const formSchema = z.object({
    email: z.string().email("Email tidak valid")
})

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    const t = useTranslations('forget');

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t('fail'))
            }

            toast.success(t('success'))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='w-full'>
            <CardHeader>
                <CardTitle className='text-center mb-6'>{t('title')}</CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="sample@mail.com"
                                        {...field}
                                        type="email"
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
                        {isLoading ? t('loading') : t('button')}
                    </Button>
                </form>
            </Form>
            <div className="mt-6 text-center text-sm">
                <Button asChild variant="outline" className='w-full'>
                    <Link href="/sign-in">
                        {t('back')}
                    </Link>
                </Button>
            </div>
        </div>
    )
}