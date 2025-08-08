import { AnalysisResult } from '@/types/analysis';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    logo: {
        width: 120,
        height: 48,
        objectFit: 'contain'
    },
    title: {
        fontSize: 24,
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'right',
        color: '#64748b',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 12,
        lineHeight: 1.5,
        textAlign: 'justify',
    },
    productList: {
        marginLeft: 4,
    },
    productItem: {
        marginBottom: 5,
        fontSize: 12,
    },
    recommendation: {
        backgroundColor: '#f1f5f9',
        padding: 12,
        borderRadius: 5,
        marginBottom: 8,
    },
    recommendationCategory: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    inventoryAlert: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'bold',
        marginBottom: 3,
    },
    productName: {
        fontSize: 12,
    },
    status: {
        width: 'auto',
        textAlign: 'center',
        fontSize: 6,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000000',
        padding: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: '#64748b',
    },
});

export const SalesAnalysisPDF = ({ content }: { content: AnalysisResult }) => (
    <Document>
        <Page style={styles.page}>
            <View style={styles.header}>
                <Image
                    src={'/logo.png'}
                    style={styles.logo}
                />
                <View>
                    <Text style={styles.title}>Analysis Report</Text>
                    <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary Analysis</Text>
                <Text style={styles.sectionContent}>{content.summary_analysis}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Purchase Analysis</Text>
                <Text style={styles.sectionContent}>{content.purchase_history_analysis}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                <View style={{ width: '50%', paddingRight: 10 }}>
                    <Text style={styles.sectionTitle}>Top Products Sold</Text>
                    <View style={styles.productList}>
                        {content.top_products.map((product, index) => (
                            <Text key={index} style={styles.productItem}>
                                {product.name}: {product.sales_qty} unit
                            </Text>
                        ))}
                    </View>
                </View>

                <View style={{ width: '50%', paddingLeft: 10 }}>
                    <Text style={styles.sectionTitle}>Top Purchased Materials</Text>
                    <View style={styles.productList}>
                        {content.top_purchased_products.map((product, index) => (
                            <Text key={index} style={styles.productItem}>
                                {product.name}: {product.purchase_qty} unit
                            </Text>
                        ))}
                    </View>
                </View>
            </View>

            {content.inventory_alerts && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory Level</Text>
                    {content.inventory_alerts.map((product, index) => (
                        <View key={index} style={styles.recommendation}>
                            <View style={styles.inventoryAlert}>
                                <Text style={styles.productName}>
                                    {product.name}
                                </Text>
                                <Text style={styles.status}>
                                    {product.status}
                                </Text>
                            </View>
                            <Text style={styles.sectionContent}>
                                {product.name} current stock only at {Math.floor(product.current_stock)} unit with limit set to {product.minimum_limit} unit.
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Market Trend Forecast</Text>
                <Text style={styles.sectionContent}>{content.market_trend_analysis}</Text>
            </View>

            {content.recommendations && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reccomendations</Text>
                    {content.recommendations.map((rec, index) => (
                        <View key={index} style={styles.recommendation}>
                            <Text style={styles.recommendationCategory}>
                                {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                            </Text>
                            <Text style={styles.sectionContent}>{rec.action}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.footer}>
                <Text>Generated by MauManage</Text>
            </View>
        </Page>
    </Document>
);