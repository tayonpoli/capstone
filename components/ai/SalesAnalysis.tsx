"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Typewriter } from 'react-simple-typewriter';
import { Button } from '../ui/button';
import { Download, Loader2, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SalesAnalysisPDF } from './SalesAnalysisPDF';
import { TypewriterMarkdown } from './TypewriterMarkdown';

export default function SalesAnalysis() {
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current && result) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [result]);

    const analyzeSales = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                toast.error("Ai Analysis failed");
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data.data);
            setOpen(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='py-2'>
            <Button
                className='bg-gradient-to-r from-sky-200 from-10% via-blue-400 via-30% to-indigo-900 to-90%'
                onClick={analyzeSales}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles />
                        Ask Analysis
                    </>
                )}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Sparkles className='text-primary' /> Analysis Results
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea ref={contentRef} className='max-h-[50vh] overflow-y-auto border-t py-2'>
                        <div className="flex-1 py-2">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="prose max-w-none"
                            >
                                {result && (
                                    <div className="whitespace-pre-line">
                                        <ReactMarkdown>
                                            {/* <Typewriter
                                            words={[result]}
                                            typeSpeed={15}
                                            deleteSpeed={0}
                                            delaySpeed={1000}
                                            cursor
                                            onType={() => {
                                                // Trigger scroll on each type
                                                if (contentRef.current) {
                                                    contentRef.current.scrollTop = contentRef.current.scrollHeight;
                                                }
                                            }}
                                        /> */}
                                            {result}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className='border-t pt-2'>
                        {result && (
                            <PDFDownloadLink
                                document={<SalesAnalysisPDF content={result} />}
                                fileName="sales-analysis-report.pdf"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        {loading ? 'Preparing PDF...' : 'Export to PDF'}
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