export interface Expenses {
    id: string
    total: number
    category: string | null
    memo: string | null
    paymentStatus: string
    supplierId: string
    supplier: {
        name: string | null
    }
    expenseDate: Date
    createdAt: Date
    updatedAt: Date
}
