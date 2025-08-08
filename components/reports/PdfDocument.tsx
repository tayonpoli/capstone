import { formatIDR } from '@/lib/formatCurrency'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 10,
    paddingBottom: 15,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  logo: {
    width: 120,
    height: 48,
    objectFit: 'contain'
  },
  companyInfo: {
    fontSize: 9,
    color: '#555555'
  },
  titleSection: {
    textAlign: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Helvetica'
  },
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: "#e5e5e5",
    padding: 10,
  },
  infoBox: {
    width: '30%'
  },
  infoLabel: {
    fontSize: 9,
    color: '#7F8C8D',
    marginBottom: 3
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  card: {
    width: '32%',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4
  },
  cardTitle: {
    fontSize: 10,
    color: '#7F8C8D',
    marginBottom: 5
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  table: {
    display: "flex",
    width: "100%",
    marginBottom: 20,
    overflow: 'hidden'
  },
  tableHeader: {
    backgroundColor: '#9e9e9e',
    flexDirection: "row"
  },
  tableColHeader: {
    padding: 8,
    textAlign: 'center'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  bodyText: {
    fontSize: 9,
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4'
  },
  tableCol: {
    padding: 8,
    fontSize: 9,
    color: '#34495E'
  },
  statusBadge: {
    padding: 3,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
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
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 10,
    color: '#95A5A6'
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
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return { backgroundColor: '#D5F5E3', color: '#27AE60' };
    case 'Approved':
      return { backgroundColor: '#D6EAF8', color: '#2980B9' };
    case 'Draft':
      return { backgroundColor: '#FDEBD0', color: '#E67E22' };
    case 'Cancelled':
      return { backgroundColor: '#FADBD8', color: '#E74C3C' };
    case 'Paid':
      return { backgroundColor: '#D5F5E3', color: '#27AE60' };
    case 'Unpaid':
      return { backgroundColor: '#FADBD8', color: '#E74C3C' };
    default:
      return { backgroundColor: '#EAECEE', color: '#7F8C8D' };
  }
};

export const PdfDocument = ({
  data,
  reportType,
  dateRange,
  companyInfo = {},
  summaryData = {}
}: {
  data: any[],
  reportType: string,
  dateRange?: { from?: Date | null, to?: Date | null },
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  },
  summaryData?: {
    totalAmount?: number;
    totalOrders?: number;
    account?: number;
    paidOrders?: number;
    unpaidOrders?: number;
  }
}) => {
  const colWidths = {
    date: '12%',
    reference: '10%',
    customer: '18%',
    type: '15%',
    payment: '15%',
    status: '15%',
    amount: '15%',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with company info */}
        <View style={styles.header}>
          <View style={styles.companyHeader}>
            <Image
              src={'/logo.png'}
              style={styles.logo}
            />
            <View style={styles.titleSection}>
              <Text style={styles.title}>
                {reportType === 'sales' ? 'Laporan Penjualan' : reportType === 'purchasing' ? 'Laporan Pembelian' : 'Laporan Pengeluaran'}
              </Text>
              <Text style={styles.companyInfo}>
                {dateRange?.from?.toLocaleDateString() || 'N/A'} -{' '}
                {dateRange?.to?.toLocaleDateString() || 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.companyInfo}>
            <Text>{companyInfo.name || 'Your Company Name'}</Text>
            <Text>{companyInfo.address || 'Company Address'}</Text>
            <Text>{companyInfo.phone || '(+123) 456-7890'}</Text>
            <Text>{companyInfo.email || 'info@company.com'}</Text>
          </View>
        </View>

        {/* Report info */}
        <View style={styles.reportInfo}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Dicetak</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Periode</Text>
            <Text style={styles.infoValue}>
              {dateRange?.from?.toLocaleDateString() || 'N/A'} -{' '}
              {dateRange?.to?.toLocaleDateString() || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Total Transaksi</Text>
            <Text style={styles.infoValue}>{data.length}</Text>
          </View>
        </View>

        <Text style={styles.title}>
          Ringkasan
        </Text>

        <View style={styles.reportInfo}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Total {reportType === 'sales' ? 'Penjualan' : reportType === 'purchasing' ? 'Pembelian' : 'Pengeluaran'}</Text>
            <Text style={styles.cardValue}>{formatIDR(summaryData.totalAmount || 0)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Total {reportType === 'sales' ? 'Piutang' : 'Hutang'}</Text>
            <Text style={styles.cardValue}>{formatIDR(summaryData.account || 0)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Total Transaksi</Text>
            <Text style={styles.cardValue}>{summaryData.totalOrders || 0} {reportType === 'sales' ? 'pesanan' : reportType === 'purchasing' ? 'pembelian' : 'transaksi'}</Text>
          </View>
        </View>

        {/* Transactions table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableColHeader, { width: colWidths.date }]}>
              <Text style={styles.headerText}>Tanggal</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.reference }]}>
              <Text style={styles.headerText}>ID</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.customer }]}>
              <Text style={styles.headerText}>
                {reportType === 'sales' ? 'Customer' : reportType === 'purchasing' ? 'Supplier' : 'Vendor'}
              </Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.type }]}>
              <Text style={styles.headerText}>{reportType === 'sales' ? 'Tipe Pesanan' : reportType === 'purchasing' ? 'Tag' : 'Kategori'}</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.payment }]}>
              <Text style={styles.headerText}>Metode Pembayaran</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.status }]}>
              <Text style={styles.headerText}>Status</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.amount }]}>
              <Text style={styles.headerText}>Nilai Pesanan</Text>
            </View>
          </View>

          {/* Table Rows */}
          {data.map((item, index) => {
            const statusStyle = getStatusColor(item.status);
            const paymentStyle = getStatusColor(item.paymentStatus);

            return (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: colWidths.date }]}>
                  <Text style={styles.bodyText}>
                    {new Date(item.orderDate || item.purchaseDate || item.expenseDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.reference }]}>
                  <Text style={styles.bodyText}>
                    {item.id.substring(0, 4).toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.customer }]}>
                  <Text style={styles.bodyText}>
                    {reportType === 'sales'
                      ? item.customerName || item.customer?.name || 'N/A'
                      : item.supplier?.name || 'N/A'}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.type }]}>
                  <Text style={styles.bodyText}>
                    {reportType === 'expenses'
                      ? item.category
                      : item.tag}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.payment }]}>
                  <Text style={styles.bodyText}>
                    {reportType === 'sales'
                      ? item.SalesInvoice?.[0]?.paymentMethod || 'N/A'
                      : reportType === 'purchasing'
                        ? item.Invoice?.[0]?.paymentMethod || 'N/A'
                        : item.ExpenseInvoice?.[0]?.paymentMethod || 'N/A'}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.status }]}>
                  <Text style={[styles.statusBadge, paymentStyle]}>
                    {item.paymentStatus}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.amount }]}>
                  <Text style={[styles.bodyText, { fontWeight: 'bold' }]}>
                    {formatIDR(item.total)}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Notes section */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Catatan Laporan</Text>
          <Text style={styles.notesText}>
            • Laporan ini memuat semua transaksi {reportType === 'sales' ? 'penjualan' : 'pembelian'} dalam periode tanggal yang ditentukan.
          </Text>
          <Text style={styles.notesText}>
            • Semua angka dalam IDR (Indonesian Rupiah).
          </Text>
          <Text style={styles.notesText}>
            • Untuk keperluan penghitungan, total angka dalam laporan ini akan dibulatkan jika perlu.
          </Text>
          <Text style={styles.notesText}>
            • Status Indikator: Paid (green), Unpaid (red).
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{companyInfo.name || 'Your Company Name'} • Confidential</Text>
        </View>
        <View style={styles.pageNumber}>
          <Text render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  )
}