"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Pen } from "lucide-react";

const changePasswordSchema = z.object({
    oldPassword: z.string().min(8, 'The old password minimal 8 characters'),
    password: z.string().min(8, "The password minimal 8 characters"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password not match",
    path: ["confirmPassword"]
})

interface ChangePasswordProps {
    id: string,
    onSuccess?: () => void;
}

export function ChangePasswordCard({
    id
}: {
    id: string
}) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="mb-3">
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <ChangePassword
                    id={id}
                    onSuccess={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

export function ChangePassword({ id, onSuccess }: ChangePasswordProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            oldPassword: '',
            password: '',
            confirmPassword: ''
        },
    });

    async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
        try {
            const response = await fetch(`/api/auth/reset-password/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldPassword: values.oldPassword,
                    password: values.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Password change successfully!");
                onSuccess?.();
                router.refresh();
            } else {
                toast.error(data.error || "Ooops! Something went wrong!");
                throw new Error(data.error || "Chaneg password failed");
            }
        } catch (error) {
            console.error('Profile error', error);
            toast.error("Change password failed");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Old Password</FormLabel>
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
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
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
                            <FormLabel>Confirm Password</FormLabel>
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
                    {isLoading ? "Processing..." : "Change Password"}
                </Button>
            </form>
        </Form>
    );
}