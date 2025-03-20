// /components/Donate/DonateBasic.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";

const PaymentBasic = () => {
  const [walletAddress] = useState(
    "BEHqoUwcKPCM8XcG7m1daKX9u8CcAEQKDUHFP8f4c3e",
  );

  // Wallet copy function starts
  const copyToClipboard = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        alert("Wallet address copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
        fallbackCopyTextToClipboard(walletAddress);
      }
    } else {
      fallbackCopyTextToClipboard(walletAddress);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "successful" : "unsuccessful";
      console.log("Fallback: Copying text command was " + msg);
      alert("Wallet address copied to clipboard!");
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      alert("Failed to copy wallet address. Please try manually.");
    }

    document.body.removeChild(textArea);
  };
  // Wallet copy function ends

  return (
    <>
      <h1 className="text-4xl font-bold text-yellow-300 text-center mb-8">
        HOW TO MAKE PAYMENT FOR FOSKAAY ACADEMY SUBSCRIPTION PLANS EXPLAINED:
      </h1>


      <div className="space-y-6">
        <div className="space-y-2">
        <p className="text-gray-300">
            Foskaay Academy has multiple subscription plans catering for different students based on niche your subscription will cover like web3 programming for dPU Pro student. You can pay for them by following instructions for each plans below:
            
          </p>
          <br />
          <h3 className="text-4xl font-bold text-yellow-300 text-center mb-8">
        (1) HOW TO MAKE PAYMENT FOR dPU PRO EXPLAINED:
      </h3>
          <span className="text-green-400 font-bold">STEP 1. Payment:</span>
          <p className="text-gray-300">
            Kindly send precise amount for your selected {" "}
            <a href="https://dProgrammingUniversity.com" className="text-pink-500 hover:underline" target="_blank">
            dPU Pro Plans here
            </a>
            {" "} (Please ensure that you are paying precise amount displayed for available plans, if unsure, you can ask me first in dPU discord below if particular slot still available or not before payment).
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-300">
            Please, Send ONLY Stable coins (USDC or USDT) on the SOLANA Network to Solana wallet below:
          </p>
          <p className="break-words rounded-md border bg-gray-800 p-2 text-lg text-white"
             style={{ userSelect: "text" }}>
            {walletAddress}
          </p>
          <button
            onClick={copyToClipboard}
            className="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Copy Wallet Address
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-gray-300">OR Scan QR Code: Please ensure the QR Code wallet is same as the above wallet:</p>
          <Image
            src="/images/others/wallet1a-qr-code-image.png"
            alt="QR code for wallet address"
            width={438}
            height={388}
            className="mx-auto w-auto h-auto dark:block"
          />
        </div>

        <div className="space-y-2">
          <span className="text-green-400 font-bold">STEP 2. Confirmation:</span>
          <p className="text-gray-300">
            Then, kindly send me details of your payment (transaction id on Solana Blockchain) for confirmation via DM on Discord via "<span className="font-semibold">@foskaay</span>" (Please, I will never send you any wallet to request payment different from above wallet. If you recieve such DM anywhere it is a pure scam and I won't be responsebile to compensate anyone for it. So, please be watchful).
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-300">
            You can also join the official{" "}
            <a href="https://dProgrammingUniversity.com/Discord" className="text-pink-500 hover:underline" target="_blank">
              dPU discord server
            </a>
            {" "}and message me via the <span className="font-semibold">#dpu-pro</span> channel.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-green-400 font-bold">STEP 3:</span>
          <p className="text-gray-300">
            Once I confirm your payment, you will be added to added to a dPU PRO private channel in the dPU server above where you will be getting updates about the state of the launch, discuss and vote for future projects/courses.
          </p>
          <br />
        </div>
      </div>
    </>
  );
};

export default PaymentBasic;
