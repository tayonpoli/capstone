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

const editCompanySchema = z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().min(1, 'Email is required'),
    phone: z.string().optional(),
    address: z.string().min(1, "Phone is required"),
});

interface EditCompanyProps {
    initialData: any;
    onSuccess?: () => void;
}

export function CompanyCard({
    company
}: {
    company: any
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
                    <DialogTitle>Edit Company Profile</DialogTitle>
                </DialogHeader>
                <EditCompany
                    initialData={company}
                    onSuccess={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

export function EditCompany({ initialData, onSuccess }: EditCompanyProps) {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(editCompanySchema),
        defaultValues: {
            ...initialData,
        },
    });

    async function onSubmit(values: z.infer<typeof editCompanySchema>) {
        try {
            const response = await fetch(`/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to edit the company profile");
            }
            toast.success("Company profile edited successfully!");
            onSuccess?.();
            router.push('/profile');
            router.refresh();
        } catch (error) {
            console.error('Profile error', error);
            toast.error("Edit company profile failed");
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
                            <FormLabel>Company name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your company name"
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
                            <FormLabel>Company mail</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your company email"
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
                            <FormLabel>Company Phone</FormLabel>
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
                            <FormLabel>Company address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your company address"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    Edit Company Profile
                </Button>
            </form>
        </Form>
    );
}