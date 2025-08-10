import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from '@/types/analysis';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request): Promise<NextResponse<{ success: boolean; data?: AnalysisResult; error?: string }>> {
    try {
        const { startDate, endDate, language }: AnalysisRequest = await request.json();

        if (!startDate || !endDate) {
            throw new Error('Start date and end date are required');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            throw new Error('Start date cannot be after end date');
        }

        const bahasa = language;

        const t = await getTranslations('ai.prompt');

        const orders = await prisma.salesOrder.findMany({
            where: {
                orderDate: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        const purchases = await prisma.purchaseOrder.findMany({
            where: {
                purchaseDate: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                supplier: true,
            },
        });

        const inventory = await prisma.inventory.findMany({
            select: {
                id: true,
                product: true,
                code: true,
                stock: true,
                limit: true,
                category: true,
            }
        });

        const formattedSales = orders.map((order) => ({
            id: order.id,
            orderDate: order.orderDate.toISOString(),
            customerId: order.customerId,
            total: order.total,
            items: order.items.map((item) => ({
                productName: item.product.product,
                sku: item.product.code,
                quantity: item.quantity,
                price: item.price,
                itemTotal: item.total,
            })),
        }));

        const formattedPurchases = purchases.map((purchase) => ({
            id: purchase.id,
            purchaseDate: purchase.purchaseDate.toISOString(),
            supplierName: purchase.supplier.name,
            total: purchase.total,
            items: purchase.items.map((item) => ({
                productName: item.product.product,
                sku: item.product.code,
                quantity: item.quantity,
                price: item.price,
                itemTotal: item.total,
            })),
        }));

        const formattedInventory = inventory.map((item) => ({
            id: item.id,
            productName: item.product,
            sku: item.code,
            currentStock: item.stock,
            minimumLimit: item.limit,
            category: item.category,
        }));

        const prompt = `
        Anda adalah seorang analis bisnis profesional. Berdasarkan data penjualan, inventaris, dan pembelian yang disediakan,
berikan analisis bisnis yang komprehensif.

Fokus pada poin-poin berikut untuk analisis Anda:
1.  **summary_analysis**: Ringkasan performa bisnis secara keseluruhan.
2.  **market_trend_analysis**: Analisis tren pasar dan perkiraan penjualan untuk 7-30 hari ke depan.
3.  **top_products**: 3 produk terlaris berdasarkan kuantitas penjualan.
5.  **inventory_alerts**: Produk dengan category material atau packaging yang stoknya di bawah batas minimum atau mendekati.
6.  **purchase_history_analysis**: Analisis histori pembelian, tren, dan pemasok utama dan berikan rencana untuk pembelian selanjutnya.
7.  **top_purchased_products**: 3 produk yang paling sering dibeli dari pemasok.
8.  **recommendations**: Rekomendasi konkret untuk setiap kategori: 'marketing', 'inventory', 'pricing', 'operations', 'purchasing'.

Data untuk dianalisis:
Data Penjualan (JSON):
${JSON.stringify(formattedSales, null, 2)}
(Disclaimer: Hanya untuk data penjualan dengan customerId=001, ini adalah sebuah customerId default untuk POS system, untuk kasus ini analisis nama customernya dapat menggunakan field customerName)

        Data Inventaris (JSON):
        ${JSON.stringify(formattedInventory, null, 2)}

        Data Pembelian (JSON):
        ${JSON.stringify(formattedPurchases, null, 2)}
`;

        const ai = new GoogleGenAI({});

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: `Kamu adalah agen profesional analis bisnis yang ahli dalam data penjualan, inventaris, dan pembelian. Output menggunakan ${bahasa}`,
                thinkingConfig: {
                    thinkingBudget: 2048,
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary_analysis: {
                            type: Type.STRING,
                            description: "Ringkasan performa bisnis secara keseluruhan (penjualan, inventaris, pembelian) dalam 1-2 paragraf."
                        },
                        market_trend_analysis: {
                            type: Type.STRING,
                            description: "Analisis tren pasar dan perkiraan penjualan untuk 7-30 hari ke depan."
                        },
                        top_products: {
                            type: Type.ARRAY,
                            description: "Daftar 3 produk terlaris berdasarkan kuantitas penjualan.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sku: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    sales_qty: { type: Type.NUMBER },
                                },
                                required: ["sku", "name", "sales_qty"]
                            }
                        },
                        inventory_alerts: {
                            type: Type.ARRAY,
                            description: "Daftar produk dengan category material atau packaging yang stoknya di bawah limit atau mendekati limit.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sku: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    current_stock: { type: Type.NUMBER },
                                    minimum_limit: { type: Type.NUMBER },
                                    status: {
                                        type: Type.STRING,
                                        enum: ["Stok Habis", "Perlu Segera Restock", "Mendekati Limit"]
                                    },
                                },
                                required: ["sku", "name", "current_stock", "minimum_limit", "status"]
                            }
                        },
                        purchase_history_analysis: {
                            type: Type.STRING,
                            description: "Analisis histori pembelian, termasuk tren, pemasok utama, dan efisiensi."
                        },
                        top_purchased_products: {
                            type: Type.ARRAY,
                            description: "Daftar 3 produk yang paling sering dibeli/dipesan dari pemasok.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sku: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    purchase_qty: { type: Type.NUMBER },
                                },
                                required: ["sku", "name", "purchase_qty"]
                            }
                        },
                        recommendations: {
                            type: Type.ARRAY,
                            description: "Rekomendasi bisnis yang bisa dilakukan.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING, enum: ['marketing', 'inventory', 'purchasing', 'general'] },
                                    action: { type: Type.STRING },
                                },
                                required: ["category", "action"]
                            }
                        },
                    },
                    propertyOrdering: ["summary_analysis", "market_trend_analysis", "top_products", "inventory_alerts", "purchase_history_analysis", "top_purchased_products", "recommendations"]
                },
            },
        });

        // const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        //     },
        //     body: JSON.stringify({
        //         model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        //         messages: [{ 'role': 'user', 'content': prompt }],
        //         temperature: 0.3,
        //     }),
        // });

        const data = response.text;

        let parsedData: AnalysisResult;

        try {
            if (!data || typeof data !== 'string') {
                throw new Error('Invalid or empty AI response data');
            }

            const jsonString = data.replace(/```json/g, '').replace(/```/g, '').trim();

            if (!jsonString) {
                throw new Error('Empty JSON string after formatting');
            }

            parsedData = JSON.parse(jsonString);

            if (
                !parsedData.summary_analysis ||
                !Array.isArray(parsedData.top_products) ||
                !Array.isArray(parsedData.recommendations)
            ) {
                throw new Error('Invalid analysis data structure');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            throw new Error('Failed to parse AI analysis response');
        }

        return NextResponse.json({
            success: true,
            data: parsedData
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'AI analysis failed' }, { status: 500 });
    }
}
