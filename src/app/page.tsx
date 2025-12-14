'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchAutocomplete from '@/components/SearchAutocomplete';

function RecentSearches() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load initial
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem('dictionary_search_history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load history', e);
      }
    };

    loadHistory();

    // Listen for updates
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="text-center animate-fade-in">
      <p className="text-sm text-gray-400 mb-4">Recent Searches</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {history.map((word) => (
          <Link
            key={word.id}
            href={`/dictionary/${word.slug}`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {word.kanji} ({word.romaji})
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          <span className="text-jlpt-blue">Chat</span>JLPT Jisho
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Free AI-powered Japanese Dictionary for N5-N1
        </p>

        {/* New Autocomplete Component */}
        <div className="mb-10 w-full z-50">
          <SearchAutocomplete />
        </div>

        {/* Recent Searches */}
        <div className="text-center w-full">
          <RecentSearches />
        </div>
      </div>
    </div>
  );
}
