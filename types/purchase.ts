export interface Purchase {
    id: string
    total: number
    tag: string | null
    memo: string | null
    contact: string | null
    status: string
    paymentStatus: string
    urgency: string
    supplierId: string
    supplier: {
        name: string | null
    }
    purchaseDate: Date
    dueDate: Date
    createdAt: Date
    updatedAt: Date
}

export interface PurchasePaymentFormProps {
    purchaseId: string;
    remainingAmount: number;
    onSuccess?: () => void;
}