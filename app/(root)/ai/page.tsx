import SalesAnalysis from "@/components/ai/SalesAnalysis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AnalysisPage() {
    const session = await getServerSession(authOptions);

    const allowedRoles = ['Admin', 'Owner'];

    // Jika tidak ada session, redirect ke login
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/unauthorized")
    }

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <SalesAnalysis />
        </div>
    );
}