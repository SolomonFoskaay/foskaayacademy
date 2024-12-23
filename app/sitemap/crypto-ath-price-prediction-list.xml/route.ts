// /app/sitemap/crypto-ath-price-prediction-list.xml/route.ts
import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import { cryptoSymbols } from '@/components/ATH-Crypto-Price-Prediction/ATHCryptoList';

export async function GET(request: Request) {
  try {
    // Map the crypto symbols to sitemap entries
    // Create sitemap entries for crypto symbols in reverse order
    const sitemapEntries: ISitemapField[] = [...cryptoSymbols] // Create a copy to avoid mutating original array
      .reverse()
      .map((symbol) => ({
      loc: `${process.env.NEXT_PUBLIC_BASE_URL}/crypto-ath-price-prediction/${symbol.toLowerCase()}`,
      lastmod: new Date().toISOString(), // Current date as last modified
      changefreq: 'daily', // More frequent updates than projects
      priority: 0.9, // Higher priority than projects (0.8)
    }));

    // Add the main crypto prediction list page
    sitemapEntries.unshift({
      loc: `${process.env.NEXT_PUBLIC_BASE_URL}/crypto-ath-price-prediction`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0, // Highest priority for the main list page
    });

    // Return the sitemap in XML format
    return getServerSideSitemap(sitemapEntries);

  } catch (error) {
    console.error('Error generating crypto prediction sitemap:', error);
    return new Response('<error>Failed to generate crypto prediction sitemap</error>', {
      status: 500,
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  }
}