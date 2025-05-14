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
        marginBottom: 20
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
        marginTop: 30,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        fontSize: 8,
        textAlign: 'center',
        color: 'grey'
    },
    totalSection: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    grandTotal: {
        fontWeight: 'bold',
        fontSize: 12
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
    const orderLabel = isSales ? 'Sales Order' : 'Purchase Order'

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        {/* Ganti dengan logo perusahaan jika ada */}
                        <Image src="/logo.png" style={styles.logo} />
                        <Text style={styles.title}>{orderLabel}</Text>
                        <Text style={styles.orderInfo}>Order #: {order.tag || order.id}</Text>
                        <Text style={styles.orderInfo}>Date: {new Date(orderDate).toLocaleDateString()}</Text>
                        {!isSales && (
                            <Text style={styles.orderInfo}>Due Date: {new Date(order.dueDate).toLocaleDateString()}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.orderInfo}>Status: {order.status}</Text>
                        <Text style={styles.orderInfo}>Created At: {new Date(order.createdAt).toLocaleDateString()}</Text>
                        {order.updatedAt && (
                            <Text style={styles.orderInfo}>Last Updated: {new Date(order.updatedAt).toLocaleDateString()}</Text>
                        )}
                    </View>
                </View>

                {/* Counterpart Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{counterpartLabel} Information</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>{counterpart?.name || 'N/A'}</Text>
                    </View>
                    {isSales && (
                        <>
                            <View style={styles.row}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{order.email || 'N/A'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Address:</Text>
                                <Text style={styles.value}>{order.address || 'N/A'}</Text>
                            </View>
                        </>
                    )}
                    {!isSales && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Contact:</Text>
                            <Text style={styles.value}>{order.contact || 'N/A'}</Text>
                        </View>
                    )}
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableRow}>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.headerText}>No.</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '40%' }]}>
                                <Text style={styles.headerText}>Product</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.headerText}>Qty</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.headerText}>Price</Text>
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
                                            Note: {item.note}
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

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.label}>Subtotal:</Text>
                        <Text style={styles.value}>{formatIDR(order.total)}</Text>
                    </View>
                    {/* Tambahkan tax, discount, atau biaya lainnya jika diperlukan */}
                    <View style={[styles.totalRow, { marginTop: 5 }]}>
                        <Text style={styles.grandTotal}>Grand Total:</Text>
                        <Text style={styles.grandTotal}>{formatIDR(order.total)}</Text>
                    </View>
                </View>

                {/* Memo */}
                {order.memo && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <Text style={styles.value}>{order.memo}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generated on {new Date().toLocaleDateString()}</Text>
                    <Text>Thank you for your business!</Text>
                </View>
            </Page>
        </Document>
    )
}