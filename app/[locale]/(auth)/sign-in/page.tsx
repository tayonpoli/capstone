import SignInForm from "@/components/form/SignInForm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function page() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        redirect("/");
    }

    return (
        <div className='w-full'>
            <SignInForm />
        </div>
    );
};