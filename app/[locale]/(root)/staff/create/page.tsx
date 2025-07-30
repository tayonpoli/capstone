import StaffForm from "@/components/staff/StaffForm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CustomerCreatePage() {
    const session = await getServerSession(authOptions);

    const allowedRoles = ['Admin', 'Owner'];

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/unauthorized")
    }
    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Contacts
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Add New Staff
                </div>
            </div>
            <StaffForm />
        </div>
    );
};