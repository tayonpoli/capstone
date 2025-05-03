// components/report/ReportGenerator.tsx
"use client"

import { useState, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { format, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Download } from 'lucide-react'
import { toast } from 'sonner'
import { PdfDocument } from './PdfDocument'
import { PDFDownloadLink } from '@react-pdf/renderer'

export function ReportGenerator({ reportType }: { reportType: 'sales' | 'purchasing' }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [reportData, setReportData] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Reset report data ketika date range berubah
  useEffect(() => {
    setReportData([])
  }, [dateRange])

  const fetchReportData = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select date range')
      return
    }

    // Pastikan end date mencakup seluruh hari
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
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate report')

      setReportData(data)
      toast.success('Report data ready to download')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate report')
      setReportData([])
    } finally {
      setIsGenerating(false)
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
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {reportData.length > 0 ? (
        <PDFDownloadLink
          document={
            <PdfDocument
              data={reportData}
              reportType={reportType}
              dateRange={{ from: dateRange.from!, to: dateRange.to! }}
            />
          }
          fileName={`${reportType}_report_${format(new Date(), 'yyyyMMdd')}.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading}>
              {loading ? (
                'Preparing PDF...'
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          )}
        </PDFDownloadLink>
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
              Generate Report
            </>
          )}
        </Button>
      )}
    </div>
  )
}