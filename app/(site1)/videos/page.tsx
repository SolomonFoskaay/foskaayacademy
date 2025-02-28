import { createClient } from "@/utils/supabase/server";
import VideosIndex from "@/components/Videos";
import { Metadata } from "next";

// Define fixed metadata values
const title = "Videos - JupFAQAnswered";
const description = "Answers To Jupiter FAQs";
const ogImage = "https://JupFAQAnswered.xyz/images/opengraph-image.png";
const siteUrl = "https://JupFAQAnswered.xyz"; // Replace with your actual site URL

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

const VideosHomePage = async () => {
  const supabase = createClient();
  const { data: videos, error } = await supabase
    .from("jupfaqanswered_videos")
    .select("*");

  if (error) {
    console.error("Error fetching videos:", error);
    return <div>Error loading videos</div>;
  }

  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
        <VideosIndex videos={videos} />
      </div>
    </section>
  );
};

export default VideosHomePage;