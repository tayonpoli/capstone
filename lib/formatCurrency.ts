export function formatIDR(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return 'Rp 0'

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(amount)
}