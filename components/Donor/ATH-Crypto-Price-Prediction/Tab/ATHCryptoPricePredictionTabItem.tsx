// /components/ATH-Crypto-Price-Prediction/Tab/CategoryTabItem.tsx
import React from "react";
import ATHCryptoPricePredictionHomepage from "..";

const ATHCryptoPricePredictionTabItem = ({ featureTab }: { featureTab: directoryTabTypes }) => {
  const { title } = featureTab;

     const renderContent = () => {
       switch (title) {
         case "": //Put title here or leave empty if returned page alreay have title
          // Return the ATH Crypto Price Prediction Tool homepage content
           return <ATHCryptoPricePredictionHomepage />;
        //  case "Explore Solana Blinks":
        //    return <Blinks />;
         default:
           return null;
       }
     };

  return (
    <>
      <div className="flex-col items-center gap-8 lg:gap-19">
        <div className="w-full">
          <h2 className="mb-7 text-3xl font-bold text-black dark:text-white xl:text-sectiontitle2">
            {title}
          </h2>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default ATHCryptoPricePredictionTabItem;
