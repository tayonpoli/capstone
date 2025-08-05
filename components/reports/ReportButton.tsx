'use client'

import { PdfOrderTemplate } from './PdfOrderTemplate'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function ReportButton({
    order,
    type
}: {
    order: any
    type: 'sales' | 'purchase'
}) {
    return (
        <PDFDownloadLink
            document={<PdfOrderTemplate order={order} type={type} />}
            fileName={`${type}_report_${format(new Date(), 'yyyyMMdd')}.pdf`}
        >
            {({ loading }) => (
                <Button disabled={loading}>
                    {loading ? 'Preparing document...' : 'Download PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    )
}