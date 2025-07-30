import { formatIDR } from "@/lib/formatCurrency"
import { Inventory, Production, Material } from "@prisma/client"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { useTranslations } from "next-intl"

interface ProductionDetailProps {
    production: Production & {
        product: Inventory
        materials: (Material & {
            material: Inventory
        })[]
    }
}

export function ProductionDetail({ production }: ProductionDetailProps) {
    const t = useTranslations('production.column');
    return (
        <div className="px-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>
                        Production Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-2/3 flex grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <CardDescription>
                                {t('title')}
                            </CardDescription>
                            <Label className="text-md font-medium">{production.name}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('tag')}
                            </CardDescription>
                            <Label className="text-md font-medium">{production.tag}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Created Date
                            </CardDescription>
                            <Label className="text-md font-medium">{format(new Date(production.createdAt), "dd MMMM yyyy")}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('output')}
                            </CardDescription>
                            <Label className="text-md font-medium">{production.product.product}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('desc')}
                            </CardDescription>
                            <Label className="text-md font-medium">{production.description}</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Column - Order Items */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Components</h2>
                <div className="p-2 border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead >Component</TableHead>
                                <TableHead >Item Code/SKU</TableHead>
                                <TableHead className="text-center w-[100px]">Qty</TableHead>
                                <TableHead className="text-center">Unit</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {production.materials.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.material.product}</TableCell>
                                    <TableCell className="font-medium">{item.material.code}</TableCell>
                                    <TableCell className="text-center">{item.qty}</TableCell>
                                    <TableCell className="text-center">{item.unit}</TableCell>
                                    <TableCell className="text-right">{formatIDR(item.price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="font-medium">
                                    Total Cost
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatIDR(production.total)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </div>
    )
}