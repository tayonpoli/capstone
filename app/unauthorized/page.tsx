import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Blocks } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
    return (
        <div className="justify-items-center space-y-6">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-14 items-center justify-center rounded-xl">
                <Blocks className="size-8" />
            </div>
            <div className="justify-items-center space-y-2">
                <CardTitle>Unauthorized</CardTitle>
                <Badge variant="outline">401</Badge>
            </div>
            <CardDescription className="text-center">
                Oops! Sorry you don&apos;t have enough authorization for accessing this feature. You need a higher user authorization.
            </CardDescription>
            <Button asChild>
                <Link href={`/`}>
                    Back to Dashboard
                </Link>
            </Button>
        </div>
    )
}