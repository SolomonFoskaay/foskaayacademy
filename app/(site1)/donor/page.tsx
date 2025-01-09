// app/(site1)/donor/page.tsx
// "use client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const DonorPage = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <section className="flex-grow pb-12.5 pt-32.5 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="relative z-1 mx-auto max-w-c-1016 px-7.5 pb-7.5 pt-10 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
        {/* Gradient Background */}
        <div className="absolute left-0 top-0 -z-1 h-2/3 w-full rounded-lg bg-gradient-to-t from-transparent to-[#dee7ff47] dark:bg-gradient-to-t dark:to-[#252A42]" />

        {/* Main Content */}
        <div className="relative">
          <h1 className="mb-8 text-3xl font-bold text-purple-500 text-center">
            ExploreWeb3 Donor Features Hub
          </h1>

          {/* Wallet Connection Status */}
          <div className="mb-8 p-4 bg-gray-800/80 rounded-lg text-center">
            <p className="text-yellow-400">
              Please connect your wallet to access donor features
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Link href="/crypto-ath-price-prediction" target="_blank">
            <div className="p-6 bg-gray-800/80 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-400 mb-2">
                FREE Crypto ATH Price Predictions - Non-Donor Version
              </h3>
              <p className="text-gray-300 mb-4">
                Access detailed market analysis and predictions powered by FoskaayFib Levels, Grade and Strategy
              </p>
              <span className="text-gray-500">
                Donor NFT Not required!
              </span>
            </div>
            </Link>

            <Link href="/donor/crypto-ath-price-prediction" target="_blank">
            <div className="p-6 bg-gray-800/80 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-400 mb-2">
                FREE Advanced Crypto ATH Price Predictions - Donor Version
              </h3>
              <p className="text-gray-300 mb-4">
                Access detailed market analysis and predictions powered by FoskaayFib Levels, Grade and Strategy
              </p>
              <span className="text-gray-500">
                Requires Donor NFT!
              </span>
            </div>
            </Link>

            {/* Add more feature cards here */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonorPage;