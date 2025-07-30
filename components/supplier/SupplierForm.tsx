'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus } from 'lucide-react';
import { Card } from '../ui/card';

const ContactSchema = z.object({
    name: z.string().min(1, 'Contact name is required'),
    department: z.string().min(1, 'Department is required'),
    email: z.string().email('Invalid email address').or(z.literal('')),
    phone: z.string(),
});

const FormSchema = z.object({
    name: z.string().min(1, 'Supplier name is required').max(100),
    email: z.string().email('Invalid email address').or(z.literal('')),
    phone: z.string(),
    address: z.string(),
    contacts: z.array(ContactSchema).optional(),
});

export function SupplierForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const isEditMode = Boolean(initialData?.id);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialData ? {
            ...initialData,
            contacts: initialData.contacts || [],
        } : {
            name: '',
            email: '',
            phone: '',
            address: '',
            contacts: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'contacts',
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            const url = isEditMode
                ? `/api/supplier/${initialData.id}`
                : '/api/supplier';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success(
                    isEditMode ? "Supplier updated successfully!" : "Supplier created successfully!"
                );
                router.push('/supplier');
                router.refresh();
            } else {
                throw new Error("Failed to save supplier");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    }

    return (
        <div className='p-3'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <div className='space-y-6 grid gap-4 md:grid-cols-3 xl:grid-cols-4 my-4 items-start'>
                        <div className='col-span-2 space-y-6 gap-6 grid grid-cols-2 items-start'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='John doe' {...field} />
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
                                            <Input placeholder='supplier@mail.com' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='phone'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder='+62' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='address'
                                render={({ field }) => (
                                    <FormItem className='max-w-lg'>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Company address' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Contacts Section */}
                    <div className="mt-8 border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Contacts</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ name: '', department: '', email: '', phone: '' })}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Contact
                            </Button>
                        </div>

                        {fields.length === 0 ? (
                            <Card className="text-center py-4 text-gray-500">
                                No contacts added yet.
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <Card key={field.id} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`contacts.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Contact name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`contacts.${index}.department`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Department" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`contacts.${index}.email`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="contact@mail.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`contacts.${index}.phone`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Phone number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="md:col-span-4 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => remove(index)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className='fixed bottom-16 right-14 space-x-4'>
                        <Button asChild variant='outline'>
                            <Link href={'/supplier'}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type='submit'>
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default SupplierForm;