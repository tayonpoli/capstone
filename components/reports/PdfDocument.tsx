import { formatIDR } from '@/lib/formatCurrency'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

// Register fonts (you'll need to provide these files)
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: '/fonts/OpenSans-Regular.ttf' },
    { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/OpenSans-Italic.ttf', fontStyle: 'italic' },
  ]
});

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Open Sans',
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4'
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: 'contain'
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#555555'
  },
  titleSection: {
    textAlign: 'center',
    marginVertical: 15
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    fontFamily: 'Roboto'
  },
  subtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5
  },
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 5
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
    color: '#2C3E50'
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  table: {
    display: "flex",
    width: "100%",
    marginBottom: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 5,
    overflow: 'hidden'
  },
  tableHeader: {
    backgroundColor: '#2C3E50',
    flexDirection: "row"
  },
  tableColHeader: {
    padding: 8,
    textAlign: 'center'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: 'white',
    fontFamily: 'Roboto'
  },
  bodyText: {
    fontSize: 9
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
    backgroundColor: '#F8F9FA'
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2C3E50'
  },
  notesText: {
    fontSize: 9,
    color: '#7F8C8D'
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
    logo?: string;
  },
  summaryData?: {
    totalAmount?: number;
    totalOrders?: number;
    averageOrder?: number;
    paidOrders?: number;
    unpaidOrders?: number;
  }
}) => {
  // Column widths
  const colWidths = {
    date: '12%',
    reference: '15%',
    customer: '23%',
    amount: '15%',
    status: '15%',
    payment: '15%',
    items: '10%'
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with company info */}
        <View style={styles.header}>
          <View style={styles.companyHeader}>
            {/* {companyInfo.logo && (
              <Image
                src={companyInfo.logo}
                style={styles.logo}
              />
            )} */}
            <View style={styles.companyInfo}>
              <Text>{companyInfo.name || 'Your Company Name'}</Text>
              <Text>{companyInfo.address || 'Company Address'}</Text>
              <Text>Phone: {companyInfo.phone || '(+123) 456-7890'}</Text>
              <Text>Email: {companyInfo.email || 'info@company.com'}</Text>
            </View>
          </View>
        </View>

        {/* Report title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {reportType === 'sales' ? 'SALES TRANSACTION REPORT' : 'PURCHASE ORDER REPORT'}
          </Text>
          <Text style={styles.subtitle}>
            {dateRange?.from?.toLocaleDateString() || 'N/A'} -{' '}
            {dateRange?.to?.toLocaleDateString() || 'N/A'}
          </Text>
        </View>

        {/* Report info */}
        <View style={styles.reportInfo}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Report Generated</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Period</Text>
            <Text style={styles.infoValue}>
              {dateRange?.from?.toLocaleDateString() || 'N/A'} -{' '}
              {dateRange?.to?.toLocaleDateString() || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Total Records</Text>
            <Text style={styles.infoValue}>{data.length}</Text>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.card, { borderLeftColor: '#2C3E50' }]}>
            <Text style={styles.cardTitle}>TOTAL {reportType === 'sales' ? 'SALES' : 'PURCHASES'}</Text>
            <Text style={styles.cardValue}>{formatIDR(summaryData.totalAmount || 0)}</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: '#27AE60' }]}>
            <Text style={styles.cardTitle}>TOTAL ORDERS</Text>
            <Text style={styles.cardValue}>{summaryData.totalOrders || 0}</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: '#2980B9' }]}>
            <Text style={styles.cardTitle}>AVG. ORDER VALUE</Text>
            <Text style={styles.cardValue}>{formatIDR(summaryData.averageOrder || 0)}</Text>
          </View>
        </View>

        {/* Transactions table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableColHeader, { width: colWidths.date }]}>
              <Text style={styles.headerText}>Date</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.reference }]}>
              <Text style={styles.headerText}>Order #</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.customer }]}>
              <Text style={styles.headerText}>
                {reportType === 'sales' ? 'Customer' : 'Supplier'}
              </Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.amount }]}>
              <Text style={styles.headerText}>Amount</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.status }]}>
              <Text style={styles.headerText}>Status</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.payment }]}>
              <Text style={styles.headerText}>Payment</Text>
            </View>
            <View style={[styles.tableColHeader, { width: colWidths.items }]}>
              <Text style={styles.headerText}>Items</Text>
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
                    {new Date(item.orderDate || item.purchaseDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.reference }]}>
                  <Text style={styles.bodyText}>
                    {item.id.substring(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.customer }]}>
                  <Text style={styles.bodyText}>
                    {reportType === 'sales'
                      ? item.customer?.name || 'N/A'
                      : item.supplier?.name || 'N/A'}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.amount }]}>
                  <Text style={[styles.bodyText, { fontWeight: 'bold' }]}>
                    {formatIDR(item.total)}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.status }]}>
                  <Text style={[styles.statusBadge, statusStyle]}>
                    {item.status}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.payment }]}>
                  <Text style={[styles.statusBadge, paymentStyle]}>
                    {item.paymentStatus}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: colWidths.items }]}>
                  <Text style={styles.bodyText}>
                    {item.items?.length || 0}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Notes section */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Report Notes</Text>
          <Text style={styles.notesText}>
            • This report includes all {reportType === 'sales' ? 'sales orders' : 'purchase orders'} within the specified date range.
          </Text>
          <Text style={styles.notesText}>
            • Amounts are shown in IDR (Indonesian Rupiah).
          </Text>
          <Text style={styles.notesText}>
            • Status indicators: Completed (green), Approved (blue), Draft (orange), Cancelled (red).
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
// import { formatIDR } from '@/lib/formatCurrency'
// import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'

// const styles = StyleSheet.create({
//   page: {
//     padding: 30,
//     fontFamily: 'Helvetica'
//   },
//   header: {
//     marginBottom: 20,
//     textAlign: 'center'
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10
//   },
//   dateRange: {
//     fontSize: 12,
//     marginBottom: 20
//   },
//   table: {
//     display: "flex",
//     width: "100%",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderRightWidth: 0,
//     borderBottomWidth: 0
//   },
//   tableRow: {
//     flexDirection: "row"
//   },
//   tableColHeader: {
//     width: "25%",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderLeftWidth: 0,
//     borderTopWidth: 0,
//     backgroundColor: '#f0f0f0',
//     padding: 5
//   },
//   tableCol: {
//     width: "25%",
//     borderStyle: "solid",
//     borderWidth: 1,
//     borderLeftWidth: 0,
//     borderTopWidth: 0,
//     padding: 5
//   },
//   headerText: {
//     fontWeight: 'bold',
//     fontSize: 10
//   },
//   bodyText: {
//     fontSize: 9
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 30,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     fontSize: 10,
//     color: 'grey'
//   }
// })

// export const PdfDocument = ({
//   data,
//   reportType,
//   dateRange
// }: {
//   data: any[],
//   reportType: string,
//   dateRange?: { from?: Date | null, to?: Date | null } // Tambahkan optional chaining
// }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <View style={styles.header}>
//         <Text style={styles.title}>
//           {reportType === 'sales' ? 'SALES REPORT' : 'PURCHASING REPORT'}
//         </Text>
//         {/* Tambahkan pengecekan null */}
//         <Text style={styles.dateRange}>
//           {dateRange?.from?.toLocaleDateString() || 'N/A'} -{' '}
//           {dateRange?.to?.toLocaleDateString() || 'N/A'}
//         </Text>
//       </View>

//       <View style={styles.table}>
//         {/* Table Header */}
//         <View style={styles.tableRow}>
//           <View style={styles.tableColHeader}>
//             <Text style={styles.headerText}>Date</Text>
//           </View>
//           <View style={styles.tableColHeader}>
//             <Text style={styles.headerText}>
//               {reportType === 'sales' ? 'Customer' : 'Supplier'}
//             </Text>
//           </View>
//           <View style={styles.tableColHeader}>
//             <Text style={styles.headerText}>Amount</Text>
//           </View>
//           <View style={styles.tableColHeader}>
//             <Text style={styles.headerText}>Status</Text>
//           </View>
//         </View>

//         {/* Table Rows */}
//         {data.map((item, index) => (
//           <View key={index} style={styles.tableRow}>
//             <View style={styles.tableCol}>
//               <Text style={styles.bodyText}>
//                 {new Date(item.orderDate || item.purchaseDate).toLocaleDateString()}
//               </Text>
//             </View>
//             <View style={styles.tableCol}>
//               <Text style={styles.bodyText}>
//                 {reportType === 'sales' ? item.customer?.name : item.supplier?.name}
//               </Text>
//             </View>
//             <View style={styles.tableCol}>
//               <Text style={styles.bodyText}>
//                 {formatIDR(item.total)}
//               </Text>
//             </View>
//             <View style={styles.tableCol}>
//               <Text style={styles.bodyText}>
//                 {item.status}
//               </Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <Text>Generated on {new Date().toLocaleDateString()}</Text>
//       </View>
//     </Page>
//   </Document>
// )