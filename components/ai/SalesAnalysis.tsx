"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
        <div className="p-4">
            <div className="flex flex-center items-start">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Ask AI
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Business Analysis with AI
                    </h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <Button
                    onClick={analyzeSales}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Analyzing...
                        </>
                    ) : 'Run Sales Analysis'}
                </Button>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">
                    Error: {error}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className=" max-h-[50vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Analysis Results</DialogTitle>
                    </DialogHeader>
                    <div
                        ref={contentRef}
                        className="overflow-y-auto flex-1 py-2 pr-2"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="prose max-w-none"
                        >
                            {result && (
                                <p className="text-gray-700 whitespace-pre-line">
                                    <Typewriter
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
                                    />
                                </p>
                            )}
                        </motion.div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}