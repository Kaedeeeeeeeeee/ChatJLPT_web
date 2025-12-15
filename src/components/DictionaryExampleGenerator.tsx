'use client';

import { useState } from 'react';

interface Example {
    id: string;
    sentenceJa: string;
    sentenceEn: string;
    sentenceRomaji: string;
}

interface DictionaryExampleGeneratorProps {
    senseId: string;
    word: string;
    definition: string;
    initialExamples: Example[];
}

export default function DictionaryExampleGenerator({
    senseId,
    word,
    definition,
    initialExamples
}: DictionaryExampleGeneratorProps) {
    const [examples, setExamples] = useState<Example[]>(initialExamples);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If we have examples, just show them. 
    // If not, show the generate button.
    const showGenerateButton = examples.length === 0;

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Use environment variable or default to production/local
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chatjlptbackend-production.up.railway.app';

            const response = await fetch(`${API_BASE_URL}/api/dictionary/generate-example`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senseId,
                    word,
                    definition
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate example');
            }

            const newExample = await response.json();
            setExamples(prev => [...prev, newExample]);
        } catch (err) {
            console.error(err);
            setError('Failed to generate example. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Examples</h4>

            {examples.length > 0 ? (
                <div className="space-y-6">
                    {examples.map((ex) => (
                        <div key={ex.id} className="group">
                            <p className="text-lg text-gray-900 font-medium mb-1">
                                {ex.sentenceJa}
                            </p>
                            <p className="text-sm text-gray-500 mb-1 font-mono">
                                {ex.sentenceRomaji}
                            </p>
                            <p className="text-gray-600">
                                {ex.sentenceEn}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-4">
                    {error && (
                        <p className="text-red-500 text-sm mb-3">{error}</p>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className={`
                            px-6 py-2 rounded-full font-medium transition-all
                            flex items-center gap-2
                            ${isLoading
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 shadow-sm'
                            }
                        `}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <span className="text-lg">✨</span>
                                View Example
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        Powered by AI
                    </p>
                </div>
            )}
        </div>
    );
}
