import { MetadataRoute } from 'next';

// Define the type for the API response
interface DictionaryEntry {
    slug: string;
    updatedAt: string;
}

const BASE_URL = 'https://www.chatjlpt.jp'; // Or process.env.NEXT_PUBLIC_BASE_URL
// For now we map to the deployment URL. 
// If we are deploying /web as a subdomain, this should be 'https://dictionary.chatjlpt.com'
// If we are doing rewrites: 'https://chatjlpt.com/dictionary'
// User said: "chatjlpt.com/dictionary"
const DICTIONARY_BASE_URL = 'https://www.chatjlpt.jp/dictionary';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all dictionary slugs from the backend
    // In production, backend URL should be env var, for local build use localhost
    // CAUTION: 'npm run build' happens at build time. 
    // If the backend isn't running during Vercel build, this fetch will fail.
    // For ISR/Dynamic sitemap, this runs at request time (if dynamic) or build time.
    // We want this to be dynamic or revalidated periodically.

    // Note: Fetching 12000 items might be heavy for a single JSON payload.
    // Ideally backend should support pagination or a lightweight sitemap endpoint.
    // For MVP, we'll try to fetch all slugs (id, slug, updatedAt)

    let entries: DictionaryEntry[] = [];

    try {
        // Fetch from backend
        // Logic: During build time (locally or Vercel), we need to reach the backend.
        // In Vercel, backend might be deployed at a URL.
        // For now, let's hardcode localhost for local dev fallback (won't work in Vercel build unless env var is set)
        // Production robust way: check process.env.BACKEND_URL
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://chatjlptbackend-production.up.railway.app';

        // In Next.js App Router sitemap(), fetch allows caching configuration
        const res = await fetch(`${backendUrl}/api/dictionary/sitemap-slugs`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (res.ok) {
            entries = await res.json();
        }
    } catch (e) {
        console.error("Failed to fetch sitemap slugs", e);
    }

    // Static Routes
    const routes = [
        '',
    ].map((route) => ({
        url: `${DICTIONARY_BASE_URL}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Dynamic Dictionary Routes
    const dictionaryRoutes = entries.map((entry) => ({
        url: `${DICTIONARY_BASE_URL}/${entry.slug}`,
        lastModified: entry.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...dictionaryRoutes];
}
