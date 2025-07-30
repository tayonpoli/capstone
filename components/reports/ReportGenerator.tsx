"use client"

import { useState, useEffect } from 'react'
import { DateRange, SelectRangeEventHandler } from 'react-day-picker'
import { format, formatDate, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarIcon, Download, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { PdfDocument } from './PdfDocument'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useTranslations } from 'next-intl'
import * as XLSX from 'xlsx'

export function ReportGenerator({ reportType }: { reportType: 'sales' | 'purchasing' }) {
  const t = useTranslations('sales')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [reportData, setReportData] = useState<any[]>([])
  const [summaryData, setSummaryData] = useState<any>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<any>(null)

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) throw new Error('Failed to fetch company info')
        const data = await response.json()
        setCompanyInfo(data)
      } catch (error) {
        toast.error('Failed to load company information')
        console.error(error)
      }
    }

    fetchCompanyInfo()
  }, [])

  // Reset report data when date range changes
  useEffect(() => {
    setReportData([])
    setSummaryData({})
  }, [dateRange])

  const fetchReportData = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select date range')
      return
    }

    // Ensure end date covers the entire day
    const adjustedEndDate = new Date(dateRange.to)
    adjustedEndDate.setHours(23, 59, 59, 999)

    setIsGenerating(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          startDate: dateRange.from.toISOString(),
          endDate: adjustedEndDate.toISOString(),
          includeSummary: true
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate report')

      setReportData(data.records || [])
      setSummaryData(data.summary || {})
      toast.success('Report data ready to download')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate report')
      setReportData([])
      setSummaryData({})
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToExcel = (format: 'xlsx') => {
    if (reportData.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      // Prepare worksheet data
      const worksheetData = reportData.map((item) => {
        if (reportType === 'sales') {
          return {
            'Order ID': item.id.slice(0, 8).toUpperCase(),
            'Tanggal': formatDate(new Date(item.orderDate), 'yyyy-MM-dd'),
            'Customer': item.customerName || item.customer?.name || 'N/A',
            'Tipe Pesanan': item.tag || 'N/A',
            'Metode Pembayaran': item.SalesInvoice?.[0]?.paymentMethod || 'N/A',
            'Status': item.paymentStatus,
            'Jumlah Item': item.items.length,
            'Total': item.total,
          }
        } else {
          return {
            'Order ID': item.id.slice(0, 8).toUpperCase(),
            'Tanggal': formatDate(new Date(item.purchaseDate), 'yyyy-MM-dd'),
            'Supplier': item.supplier?.name || 'N/A',
            'Metode Pembayaran': item.Invoice?.[0]?.paymentMethod || 'N/A',
            'Status': item.paymentStatus,
            'Jumlah Item': item.items.length,
            'Total': item.total,
          }
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

      const fileName = `${reportType}_report_${formatDate(dateRange.from!, 'yyyyMMdd')}_to_${formatDate(dateRange.to!, 'yyyyMMdd')}`
      XLSX.writeFile(workbook, `${fileName}.xlsx`)

      toast.success(`Report exported to ${format.toUpperCase()}`)
    } catch (error) {
      toast.error(`Failed to export to ${format.toUpperCase()}`)
      console.error(error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className="w-[300px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange as SelectRangeEventHandler}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {reportData.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <PDFDownloadLink
              document={
                <PdfDocument
                  data={reportData}
                  reportType={reportType}
                  dateRange={{ from: dateRange.from!, to: dateRange.to! }}
                  companyInfo={companyInfo}
                  summaryData={{
                    totalAmount: summaryData.totalAmount || 0,
                    totalOrders: summaryData.totalOrders || 0,
                    account: summaryData.account || 0,
                    paidOrders: summaryData.paidOrders || 0,
                    unpaidOrders: summaryData.unpaidOrders || 0
                  }}
                />
              }
              fileName={`${reportType}_report_${format(dateRange.from!, 'yyyyMMdd')}_to_${format(dateRange.to!, 'yyyyMMdd')}.pdf`}
            >
              {({ loading }) => (
                <DropdownMenuItem disabled={loading} onSelect={(e) => e.preventDefault()}>
                  {loading ? 'Preparing PDF...' : 'Export as PDF'}
                </DropdownMenuItem>
              )}
            </PDFDownloadLink>
            <DropdownMenuItem onSelect={() => exportToExcel('xlsx')}>
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={fetchReportData}
          disabled={isGenerating || !dateRange?.from || !dateRange?.to}
        >
          {isGenerating ? (
            'Generating...'
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t('generate')}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
// "use client"

// import { useState, useEffect } from 'react'
// import { DateRange, SelectRangeEventHandler } from 'react-day-picker'
// import { format, subDays } from 'date-fns'
// import { Button } from '@/components/ui/button'
// import { Calendar } from '@/components/ui/calendar'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import { CalendarIcon, Download } from 'lucide-react'
// import { toast } from 'sonner'
// import { PdfDocument } from './PdfDocument'
// import { PDFDownloadLink } from '@react-pdf/renderer'
// import { useTranslations } from 'next-intl'

// export function ReportGenerator({ reportType }: { reportType: 'sales' | 'purchasing' }) {
//   const t = useTranslations('sales')
//   const [dateRange, setDateRange] = useState<DateRange>({
//     from: subDays(new Date(), 30),
//     to: new Date(),
//   })
//   const [reportData, setReportData] = useState<any[]>([])
//   const [summaryData, setSummaryData] = useState<any>({})
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [companyInfo, setCompanyInfo] = useState<any>(null)

//   useEffect(() => {
//     const fetchCompanyInfo = async () => {
//       try {
//         const response = await fetch('/api/profile')
//         if (!response.ok) throw new Error('Failed to fetch company info')
//         const data = await response.json()
//         setCompanyInfo(data)
//       } catch (error) {
//         toast.error('Failed to load company information')
//         console.error(error)
//       }
//     }

//     fetchCompanyInfo()
//   }, [])


//   // Reset report data when date range changes
//   useEffect(() => {
//     setReportData([])
//     setSummaryData({})
//   }, [dateRange])

//   const fetchReportData = async () => {
//     if (!dateRange?.from || !dateRange?.to) {
//       toast.error('Please select date range')
//       return
//     }

//     // Ensure end date covers the entire day
//     const adjustedEndDate = new Date(dateRange.to)
//     adjustedEndDate.setHours(23, 59, 59, 999)

//     setIsGenerating(true)
//     try {
//       const response = await fetch('/api/reports', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           reportType,
//           startDate: dateRange.from.toISOString(),
//           endDate: adjustedEndDate.toISOString(),
//           includeSummary: true // Request summary data from the API
//         }),
//       })

//       const data = await response.json()
//       if (!response.ok) throw new Error(data.error || 'Failed to generate report')

//       setReportData(data.records || [])
//       setSummaryData(data.summary || {})
//       toast.success('Report data ready to download')
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to generate report')
//       setReportData([])
//       setSummaryData({})
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   return (
//     <div className="flex items-center gap-2">
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button
//             id="date"
//             variant="outline"
//             className="w-[300px] justify-start text-left font-normal"
//           >
//             <CalendarIcon className="mr-2 h-4 w-4" />
//             {dateRange?.from ? (
//               dateRange.to ? (
//                 <>
//                   {format(dateRange.from, 'LLL dd, y')} -{' '}
//                   {format(dateRange.to, 'LLL dd, y')}
//                 </>
//               ) : (
//                 format(dateRange.from, 'LLL dd, y')
//               )
//             ) : (
//               <span>Pick a date range</span>
//             )}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar
//             initialFocus
//             mode="range"
//             defaultMonth={dateRange?.from}
//             selected={dateRange}
//             onSelect={setDateRange as SelectRangeEventHandler}
//             numberOfMonths={2}
//           />
//         </PopoverContent>
//       </Popover>

//       {reportData.length > 0 ? (
//         <PDFDownloadLink
//           document={
//             <PdfDocument
//               data={reportData}
//               reportType={reportType}
//               dateRange={{ from: dateRange.from!, to: dateRange.to! }}
//               companyInfo={companyInfo}
//               summaryData={{
//                 totalAmount: summaryData.totalAmount || 0,
//                 totalOrders: summaryData.totalOrders || 0,
//                 account: summaryData.account || 0,
//                 paidOrders: summaryData.paidOrders || 0,
//                 unpaidOrders: summaryData.unpaidOrders || 0
//               }}
//             />
//           }
//           fileName={`${reportType}_report_${format(dateRange.from!, 'yyyyMMdd')}_to_${format(dateRange.to!, 'yyyyMMdd')}.pdf`}
//         >
//           {({ loading }) => (
//             <Button disabled={loading}>
//               {loading ? (
//                 'Preparing PDF...'
//               ) : (
//                 <>
//                   <Download className="mr-2 h-4 w-4" />
//                   Download PDF
//                 </>
//               )}
//             </Button>
//           )}
//         </PDFDownloadLink>
//       ) : (
//         <Button
//           onClick={fetchReportData}
//           disabled={isGenerating || !dateRange?.from || !dateRange?.to}
//         >
//           {isGenerating ? (
//             'Generating...'
//           ) : (
//             <>
//               <Download className="mr-2 h-4 w-4" />
//               {t('generate')}
//             </>
//           )}
//         </Button>
//       )}
//     </div>
//   )
// }