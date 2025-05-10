import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DetailCustomer } from "@/components/customer/DetailCustomer";

interface PageProps {
    params: {
        id: string;
    };
    searchParams?: {
        [key: string]: string | string[] | undefined;
    };
}

export default async function CustomerDetailPage({ params }: PageProps) {
    const customer = await prisma.customer.findUnique({
        where: { id: params.id }
    });

    if (!customer) {
        notFound();
    }

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <DetailCustomer customer={customer} />
        </div>
    );
}