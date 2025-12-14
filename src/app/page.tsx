'use client';

import SearchAutocomplete from '@/components/SearchAutocomplete';

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

        {/* Quick Links / Popular Words (Optional Placeholder) */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">Popular Searches</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="/dictionary/sensei" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
              先生 (sensei)
            </a>
            <a href="/dictionary/ame" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
              雨 (ame)
            </a>
            <a href="/dictionary/ni-saishite" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
              に際して (N1)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
