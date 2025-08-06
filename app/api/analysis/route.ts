import { prisma } from '@/lib/prisma'; // pastikan prisma instance kamu tersedia
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

export async function POST() {
    try {
        const oneMonth = new Date();
        oneMonth.setDate(oneMonth.getDate() - 30);

        // Ambil semua sales order dan items-nya
        const orders = await prisma.salesOrder.findMany({
            where: {
                orderDate: {
                    gte: oneMonth
                }
            },
            include: {
                items: {
                    include: {
                        product: true, // untuk akses nama produk, dsb
                    },
                },
            },
        });

        // Ambil semua purchase order dan items-nya
        const purchases = await prisma.purchaseOrder.findMany({
            where: {
                purchaseDate: { // Asumsi field tanggal pembelian adalah 'purchaseDate'
                    gte: oneMonth
                }
            },
            include: {
                items: {
                    include: {
                        product: true, // untuk akses nama produk, dsb
                    },
                },
                supplier: true, // untuk akses detail supplier
            },
        });

        // Ambil data inventaris
        // Asumsi ada model 'Product' dengan field 'stock' dan 'minLimit'
        const inventory = await prisma.inventory.findMany({
            select: {
                id: true,
                product: true, // Nama produk
                code: true,
                stock: true,
                limit: true, // Batas stok minimum
                category: true,
            }
        });

        // Format data penjualan
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

        // Format data pembelian
        const formattedPurchases = purchases.map((purchase) => ({
            id: purchase.id,
            purchaseDate: purchase.purchaseDate.toISOString(),
            supplierName: purchase.supplier.name, // Asumsi ada field 'name' di model Supplier
            total: purchase.total,
            items: purchase.items.map((item) => ({
                productName: item.product.product,
                sku: item.product.code,
                quantity: item.quantity,
                price: item.price,
                itemTotal: item.total,
            })),
        }));

        // Format data inventaris
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
3.  **top_products**: 5 produk terlaris berdasarkan kuantitas penjualan.
4.  **slow_moving_products**: 5 produk yang paling lambat terjual.
5.  **inventory_alerts**: Produk yang stoknya di bawah batas minimum.
6.  **purchase_history_analysis**: Analisis histori pembelian, tren, dan pemasok utama.
7.  **top_purchased_products**: 5 produk yang paling sering dibeli dari pemasok.
8.  **recommendations**: Rekomendasi konkret untuk setiap kategori: 'marketing', 'inventory', 'pricing', 'operations', 'purchasing'.

Data untuk dianalisis:
Data Penjualan (JSON):
${JSON.stringify(formattedSales, null, 2)}

Data Inventaris (JSON):
${JSON.stringify(formattedInventory, null, 2)}

Data Pembelian (JSON):
${JSON.stringify(formattedPurchases, null, 2)}
`;

        const ai = new GoogleGenAI({});

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                systemInstruction: "Kamu adalah agen profesional analis bisnis yang ahli dalam data penjualan, inventaris, dan pembelian.",
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
                            description: "Daftar 5 produk terlaris berdasarkan kuantitas penjualan.",
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
                        slow_moving_products: {
                            type: Type.ARRAY,
                            description: "Daftar 5 produk yang paling lambat terjual.",
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
                            description: "Daftar produk yang stoknya di bawah batas minimum.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sku: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    current_stock: { type: Type.NUMBER },
                                    minimum_limit: { type: Type.NUMBER },
                                    status: { type: Type.STRING, description: "Contoh: 'Stok Kritis' atau 'Perlu Segera Restock'" },
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
                            description: "Daftar 5 produk yang paling sering dibeli/dipesan dari pemasok.",
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
                    propertyOrdering: ["summary_analysis", "market_trend_analysis", "top_products", "slow_moving_products", "inventory_alerts", "purchase_history_analysis", "top_purchased_products", "recommendations"]
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
        console.log(response.text)

        return NextResponse.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'AI analysis failed' }, { status: 500 });
    }
}
