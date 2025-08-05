import { formatIDR } from '@/lib/formatCurrency'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 20
    },
    logo: {
        width: 100,
        height: 50,
        marginBottom: 10
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5
    },
    orderInfo: {
        fontSize: 12,
        marginBottom: 3
    },
    companyInfo: {
        textAlign: 'right',
        fontSize: 12,
        marginBottom: 3
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        padding: 5
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    label: {
        fontWeight: 'bold',
        fontSize: 10
    },
    value: {
        fontSize: 10
    },
    table: {
        display: 'flex',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 12
    },
    tableRow: {
        flexDirection: 'row'
    },
    tableColHeader: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f0f0f0',
        padding: 5
    },
    tableCol: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5
    },
    tableColDesc: {
        width: '40%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 10
    },
    bodyText: {
        fontSize: 9
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#95A5A6',
        paddingHorizontal: 40
    },
    totalSection: {
        marginTop: 10,
        padding: 10,
        width: 200, // Lebar fixed 72
        marginLeft: 'auto', // Posisikan ke kanan
        display: 'flex',
        flexDirection: 'column',
    },
    totalRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between', // Jarak antara label dan value
        marginBottom: 5,
        width: '100%', // Gunakan full width dari parent
    },
    grandTotal: {
        fontWeight: 'bold',
        fontSize: 12
    },
    notesSection: {
        marginTop: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E4E4E4',
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
    },
    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    notesText: {
        fontSize: 9,
        color: '#7F8C8D',
        marginBottom: 4,
    }
})

export const PdfOrderTemplate = ({
    order,
    type
}: {
    order: any,
    type: 'sales' | 'purchase'
}) => {
    const isSales = type === 'sales'
    const items = isSales ? order.items : order.items
    const counterpart = isSales ? order.customer : order.supplier
    const counterpartLabel = isSales ? 'Customer' : 'Supplier'
    const orderDate = isSales ? order.orderDate : order.purchaseDate
    const orderLabel = isSales ? 'INVOICE' : 'Purchase Order'
    const tax = order.total * 0.1
    const total = order.total + tax

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        {/* Ganti dengan logo perusahaan jika ada */}
                        {/* <Image
                            src="/logo.png"
                            style={styles.logo}
                        /> */}
                        <Text style={styles.title}>{orderLabel}</Text>
                        {!isSales && (
                            <Text style={styles.orderInfo}>#PO-{order.id.slice(0, 8).toUpperCase()}</Text>
                        ) || (
                                <Text style={styles.orderInfo}>#INV-{order.id.slice(0, 8).toUpperCase()}</Text>
                            )}
                        <Text style={styles.orderInfo}>Tanggal: {new Date(orderDate).toLocaleDateString()}</Text>
                        {!isSales && (
                            <Text style={styles.orderInfo}>Jatuh Tempo: {new Date(order.dueDate).toLocaleDateString()}</Text>
                        )}
                        <Text style={styles.orderInfo}>Status: {order.paymentStatus}</Text>
                    </View>
                    <View>
                        <Text style={styles.companyInfo}>Mau Ngopi</Text>
                        <Text style={styles.companyInfo}>Bekasi, Jawa Barat, Indonesia</Text>
                        <Text style={styles.companyInfo}>6281234567891</Text>
                        <Text style={styles.companyInfo}>maungopiofficial@gmail.com</Text>
                    </View>
                </View>

                {/* Counterpart Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informasi {counterpartLabel}</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nama:</Text>
                        <Text style={styles.value}>{counterpart?.name || 'N/A'}</Text>
                    </View>
                    {isSales && (
                        <>
                            <View style={styles.row}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{order.email || 'N/A'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Alamat:</Text>
                                <Text style={styles.value}>{order.address || 'N/A'}</Text>
                            </View>
                        </>
                    )}
                    {!isSales && (
                        <>
                            <View style={styles.row}>
                                <Text style={styles.label}>Kontak:</Text>
                                <Text style={styles.value}>{order.contact || 'N/A'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{counterpart?.email || 'N/A'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Alamat:</Text>
                                <Text style={styles.value}>{counterpart?.address || 'N/A'}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Item Pesanan</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableRow}>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.headerText}>No.</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '40%' }]}>
                                <Text style={styles.headerText}>Produk</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.headerText}>Kuantitas</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.headerText}>Harga</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.headerText}>Total</Text>
                            </View>
                        </View>

                        {/* Table Rows */}
                        {items.map((item: any, index: number) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.tableCol}>
                                    <Text style={styles.bodyText}>{index + 1}</Text>
                                </View>
                                <View style={[styles.tableCol, { width: '40%' }]}>
                                    <Text style={styles.bodyText}>{item.product.product}</Text>
                                    {item.note && (
                                        <Text style={[styles.bodyText, { fontSize: 8, color: 'grey' }]}>
                                            {item.note}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.bodyText}>{item.quantity}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.bodyText}>{formatIDR(item.price)}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.bodyText}>{formatIDR(item.total)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {order.memo && (
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Memo</Text>
                        <Text style={styles.notesText}>
                            {order.memo}
                        </Text>
                    </View>
                )}

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.label}>Subtotal:</Text>
                        <Text style={styles.value}>{formatIDR(order.total)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.label}>PPN (10%):</Text>
                        <Text style={styles.value}>{formatIDR(tax)}</Text>
                    </View>
                    <View style={[styles.totalRow, { marginTop: 5 }]}>
                        <Text style={styles.grandTotal}>Total:</Text>
                        <Text style={styles.grandTotal}>{formatIDR(total)}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>Generated on {new Date().toLocaleDateString()}</Text>
                    <Text>Thank you for your business!</Text>
                </View>
            </Page>
        </Document>
    )
}