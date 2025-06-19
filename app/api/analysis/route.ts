import { prisma } from '@/lib/prisma'; // pastikan prisma instance kamu tersedia
import { NextResponse } from 'next/server';

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
You are a professional business analyst. Based on this data, give analysis with this format:
- Summary of sales performance
- Products with highest sales
- Market trends analysis
- Business recommendation for decision making

Sales data (in JSON):
${JSON.stringify(formatted, null, 2)}
`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [{ 'role': 'user', 'content': prompt }],
                temperature: 0.3,
            }),
        });

        const data = await response.json();

        return NextResponse.json({ success: true, data: data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'AI analysis failed' }, { status: 500 });
    }
}
