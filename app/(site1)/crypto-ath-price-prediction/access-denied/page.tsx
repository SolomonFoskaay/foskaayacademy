// /app/(site1)/crypto-ath-price-prediction/access-denied/page.tsx
import Link from 'next/link';

export default function AccessDeniedPage() {
    return (
      <div className="min-h-screen py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                Access Restricted
              </h1>
            </div>
  
            {/* Content */}
            <div className="px-6 py-8">
              <div className="prose dark:prose-invert max-w-none">
                {/* New Access Explanation Section */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mb-8">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-4">
                    You've been redirected to this page because you attempted to access Donor-only features of the ATH Price Prediction Tool.
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 mb-2">This could be because:</p>
                  <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
                    <li>You tried to access the Donor Version homepage of the Crypto ATH Price Prediction Tool</li>
                    <li>You attempted to view detailed FoskaayFib predictions for a specific cryptocurrency in the Donor version</li>
                    <li>You tried to analyze a cryptocurrency that isn't currently available in the Non-Donor version</li>
                  </ul>
                </div>
  
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  This cryptocurrency is not on the current Non-Donor ATH Price Prediction List (it may be added in future) - But you may still be able to check it now without waiting if you hold the ExploreWeb3 Donor NFT.
                </p>
  
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                    Donors can check 500+ cryptos to aid their research!
                  </h2>
                  <p className="text-blue-700 dark:text-blue-300">
                  Access is granted when you meet these criteria:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-3 text-blue-600 dark:text-blue-300">
                  <li>
                    <span className="font-semibold">Become a DONOR:</span> Mint the ExploreWeb3 Donor NFT
                    <p className="ml-6 text-sm">
                      After donating and minting, register and login to your account on ExploreWeb3, then connect your Solana wallet where you hold the Donor NFT to Unlock Donors perks and features.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">FoskaayFib Levels/Grades formular criterias</span>
                    <p className="ml-6 text-sm">
                      This is automatically handled - no action required from you. If the crypto coin/token doesn't meetup to have FoskaayFib formular calculation, it will output error. So, just try other 500+ cryptos.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">CryptoCompare API Availability:</span>
                    <p className="ml-6 text-sm">
                      Historical data must be available in the CryptoCompare API for FoskaayFib calculations. This is automatically handled - no action required from you. Technically, we do not limit the number of crypto coin/token to analyse with FoskaayFib prediction tool for Donor Version, the limitation is based on if the CryptoCompare API we use to fetch live historical data does not have the coin/token.
                    </p>
                  </li>
                </ul>
                </div>
  
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <p className="text-purple-800 dark:text-purple-200 font-medium">
                    NOTE: Once you signin with your Donor NFT wallet connected, you can analyze any supported cryptocurrency - even those not on the public list!
                  </p>
                </div>
  
                {/* Call to Action */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/donate"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-purple-700 transition-colors duration-200"
                  >
                    Become a Donor {" >>"} 
                  </Link>
                  <Link
                    href="/crypto-ath-price-prediction"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-red dark:bg-red-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {"<< "} Back to Non-Donor Crypto ATH Price Prediction List 
                    <br />
                    (Does not require Donor NFT)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }