import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailExpense } from "@/components/expenses/DetailExpense"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PaymentExpenses } from "@/components/expenses/ExpensePayment"
import { EditExpenses } from "@/components/expenses/EditExpense"

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const isStaff = session.user.role === 'Staff'

    const { id } = await params
    const expenses = await prisma.expenses.findUnique({
        where: { id: id },
        include: {
            supplier: true,
            ExpenseInvoice: true,
        },
    })

    const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
    })

    if (!expenses) {
        return notFound()
    }

    const isPaid = expenses.paymentStatus === 'Paid';
    const totalPaid = expenses.ExpenseInvoice?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
    const remainingAmount = expenses.total - totalPaid;

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <DetailExpense expenses={expenses} />
            <div className='fixed bottom-16 right-14 space-x-4'>
                {(!isStaff && !isPaid) && (
                    <>
                        <EditExpenses
                            initialData={expenses}
                            suppliers={suppliers}
                        />

                        <PaymentExpenses
                            expenseId={id}
                            remainingAmount={remainingAmount}
                        />
                    </>
                )}
            </div>
        </div>
    );
}