import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SiteHeader } from "@/components/site-header";
import { PosHeader } from "@/components/pos-header";

export default async function PosLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getServerSession(authOptions)

    return (
        <div className="flex">
            <SidebarProvider>
                <SidebarInset>
                    <PosHeader session={session} />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}