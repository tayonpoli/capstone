"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Locale, routing, usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Globe } from "lucide-react";

type Props = {
    children: ReactNode;
    defaultValue: string;
    label: string;
};

export default function LocaleSwitcherSelect({ defaultValue, label }: Props) {
    const router = useRouter();

    const pathname = usePathname();
    const params = useParams();
    const currentLocale = useParams().locale as Locale;

    function onLocaleChange(nextLocale: Locale) {
        const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

        router.replace(
            // @ts-expect-error -- TypeScript will validate that only known `params`
            { pathname: pathWithoutLocale, params },
            { locale: nextLocale }
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <span className="font-medium">{currentLocale.toUpperCase()}</span>
                    <span className="sr-only">{label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {routing.locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={() => onLocaleChange(locale)}
                        className={currentLocale === locale ? 'bg-accent' : ''}
                    >
                        {locale.toUpperCase()}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}