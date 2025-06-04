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
Kamu adalah analis data penjualan. Berdasarkan data berikut, berikan analisis **dalam bentuk paragraf biasa tanpa format markdown atau simbol**:
- Ringkasan performa penjualan
- 3 produk dengan penjualan tertinggi
- Analisis tren penjualan (jika ada)
- 3 rekomendasi bisnis

Data Penjualan (dalam JSON):
${JSON.stringify(formatted, null, 2)}
`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [{ role: 'user', content: prompt }],
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
