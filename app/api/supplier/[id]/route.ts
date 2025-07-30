import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

export async function PUT(req: Request, {
    params,
}: {
    params: Promise<{ id: string }>
}) {
    try {
        const { id } = await params
        const body = await req.json();

        // Define schema with proper types
        const contactSchema = z.object({
            id: z.string().optional(), // Mark id as optional
            name: z.string().min(1),
            department: z.string().min(1),
            email: z.string().email().or(z.literal('')),
            phone: z.string(),
        });

        const supplierSchema = z.object({
            name: z.string().min(1).max(100),
            email: z.string().email().or(z.literal('')),
            phone: z.string(),
            address: z.string(),
            contacts: z.array(contactSchema).optional(),
        });

        const { name, email, phone, address, contacts } = supplierSchema.parse(body);

        const result = await prisma.$transaction(async (prisma) => {
            // Update supplier
            await prisma.supplier.update({
                where: { id },
                data: { name, email, phone, address },
            });

            if (contacts) {
                // Get existing contacts
                const existingContacts = await prisma.contact.findMany({
                    where: { supplierId: id },
                });

                // Delete contacts not in the new list
                const contactsToDelete = existingContacts.filter(
                    ec => !contacts.some(c => c.id === ec.id)
                );

                if (contactsToDelete.length > 0) {
                    await prisma.contact.deleteMany({
                        where: { id: { in: contactsToDelete.map(c => c.id) } },
                    });
                }

                // Process each contact
                for (const contact of contacts) {
                    if (contact.id) {
                        // Update existing contact
                        await prisma.contact.update({
                            where: { id: contact.id },
                            data: {
                                name: contact.name,
                                department: contact.department,
                                email: contact.email,
                                phone: contact.phone,
                            },
                        });
                    } else {
                        // Create new contact
                        await prisma.contact.create({
                            data: {
                                name: contact.name,
                                department: contact.department,
                                email: contact.email,
                                phone: contact.phone,
                                supplierId: id,
                            },
                        });
                    }
                }
            }

            return await prisma.supplier.findUnique({
                where: { id },
                include: { contacts: true },
            });
        });

        return NextResponse.json(
            { supplier: result, message: "Supplier updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error('[SUPPLIER_PUT]', error);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 }
        );
    }
}