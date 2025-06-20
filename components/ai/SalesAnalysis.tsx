"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Typewriter } from 'react-simple-typewriter';
import { Button } from '../ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';

export default function SalesAnalysis() {
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-scroll effect
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
                        <DialogTitle>
                            <Sparkles className="h-5 w-5 text-primary" />
                            Analysis Results
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea ref={contentRef} className='max-h-[50vh] overflow-y-auto border-t py-2'>
                        <div
                            className="flex-1 py-2"
                        >
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
                </DialogContent>
            </Dialog>
        </div>
    );
}