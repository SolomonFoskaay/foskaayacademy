// /app/(site1)/donor/crypto-ath-price-prediction/[slug]/page.tsx

import { Metadata } from "next";
import DonorATHCPPListingsFullDetailsPage from "@/components/Donor/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage";

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

interface PageProps {
  params: {
    slug: string;
  };
}

const DonorCryptoPredictionPage = ({ params }: PageProps) => {
  const { slug } = params;

  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
        <div className="flex flex-col-reverse gap-7.5 lg:flex-row xl:gap-12.5">
          <DonorATHCPPListingsFullDetailsPage slug={slug.toUpperCase()} />
        </div>
      </div>
    </section>
  );
};

export default DonorCryptoPredictionPage;