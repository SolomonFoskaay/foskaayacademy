import { createClient } from "@/utils/supabase/server";
import VideoDetailsPage from "@/components/Videos/DetailsPage";
import { Metadata } from "next";

// Define fixed metadata values
const title = "Watch Video - JupFAQAnswered";
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

const VideoPage = async ({ params }) => {
  const supabase = createClient();
  const { data: video, error } = await supabase
    .from("jupfaqanswered_videos")
    .select("*")
    .eq("slug", params.slug)
    .eq("moderation_status", "approved")
    .single();

  if (error || !video) {
    console.error("Error fetching video:", error);
    return <div>Video not found</div>;
  }

  return <VideoDetailsPage video={video} />;
};

export default VideoPage;