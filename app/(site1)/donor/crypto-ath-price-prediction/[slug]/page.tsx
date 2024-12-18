// /app/(site1)/crypto-ath-price-prediction/[slug]/page.tsx

import ATHCPPListingsFullDetailsPage from "@/components/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage";

interface PageProps {
  params: {
    slug: string;
  };
}

const CryptoPredictionPage = ({ params }: PageProps) => {
  const { slug } = params;

  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
        <div className="flex flex-col-reverse gap-7.5 lg:flex-row xl:gap-12.5">
          <ATHCPPListingsFullDetailsPage slug={slug.toUpperCase()} />
        </div>
      </div>
    </section>
  );
};

export default CryptoPredictionPage;