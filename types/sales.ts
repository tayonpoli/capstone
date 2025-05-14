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