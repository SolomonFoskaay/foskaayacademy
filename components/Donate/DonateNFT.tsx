// /components/Donate/DonateNFT.tsx
"use client";
import Link from "next/link";
import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

// Define feature categories and their items
const featureCategories = {
    "FoskaayFib Crypto ATH Prediction Tool Features": [
        {
            name: "Crypto ATH Price Prediction Tool",
            basic: true,
            donor: true,
        },
        {
            name: "FoskaayFib Levels Tool (All listed Coins/Tokens ONLY)",
            basic: true,
            donor: true,
        },
        {
            name: "FoskaayFib Grade Tool (All listed Coins/Tokens ONLY)",
            basic: true,
            donor: true,
        },
        {
            name: "FoskaayFib Levels Tool (Unlisted Coins/Tokens - Calculate any crypto coin/token with FoskaayFib Levels & Grades for FREE even if unlisted on the coin/token list yet giving you unlimited coin/token research capability)",
            basic: false,
            donor: true,
        },
        {
            name: "FoskaayFib Grade Tool (Unlisted Coins/Tokens - Calculate any crypto coin/token with FoskaayFib Levels & Grades for FREE even if unlisted on the coin/token list yet giving you unlimited coin/token research capability)",
            basic: false,
            donor: true,
        },
        {
            name: "FoskaayFib Crypto ATH Predictions Support (Ask questions under any listed coin/token and get direct support from me)",
            basic: false,
            donor: true,
        },
        {
            name: "FoskaayFib Strategy (My 8years+ coins/tokens risk edging strategy to ensure no matter what you don't endup been loser at the end of the bullrun with top coin/token picks with FoskaayFib Levels and Grade)",
            basic: false,
            donor: true,
        },
        {
            name: "+ My top coin picks with the strategy using FoskaayFib levels and Grades",
            basic: false,
            donor: true,
        },
        {
            name: "+ Live daily calculation of the result if have following capitals to explore crypto 2022-2025 Bull Cycle before its over in 2025: even $50, $1,000, $10,000+ capital calculator)",
            basic: false,
            donor: true,
        },
        {
            name: "+ Plugin in your custom capital amount and watch live update of your portfolio as it acheive each FoskaayFib Price Prediction targets (wins) or misses (losses)",
            basic: false,
            donor: true,
        },
    ],
    "Earning Features": [
        {
            name: "Earn for submitted and approved project",
            basic: false,
            donor: true,
        },
        {
            name: "Earn for submitted and approved grants/bounty",
            basic: false,
            donor: true,
        },
        {
            name: "Activity Points (Review, Rating etc.)",
            basic: false,
            donor: true,
        },
        {
            name: "Earning & Activity Points Increses Based On Number of Donation NFT User Holds",
            basic: false,
            donor: true,
        },
    ],
    "Enhanced Project Discovery": [
        {
            name: "Basic project search and filtering",
            basic: true,
            donor: true,
        },
        {
            name: "Priority access to newly listed projects",
            basic: false,
            donor: true,
        },
        {
            name: "Advanced filtering capabilities",
            basic: true,
            donor: true,
        },
        {
            name: "Curated trending projects feed",
            basic: true,
            donor: true,
        },
    ],
    "Community Recognition": [
        {
            name: "Basic profile",
            basic: true,
            donor: true,
        },
        {
            name: "Donor NFT badge display",
            basic: false,
            donor: true,
        },
        {
            name: "Highlighted reviews, ratings and comments",
            basic: false,
            donor: true,
        },
        {
            name: "Priority project listing submissions (Submited project get approved and listed first)",
            basic: false,
            donor: true,
        },
    ],
    "Exclusive Access": [
        {
            name: "Basic newsletter subscription",
            basic: true,
            donor: true,
        },
        {
            name: "Early access to grants and bounties",
            basic: false,
            donor: true,
        },
        {
            name: "Exclusive Discord channel access",
            basic: false,
            donor: true,
        },
        {
            name: "Priority job listings alerts",
            basic: false,
            donor: true,
        },
    ],
    "Platform Features": [
        {
            name: "Basic bookmarking (Max 3)",
            basic: true,
            donor: true,
        },
        {
            name: "Advance bookmarking (Upto 15/NFT)",
            basic: false,
            donor: true,
        },
        {
            name: "Custom project collections",
            basic: false,
            donor: true,
        },
        {
            name: "Advanced analytics access",
            basic: false,
            donor: true,
        },
        {
            name: "Premium email notifications",
            basic: false,
            donor: true,
        },
    ],
    "Upcoming Features": [
        {
            name: "Beta Access",
            basic: false,
            donor: true,
        },
    ],
};

const DonateNFT = () => {
    return (
        <div className="mt-12 w-full">

            <h2 className="text-2xl font-bold text-center text-purple-500">
                Introducing the ExploreWeb3 Donor NFT
            </h2>
            <p className="text-md mb-4 text-center">
                Support our public good project by minting the ExploreWeb3 Donor NFT for $100USDC.
            </p>
            <p className="text-md mb-4 text-center">
                This NFT helps keep the platform UPDATED and FREE for all users but also unlocks exclusive perks for you as a donor.
            </p>

            <h2 className="mb-8 text-center text-2xl font-bold text-purple-400">
                Donor NFT Benefits Comparison
            </h2>

            {/* Responsive table container */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    {/* Table header */}
                    <thead>
                        <tr>
                            <th className="w-1/2 px-6 py-3 text-left text-sm font-semibold text-gray-300">
                                Features
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                                Basic Users
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-purple-400">
                                Donor NFT Holders
                            </th>
                        </tr>
                    </thead>

                    {/* Table body */}
                    <tbody className="divide-y divide-gray-700">
                        {Object.entries(featureCategories).map(([category, features]) => (
                            <React.Fragment key={category}>
                                {/* Category header */}
                                <tr className="bg-gray-800">
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-sm font-semibold text-purple-400"
                                    >
                                        {category}
                                    </td>
                                </tr>
                                {/* Category features */}
                                {features.map((feature, index) => (
                                    <tr
                                        key={`${category}-${index}`}
                                        className="transition-colors hover:bg-gray-700"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {feature.name}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {feature.basic ? (
                                                <FaCheck className="mx-auto text-green-500" />
                                            ) : (
                                                <FaTimes className="mx-auto text-red-500" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {feature.donor ? (
                                                <FaCheck className="mx-auto text-green-500" />
                                            ) : (
                                                <FaTimes className="mx-auto text-red-500" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Call to action */}
            <div className="mt-8 text-center">
                <p className="mb-4 text-gray-300">
                    Kindly Mint ExploreWeb3 Donor NFT today to DONATE and unlock all APPRECIATION perks features
                    and support this public good project to keep showcasing amazing web3/Solana projects and their opportunities!
                </p>
                <h2 className="mb-4 text-red-500 text-xl">
                    <b>
                    IMPORTANT NOTES/UPDATES (13th December 2024):
                    </b>
                </h2>
                <p className="mb-4 text-gray-300">

                    (1) The more you DONATE (Mint), the higher the perks unlocked!

                </p>
                <p className="mb-4 text-red-300">
                    <b>
                        (2) Warning: Am not selling this NFT and so its not flippable/resellable.
                        <br />
                        It just a proof that you DONATED to support ExploreWeb3 as a PUBLIC Good Projects expecting nothing back [Zero (0) Expectation].
                        <br />
                        Yet, I want to appreciate you with some perks and the NFT makes it easier for me to do that!
                        <br />
                        For example some features are locked on this website and you may only unlock it with the donor NFT in your connected wallet.
                    </b>
                </p>
                <p className="mb-4 text-gray-300">
                    <b>
                        (3) The amount to donate to qualify to mint this Donor NFT will keep increasing by 25% per every 50 mints until hit $1,000 - After first 50 Mints, Next will be atleast 125USDC/Donation to Mint!
                    </b>
                </p>
                <a
                    href="https://3.land/item/ppknfMRWztTEGfnt2Po5sh7xcQyeEU22Ndzy6VSpeNw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-md bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
                >
                    Donate By Minting Donor NFT (100 USDC/Donation to Mint NFT)
                </a>
            </div>
            
            <div className="mt-8 text-center">
                <p className="mb-4 text-gray-300">
                    ALERT: <br />
                    Please, kindly note that most of the above perks features are not yet available because they require more resources to implement.
                    They will kickstart when there is atleast 25-50 Donors NFT minted making funds available to ensure there implementation.
                </p>
            </div>

            <div className="mt-8 text-center text-green-500">
                <Link href="/Discord" target="_blank" >
                <b>
                After Donation & Successfully Minting Your Donor NFT:
                <br />
                 Kindly Click Here To Unlock and Join Exclusive Donors Discord Channel with your Donor NFT!
                </b>
                <br />
                </Link>
            </div>
        </div>
    );
};

export default DonateNFT;