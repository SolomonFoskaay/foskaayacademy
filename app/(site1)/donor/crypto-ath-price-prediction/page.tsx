// /app/crypto-ath-price-prediction/page.tsx
import { Metadata } from 'next';
import ATHCryptoPricePrediction from '@/components/ATH-Crypto-Price-Prediction';

export const metadata: Metadata = {
  title: 'Crypto ATH Price Predictions | FoskaayFib Market Cycle Analysis',
  description: 'Get accurate cryptocurrency price predictions using FoskaayFib market cycle analysis. View detailed grades, accumulation zones, and price targets for Bitcoin, Ethereum, and other major cryptocurrencies.',
  keywords: 'crypto price prediction, FoskaayFib analysis, cryptocurrency market cycles, Bitcoin prediction, crypto trading tools, market cycle analysis, crypto investment strategy',
  openGraph: {
    title: 'Crypto ATH Price Predictions | FoskaayFib Market Cycle Analysis',
    description: 'Advanced market cycle analysis and ATH price predictions for top cryptocurrencies using FoskaayFib levels.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FoskaayFib Crypto Analysis'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto ATH Price Predictions | FoskaayFib Market Cycle Analysis',
    description: 'Advanced market cycle analysis and price predictions for top cryptocurrencies using FoskaayFib levels.'
  }
};

export default function ATHCryptoPricePredictionPage() {
  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
       <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
        <ATHCryptoPricePrediction />
      </div> 
    </section>
  );
}
