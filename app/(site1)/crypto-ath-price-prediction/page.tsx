// /app/(site1)/crypto-ath-price-prediction/page.tsx
import { Metadata } from 'next';
import ATHCryptoPricePrediction from '@/components/ATH-Crypto-Price-Prediction';
import { createClient } from '@/utils/supabase/server';


// Define fixed metadata values
const title = "FREE Crypto ATH Price Predictions | FoskaayFib Market Cycle Analysis - Explore Web3";
const description = "Get cryptocurrency price predictions using FoskaayFib market cycle analysis. View detailed grades, accumulation zones, and price targets for Bitcoin, Ethereum, and other major cryptocurrencies.";
const ogImage = "https://ExploreWeb3.xyz/images/crypto-ath-tool/Cypto-ATH-Price-Prediction-List-ExploreWeb3-FoskaayFib-image.png";
const siteUrl = "https://ExploreWeb3.xyz/crypto-ath-price-prediction"; // Replace with your actual site URL

// Create metadata object
export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    url: siteUrl,
    type: 'website',
    title: title,
    description: description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: [ogImage],
  },
};

export default async function ATHCryptoPricePredictionPage() {
  // Get total count of crypto assets from db
  const supabase = createClient();  
  const { count } = await supabase
    .from('crypto_assets')
    .select('*', { count: 'exact', head: true });

  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
       <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
        <ATHCryptoPricePrediction totalCryptoCount={count || 0} />
      </div> 
    </section>
  );
}
