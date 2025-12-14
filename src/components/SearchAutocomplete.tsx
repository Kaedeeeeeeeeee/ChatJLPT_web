
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
    id: string;
    slug: string;
    kanji: string;
    reading: string;
    romaji: string;
    jlptLevel: string;
}

export default function SearchAutocomplete() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length === 0) {
                setResults([]);
                return;
            }

            try {
                const res = await fetch(`/api/dictionary/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
                setIsOpen(true);
            } catch (error) {
                console.error('Autocomplete search failed', error);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // If query is valid, go to search page or first result? 
            // For now, let's just do nothing or maybe just assume they want to search "taberu" directly?
            // Actually, if they hit enter, we usually want to go to the first result OR a search results page.
            // Let's go to the first result if available, otherwise just do nothing for now (or maybe I should keep the Search Button separately?)
            if (results.length > 0) {
                router.push(`/dictionary/${results[0].slug}`);
            }
        }
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search (e.g., sensei, 経済, N1...)"
                    className="w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg outline-none transition-all text-black bg-white"
                />
                <button
                    className="absolute right-2 top-2 bottom-2 px-6 bg-jlpt-blue text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                    onClick={() => {
                        // Manual search trigger
                        if (results.length > 0) router.push(`/dictionary/${results[0].slug}`);
                    }}
                >
                    Search
                </button>
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-96 overflow-y-auto">
                    {results.map((word) => (
                        <Link
                            key={word.id}
                            href={`/dictionary/${word.slug}`}
                            className="block px-6 py-4 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-xl font-bold text-gray-900">{word.kanji}</span>
                                    <span className="text-gray-600 font-medium">{word.reading}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400 font-mono">{word.romaji}</span>
                                    {word.jlptLevel && (
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${word.jlptLevel === 'N1' ? 'bg-red-100 text-red-700' :
                                            word.jlptLevel === 'N5' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {word.jlptLevel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
