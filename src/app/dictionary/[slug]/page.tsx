
import { notFound } from 'next/navigation';
import Link from 'next/link';
import KanjiWriter from '@/components/KanjiWriter';
import DictionaryExampleGenerator from '@/components/DictionaryExampleGenerator';

// Define types (Should ideally be shared, but defining here for MVP)
interface DictionaryEntry {
    id: string;
    slug: string;
    kanji: string;
    reading: string;
    romaji: string;
    jlptLevel: string;
    rank: number;
    senses: {
        id: string;
        definitions: string[];
        partOfSpeech: string[];
        info?: string;
        examples: {
            id: string;
            sentenceJa: string;
            sentenceEn: string;
            sentenceRomaji: string;
        }[];
    }[];
}

async function getDictionaryEntry(slug: string): Promise<DictionaryEntry | null> {
    try {
        // Note: In a real production SSR environment, you might key this request or use a direct DB call
        // But going through the internal API endpoint is fine for now if localhost:3001 is up.
        // We use the absolute URL because this runs on the server.
        // Use environment variable or fallback to production URL for SSR
        let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chatjlptbackend-production.up.railway.app';

        // Ensure protocol exists
        if (!API_BASE_URL.startsWith('http')) {
            API_BASE_URL = `https://${API_BASE_URL}`;
        }

        const fetchUrl = `${API_BASE_URL}/api/dictionary/slug/${slug}`;
        console.log(`[Dictionary SSR] Fetching: ${fetchUrl}`);

        const res = await fetch(fetchUrl, {
            cache: 'no-store', // Always fetch fresh data for now
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Error fetching dictionary entry:', error);
        return null;
    }
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const entry = await getDictionaryEntry(slug);

    if (!entry) {
        return {
            title: 'Word Not Found - ChatJLPT Dictionary',
        };
    }

    const definitions = entry.senses[0]?.definitions.join(', ') || '';
    return {
        title: `${entry.kanji} (${entry.reading}) - Meaning in English | ChatJLPT Dictionary`,
        description: `Learn the meaning of ${entry.kanji} (${entry.reading}) in Japanese. Definitions: ${definitions}. JLPT Level: ${entry.jlptLevel}.`,
    };
}

export default async function DictionaryEntryPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const entry = await getDictionaryEntry(slug);

    if (!entry) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">

            {/* Navigation */}
            <nav className="border-b border-gray-100 py-4 px-6">
                <div className="max-w-4xl mx-auto flex items-center gap-4 text-sm text-gray-500">
                    <Link href="/dictionary" className="hover:text-blue-600 transition-colors">Dictionary Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{entry.kanji}</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-12 px-6">

                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-sm">
                            {entry.jlptLevel || 'JLPT N/A'}
                        </span>
                        {entry.rank > 50 && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
                                Common Word
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                        {/* Text Info */}
                        <div className="flex-1">
                            <h1 className="text-6xl font-bold text-gray-900 mb-4 bg-clip-text">
                                {entry.kanji}
                            </h1>

                            <div className="flex items-baseline gap-4">
                                <p className="text-3xl text-gray-600 font-medium">{entry.reading}</p>
                                <p className="text-xl text-gray-400 font-light font-mono">{entry.romaji}</p>
                            </div>
                        </div>

                        {/* Kanji Animations */}
                        {/* Only show if string contains actual Kanji (not just Kana) to avoid 404s on SVG CDN */}
                        <div className="flex gap-4 flex-wrap">
                            {entry.kanji.split('').map((char, index) => {
                                // Simple regex to check if char is common kanji (excludes kana/punctuation)
                                // Standard Kanji range: \u4E00-\u9FAF
                                if (/[\u4E00-\u9FAF]/.test(char)) {
                                    return <KanjiWriter key={index} character={char} size={110} />;
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 mb-12" />

                {/* Senses & Meanings */}
                <div className="space-y-12">
                    {entry.senses.map((sense, index) => (
                        <section key={sense.id} className="relative pl-8 border-l-4 border-blue-100">
                            {/* Meaning Counter */}
                            <div className="absolute -left-[27px] -top-1 w-12 h-12 flex items-center justify-center bg-white border-4 border-blue-50 text-blue-300 font-bold rounded-full text-xl">
                                {index + 1}
                            </div>

                            {/* Definition */}
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {sense.partOfSpeech.map((pos) => (
                                        <span key={pos} className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">
                                            {pos}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {sense.definitions.join('; ')}
                                </h3>
                                {sense.info && (
                                    <p className="text-sm text-gray-500 mt-1 italic">Note: {sense.info}</p>
                                )}
                            </div>

                            {/* Examples */}
                            <DictionaryExampleGenerator
                                senseId={sense.id}
                                word={entry.kanji}
                                definition={sense.definitions.join('; ')}
                                initialExamples={sense.examples}
                            />
                        </section>
                    ))}
                </div>

                {/* CTA Section (Conversion) */}
                <div className="mt-20 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white text-center shadow-xl">
                    <h3 className="text-2xl font-bold mb-2">Master {entry.kanji} and passing JLPT?</h3>
                    <p className="text-blue-100 mb-6">ChatJLPT helps you learn Japanese naturally with AI.</p>
                    <a href="https://chatjlpt.com/signup" className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-colors">
                        Start Learning for Free
                    </a>
                </div>

            </main>
        </div>
    );
}
