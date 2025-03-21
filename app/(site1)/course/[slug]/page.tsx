import { createClient } from "@/utils/supabase/server";
import CourseDetailsPage from "@/components/Course/DetailsPage";
import { Metadata } from "next";

// Define fixed metadata values
const title = "Course Page - Foskaay Academy";
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

const CoursePage = async ({ params }) => {
  const supabase = createClient();
  const { data: video, error } = await supabase
    .from("fa_course_video")
    .select("*")
    .eq("slug", params.slug)
    .eq("moderation_status", "Approved")
    .single();

  if (error || !video) {
    console.error("Error fetching video:", error);
    return <div>Video not found</div>;
  }

  return <CourseDetailsPage video={video} />;
};

export default CoursePage;