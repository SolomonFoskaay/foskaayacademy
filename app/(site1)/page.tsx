// /app/(site)/page.tsx
import { createClient } from "@/utils/supabase/server";
import VideosIndex from "@/components/Videos";
import EmailSubscriptionForm from "@/components/Newsletter/EmailSubscriptionForm";
import { Metadata } from "next";
import TitleAnimated from "@/components/Header/TitleAnimated";

// Define fixed metadata values
const title = "Home - Foskaay Academy";
const description = "Multi-niche skills acquisition education platform";
const ogImage = "https://FoskaayAcademy.com/images/opengraph-image.png";
const siteUrl = "https://FoskaayAcademy.com"; // Replace with your actual site URL

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
    .select("*")
    .eq("moderation_status", "approved");

  if (error) {
    console.error("Error fetching videos:", error);
    return <div>Error loading videos</div>;
  }

  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
        <EmailSubscriptionForm/>
        <TitleAnimated />
        <VideosIndex videos={videos} />
      </div>
    </section>
  );
};

export default VideosHomePage;