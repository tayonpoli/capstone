import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica'
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    content: {
        fontSize: 12,
        lineHeight: 1.5,
        marginBottom: 10
    },
    section: {
        marginBottom: 20
    },
    header: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#333'
    }
});

export const SalesAnalysisPDF = ({ content }: { content: string }) => {
    // Split content into sections if needed
    const sections = content.split('\n\n');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    <Text style={styles.title}>Sales Analysis Report</Text>
                    <Text style={styles.content}>Generated on: {new Date().toLocaleDateString()}</Text>

                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.content}>{section}</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};