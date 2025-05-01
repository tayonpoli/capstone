import { AppSidebar } from "@/components/app-sidebar";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getServerSession(authOptions)

    return (
        <div className="h-screen flex">
            {/* LEFT */}
            {/* <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 border-r"> */}
                {/* <Link
                    href="/"
                    className="flex items-center justify-center lg:justify-start gap-2"
                >
                    <Image src="/logo.png" alt="logo" width={128} height={72} />
                </Link> */}
                {/* <Menu /> */}
                {/* </div> */}
                <SidebarProvider>
                <AppSidebar session={session} />
                    <SidebarInset>
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            {/* RIGHT */}
            {/* <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#f2f4f7] overflow-auto flex flex-col">
                <Navbar />
                {children}
            </div> */}
        </div>
    );
}