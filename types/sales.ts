export interface Sales {
    id: string
    total: number
    tag: string | null
    memo: string | null
    paymentStatus: string
    customerId: string
    customer: {
        name: string | null
    }
    customerName: string | null
    orderDate: Date
    createdAt: Date
    updatedAt: Date
}

export interface POS {
    id: string
    customerName: string | null
    total: number
    tag: string | null
    memo: string | null
    paymentStatus: string
    userId: string
    user: {
        name: string | null
    }
    orderDate: Date
    createdAt: Date
    updatedAt: Date
    SalesInvoice: {
        paymentMethod: string | null
    }[]
}

export interface SalesRecord {
    id: number;
    date: string;
    product: string;
    amount: number;
    quantity: number;
    region: string;
}

export interface AnalysisResult {
    summary: string;
    topProducts: { product: string; totalSales: number }[];
    trends: string;
    recommendations: string[];
}