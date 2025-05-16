
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, format } from 'date-fns'

export async function GET() {
    try {
        const startDate = subDays(new Date(), 7);

        // 1. Ambil semua data penjualan tanpa grouping
        const allSales = await prisma.salesOrder.findMany({
            where: {
                orderDate: {
                    gte: startDate,
                    lte: new Date()
                },
                status: 'Completed'
            },
            select: {
                orderDate: true,
                total: true
            }
        });

        // 2. Definisikan tipe untuk accumulator
        const groupedSales = allSales.reduce((acc: Record<string, number>, sale) => {
            // Normalisasi tanggal ke format YYYY-MM-DD (abaikan waktu)
            const saleDate = format(new Date(sale.orderDate), 'yyyy-MM-dd');

            if (!acc[saleDate]) {
                acc[saleDate] = 0;
            }
            acc[saleDate] += sale.total || 0;

            return acc;
        }, {}); // Inisialisasi dengan objek kosong

        // 3. Format data untuk chart
        const formattedData = Object.entries(groupedSales).map(([date, sales]) => ({
            date,
            sales
        }));

        // 4. Pastikan semua hari dalam 7 hari terakhir ada
        const allDays = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                date: format(date, 'yyyy-MM-dd'),
                sales: 0
            };
        });

        const completeData = allDays.map(day => {
            const existing = formattedData.find(d => d.date === day.date);
            return existing || day;
        });

        console.log('Raw sales data:', groupedSales)
        return NextResponse.json(completeData);

    } catch (error) {
        console.error('Error fetching sales data:', error);
        return NextResponse.json(
            { error: "Failed to fetch sales data" },
            { status: 500 }
        );
    }
}