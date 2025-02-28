// /components/Newsletter/EmailSubscriptionForm.tsx
import React from "react";
import Iframe from "react-iframe"; // import Iframe from react-iframe to render subscribe form

const EmailSubscriptionForm = () => {
  return (
    <div className="container bg-black py-8">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
          Explore <span className="text-purple-400">Jupiter Ecosystem</span>
        </h1>
        <h2 className="text-xl font-semibold text-white md:text-2xl">
          & Discover Opportunities!
        </h2>
        <p className="mt-2 px-4 text-sm text-purple-300 md:text-base">
          Handpicked <span className="text-pink-600">"Alpha"</span>, exclusive
          partnership updates, insights and opportunities in Jupiverse Ecosystem and more await you:
        </p>
        <p>
          <em>
            Subscribe now and be part of the pioneering &quot;JupFAQAnswered&quot; community.
          </em>
        </p>

        {/* Newsletter Substack iframe */}
        {/* <div className="flex justify-center mt-4" style={{ backgroundColor: 'purple', padding: '10px' }}> */}
        <div className="flex justify-center mt-4">
          <Iframe
            url="https://JupFAQAnswered.substack.com/embed"
            width="480"
            height="320"
            styles={{ border: '1px solid #EEE', backgroundColor: 'purple' }}
            frameBorder={0}
            scrolling="no"
          ></Iframe>
        </div>
        {/* <Iframe
          url="https://JupFAQAnswered.substack.com/embed"
          width="auto"
          height="320"
          // style="border:1px solid #EEE; background:white;"
          styles={{ border: "1px solid #EEE", background: "purple" }}
          frameBorder={0}
          scrolling="no"
        /> */}


      </div>
    </div>
  );
};

export default EmailSubscriptionForm;
