import { Inventory } from "@prisma/client";

export interface CartItem extends Inventory {
    quantity: number;
}

export type PaymentMethod = 'Cash' | 'QRIS' | 'Debit' | 'Online Payment';
export type Tag = 'GoFood' | 'GrabFood' | 'ShopeeFood' | 'Takeaway' | 'Other';

export interface Transaction {
    id: string;
    customerName: string;
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    paymentMethod: PaymentMethod;
    tag: Tag;
    memo?: string;
    createdAt: Date;
}