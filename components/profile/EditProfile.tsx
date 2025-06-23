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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Pen } from "lucide-react";

const editProfileSchema = z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().min(1, 'Email is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

interface EditProfileProps {
    initialData: any;
    onSuccess?: () => void;
}

export function ProfileCard({
    profile
}: {
    profile: any
}) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Edit
                    <Pen />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="mb-3">
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <EditProfile
                    initialData={profile}
                    onSuccess={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

export function EditProfile({ initialData, onSuccess }: EditProfileProps) {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: initialData.name || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            address: initialData.address || '',
        },
    });

    async function onSubmit(values: z.infer<typeof editProfileSchema>) {
        try {
            const response = await fetch(`/api/user/${initialData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to edit the profile");
            }
            toast.success("Profile edited successfully!");
            onSuccess?.();
            router.refresh();
        } catch (error) {
            console.error('Profile error', error);
            toast.error("Edit profile failed");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your full name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone number</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="+62 123456789"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your address"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    Edit Profile
                </Button>
            </form>
        </Form>
    );
}