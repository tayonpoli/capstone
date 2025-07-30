import { prisma } from '@/lib/prisma'; // pastikan prisma instance kamu tersedia
import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

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

        // Format data menjadi string agar bisa dianalisis AI
        const formatted = orders.map((order) => ({
            id: order.id,
            orderDate: order.orderDate.toISOString(),
            customerId: order.customerId,
            total: order.total,
            items: order.items.map((item) => ({
                product: item.product.product,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
            })),
        }));

        const prompt = `
Berdasarkan data dari sales 30 hari belakangan ini, 
berikan analisis bisnis yang mengandung ringkasan dari performa bisnis saat ini. 
lalu berikan juga market trend analysis termasuk perkiraan penjualan untuk selanjutnya. 
dan terakhir berikan rekomendasi bisnis yang bisa dilakukan untuk kedepannya.

Data penjualan (in JSON):
${JSON.stringify(formatted, null, 2)}
`;

        const ai = new GoogleGenAI({});

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "Kamu adalah agen profesional bisnis analis.",
                thinkingConfig: {
                    thinkingBudget: 0,
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

        return NextResponse.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'AI analysis failed' }, { status: 500 });
    }
}
