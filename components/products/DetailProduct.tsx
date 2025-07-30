import { formatIDR } from "@/lib/formatCurrency"
import { Inventory, PurchaseItem, PurchaseOrder, Supplier } from "@prisma/client"
import { Undo2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

interface PurchaseItemWithOrder extends PurchaseItem {
    purchaseOrder: PurchaseOrder & {
        supplier: Pick<Supplier, 'name'> | null
    }
}

interface ProductDetailProps {
    product: Inventory & {
        purchaseItems: PurchaseItemWithOrder[]
    }
}

export function ProductDetail({ product }: ProductDetailProps) {
    const t = useTranslations('inventory');
    const isProduct = product.category === 'product';

    return (
        <div className="px-4 mb-8">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        {t('title')}
                    </p>
                    <h1 className='mb-8 text-2xl font-semibold'>
                        {t('detail')}
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/product`}>
                            <Undo2Icon />  Back
                        </Link>
                    </Button>
                </div>
            </div>

            <h1 className="text-2xl font-semibold mb-4">{product.product}</h1>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>
                        {t('column.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-2/3 flex grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <CardDescription>
                                SKU
                            </CardDescription>
                            <Label className="text-md font-medium">{product.code}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.category')}
                            </CardDescription>
                            <Label className="text-md font-medium">{product.category}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                {t('column.desc')}
                            </CardDescription>
                            <Label className="text-md font-medium">{product.description}</Label>
                        </div>
                        <div className="space-y-1">
                            <CardDescription>
                                Unit
                            </CardDescription>
                            <Label className="text-md font-medium">{product.unit}</Label>
                        </div>
                        {!isProduct && (
                            <>
                                <div className="space-y-1">
                                    <CardDescription>
                                        Stock onHand
                                    </CardDescription>
                                    <Label className="text-md font-medium">{Math.round(product.stock)}</Label>
                                </div>
                                <div className="space-y-1">
                                    <CardDescription>
                                        Stock Limit
                                    </CardDescription>
                                    <Label className="text-md font-medium">{product.limit}</Label>
                                </div>
                            </>
                        )}
                        {!isProduct && (
                            <div className="space-y-1">
                                <CardDescription>
                                    {t('column.buy')}
                                </CardDescription>
                                <Label className="text-md font-medium">{formatIDR(product.buyprice)}</Label>
                            </div>
                        ) || (
                                <div className="space-y-1">
                                    <CardDescription>
                                        {t('column.sell')}
                                    </CardDescription>
                                    <Label className="text-md font-medium">{formatIDR(product.sellprice)}</Label>
                                </div>
                            )}
                    </div>
                </CardContent>
            </Card>

            {product.purchaseItems && product.purchaseItems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('recent.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('recent.date')}</TableHead>
                                    <TableHead>{t('recent.id')}</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>{t('recent.qty')}</TableHead>
                                    <TableHead>{t('recent.unit')}</TableHead>
                                    <TableHead className="text-right">{t('recent.total')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product.purchaseItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {item.purchaseOrder.purchaseDate ?
                                                format(new Date(item.purchaseOrder.purchaseDate), "dd MMMM yyyy") :
                                                "-"}
                                        </TableCell>
                                        <TableCell>{item.purchaseOrder.id.slice(0, 8).toUpperCase()}</TableCell>
                                        <TableCell>{item.purchaseOrder.supplier?.name || "-"}</TableCell>
                                        <TableCell className="font-semibold">+ {item.quantity}</TableCell>
                                        <TableCell>{formatIDR(item.price)}</TableCell>
                                        <TableCell className="text-right">
                                            {formatIDR(item.quantity * item.price)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}