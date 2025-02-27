// /components/Donate/index.tsx

import DonateBasic from "./DonateBasic";

const Donate = () => {

  return (
    <>
      <DonateBasic />

      <p className="text-md mb-4">
        Thank YOU!
        <br />
        {/* NOTE: All donation wallets will qualify for future appreciation
        (hint - WL😀)! */}
      </p>

    </>
  );
};

export default Donate;