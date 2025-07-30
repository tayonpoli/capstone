export interface Production {
    id: string
    name: string
    description: string | null
    tag: string | null
    productId: string
    product: {
        product: string
    }
    total: number
}