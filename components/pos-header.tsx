import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Session } from "next-auth"
import { useTranslations } from "next-intl"
import Link from "next/link"

interface PosHeaderProps {
    session: Session | null
}

export function PosHeader({ session }: PosHeaderProps) {
    const t = useTranslations('pos');
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) py-3">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{session?.user.name}</span>
                    <span className="truncate text-xs">{session?.user.role}</span>
                </div>
                <Button asChild>
                    <Link href={`/`}>
                        {t('backButton')}
                    </Link>
                </Button>
            </div>
        </header>
    )
}
