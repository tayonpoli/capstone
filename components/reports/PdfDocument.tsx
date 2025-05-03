import { formatIDR } from '@/lib/formatCurrency'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  dateRange: {
    fontSize: 12,
    marginBottom: 20
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    flexDirection: "row"
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
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
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey'
  }
})

export const PdfDocument = ({ 
  data, 
  reportType, 
  dateRange 
}: {
  data: any[],
  reportType: string,
  dateRange?: { from?: Date | null, to?: Date | null } // Tambahkan optional chaining
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {reportType === 'sales' ? 'SALES REPORT' : 'PURCHASING REPORT'}
        </Text>
        {/* Tambahkan pengecekan null */}
        <Text style={styles.dateRange}>
          {dateRange?.from?.toLocaleDateString() || 'N/A'} -{' '}
          {dateRange?.to?.toLocaleDateString() || 'N/A'}
        </Text>
      </View>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Date</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>
              {reportType === 'sales' ? 'Customer' : 'Supplier'}
            </Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Amount</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Status</Text>
          </View>
        </View>

        {/* Table Rows */}
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>
                {new Date(item.orderDate || item.purchaseDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>
                {reportType === 'sales' ? item.customer?.name : item.supplier?.name}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>
                {formatIDR(item.total)}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
)