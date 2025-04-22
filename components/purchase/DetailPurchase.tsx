import { formatIDR } from "@/lib/formatCurrency"
import { Inventory } from "@prisma/client"
import { InfoIcon, Undo2Icon } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"

interface ProductDetailProps {
    product: Inventory
}

export function ProductDetail({ product }: ProductDetailProps) {
    return (
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Inventory
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Product Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/product`}>
                            <Undo2Icon />  Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/product/${product.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>
            <h1 className="text-2xl font-semibold mb-4">{product.product}</h1>
            <div>
                <div className="lg:w-150 grid grid-cols-2 gap-8 mt-4">
                    <div className="mt-4 col-span-2 flex flex-center items-center text-lg font-semibold">
                        <InfoIcon />
                        <h2 className="ml-3">Product Information</h2>
                    </div>
                    <div className="font-medium text-gray-500">
                        Product Code
                    </div>
                    <div className="font-medium">{product.code}</div>
                    <div className="font-medium text-gray-500">
                        Product Category
                    </div>
                    <div className="font-medium">{product.category}</div>
                    <div className="font-medium text-gray-500">
                        Product Description
                    </div>
                    <div className="font-medium">{product.description}</div>
                    <div className="font-medium text-gray-500">
                        Stock onHand
                    </div>
                    <div className="font-medium">{product.stock}</div>
                    <div className="font-medium text-gray-500">
                        Stock Limit
                    </div>
                    <div className="font-medium">{product.limit}</div>
                    <div className="mt-4 col-span-2 flex flex-center items-center text-lg font-semibold">
                        <InfoIcon />
                        <h2 className="ml-3">Pricing Information</h2>
                    </div>
                    <div className="font-medium text-gray-500">
                        Buying Price
                    </div>
                    <div className="font-medium">
                        {formatIDR(product.buyprice)}
                    </div>
                    <div className="font-medium text-gray-500">
                        Selling Price
                    </div>
                    <div className="font-medium">
                        {formatIDR(product.sellprice)}
                    </div>
                </div>
            </div>
        </div>
    )
}