import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Blocks } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Unauthorized() {

    const t = useTranslations('unauthorized');

    return (
        <div className="justify-items-center space-y-6">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-14 items-center justify-center rounded-xl">
                <Blocks className="size-8" />
            </div>
            <div className="space-y-2">
                <CardTitle>
                    Unauthorized
                </CardTitle>
                <Badge className="ml-8" variant="outline">401</Badge>
            </div>
            <CardDescription className="text-center">
                {t('desc')}
            </CardDescription>
            <CardFooter>
                <Button asChild>
                    <Link href={`/`}>
                        {t('button')}
                    </Link>
                </Button>
            </CardFooter>
        </div>
    )
}