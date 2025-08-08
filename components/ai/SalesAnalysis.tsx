'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { CalendarIcon, Download, Loader2, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SalesAnalysisPDF } from './SalesAnalysisPDF';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AnalysisResult } from '@/types/analysis';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { DateRange } from 'react-day-picker';
import { Badge } from '../ui/badge';
import { useTranslations } from 'next-intl';

export default function SalesAnalysis() {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false); // Loading state khusus untuk analisis
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false); // Untuk toggle antara form dan hasil
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });

    const t = useTranslations('ai');

    const contentRef = useRef<HTMLDivElement>(null);

    const analyzeSales = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast.error('Please select a date range');
            return;
        }

        setAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: dateRange.from,
                    endDate: dateRange.to,
                    language: t('prompt.language')
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            setResult(data.data);
            setShowAnalysis(true);
            toast.success('Analysis completed successfully');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            toast.error('Analysis failed', {
                description: errorMessage,
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setShowAnalysis(false);
            setDateRange({
                from: new Date(new Date().setDate(new Date().getDate() - 30)),
                to: new Date(),
            });
        }
        setOpen(open);
    };

    return (
        <div className="py-2">
            <Button
                className="bg-gradient-to-r from-sky-500 to-indigo-900 hover:opacity-90 transition-opacity"
                onClick={() => setOpen(true)}
                disabled={loading}
            >
                <Sparkles className="h-4 w-4" />
                {t('button')}
            </Button>

            <Dialog open={open} onOpenChange={(open) => {
                if (!open) {
                    setShowAnalysis(false);
                    setAnalyzing(false);
                }
                setOpen(open);
            }}>
                <DialogContent className={cn(
                    "overflow-hidden p-0 flex flex-col md:max-h-[70vh]",
                    showAnalysis ? "md:max-w-[700px] lg:max-w-[800px]" : "md:max-w-[480px]",
                    analyzing && "md:max-w-[500px]"
                )}>
                    <DialogHeader className='m-0'>
                        <DialogTitle className="flex items-center gap-2 pt-4 pl-4">
                            <Sparkles className="text-primary" />
                            {showAnalysis ? t('result.title') : analyzing ? t('loading.title') : t('datePick.title')}
                        </DialogTitle>
                        {!showAnalysis && !analyzing && (
                            <DialogDescription className="pl-4">
                                {t('datePick.subTitle')}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <ScrollArea ref={contentRef} className="max-h-[50vh] overflow-y-auto border-t flex-1 py-2 px-4">
                        {showAnalysis ? (
                            result ? (
                                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {t('result.card1')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {result.summary_analysis}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {t('result.card2')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {result.purchase_history_analysis}
                                        </CardContent>
                                    </Card>

                                    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    {t('result.card3.title')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {result.top_products.map((product) => (
                                                        <div key={product.sku}>
                                                            <div className="font-medium">{product.name}</div>
                                                            <CardDescription>
                                                                {t('result.card3.desc')}{product.sales_qty} unit
                                                            </CardDescription>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    {t('result.card4.title')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {result.top_purchased_products.map((product) => (
                                                        <div key={product.sku}>
                                                            <div className="font-medium">{product.name}</div>
                                                            <CardDescription>
                                                                {t('result.card4.desc')}{product.purchase_qty} unit
                                                            </CardDescription>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {result.inventory_alerts && (
                                            <Card className='col-span-2'>
                                                <CardHeader>
                                                    <CardTitle>
                                                        {t('result.card5.title')}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {result.inventory_alerts.map((product) => (
                                                            <div key={product.sku} className="py-3 px-4 bg-muted/75 rounded-lg">
                                                                <div className="font-medium flex justify-between">
                                                                    {product.name}
                                                                    {product.status === "Stok Habis" ? (
                                                                        <Badge variant="destructive">
                                                                            {t('prompt.out')}
                                                                        </Badge>
                                                                    ) : product.status === "Perlu Segera Restock" ? (
                                                                        <Badge variant="outline">
                                                                            {t('prompt.restock')}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge>
                                                                            {t('prompt.limit')}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <CardDescription>
                                                                    {product.name} {t('result.card5.desc1')} {Math.floor(product.current_stock)} unit {t('result.card5.desc2')} {product.minimum_limit} unit.
                                                                </CardDescription>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {t('result.card6')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {result.market_trend_analysis}
                                        </CardContent>
                                    </Card>

                                    {result.recommendations && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    {t('result.card7')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {result.recommendations.map((rec, index) => (
                                                        <div key={index} className="py-3 px-4 bg-muted/75 rounded-xl">
                                                            <div className="font-bold capitalize mb-2">{rec.category}</div>
                                                            <div>{rec.action}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
                                    <p>Generating analysis...</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {dateRange?.from && format(dateRange.from, 'MMM dd, yyyy')}
                                        {' → '}
                                        {dateRange?.to && format(dateRange.to, 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            )
                        ) : analyzing ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
                                <p>{t('loading.subTitle')}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {dateRange?.from && format(dateRange.from, 'MMM dd, yyyy')}
                                    {' → '}
                                    {dateRange?.to && format(dateRange.to, 'MMM dd, yyyy')}
                                </p>
                            </div>
                        ) : (
                            <div className="flex space-y-6 py-12 items-center justify-center">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">{t('datePick.cardTitle')}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {t('datePick.cardDesc')}
                                        </p>
                                    </div>
                                    <div className="py-4">
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                                <Button
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
                                                    mode="range"
                                                    defaultMonth={dateRange?.from}
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    numberOfMonths={2}
                                                    min={30}
                                                    max={90}
                                                    className="rounded-lg border shadow-sm"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <Button
                                        onClick={analyzeSales}
                                        disabled={!dateRange?.from || !dateRange?.to || analyzing}
                                    >
                                        {/* {analyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : 'Run Analysis'} */}
                                        {t('datePick.button')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    <DialogFooter className="border-t p-2">
                        {(showAnalysis && result) && (
                            <PDFDownloadLink
                                document={<SalesAnalysisPDF content={result} />}
                                fileName="analysis-report.pdf"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                {({ loading: pdfLoading }) => (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        {pdfLoading ? t('prepare') : t('export')}
                                    </>
                                )}
                            </PDFDownloadLink>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}