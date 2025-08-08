export interface AnalysisResult {
    summary_analysis: string;
    market_trend_analysis: string;
    top_products: ProductAnalysis[];
    inventory_alerts?: InventoryAlert[];
    purchase_history_analysis?: string;
    top_purchased_products: ProductAnalysis[];
    recommendations: Recommendation[];
}

export interface AnalysisRequest {
    startDate: string | Date;
    endDate: string | Date;
    language: string;
}


export interface ProductAnalysis {
    sku: string;
    name: string;
    sales_qty: number;
    purchase_qty?: number;
}

export interface InventoryAlert {
    sku: string;
    name: string;
    current_stock: number;
    minimum_limit: number;
    status: string;
}

export interface Recommendation {
    category: 'marketing' | 'inventory' | 'purchasing' | 'general' | 'pricing' | 'operations';
    action: string;
}