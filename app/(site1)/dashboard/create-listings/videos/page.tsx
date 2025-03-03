import { createClient } from "@/utils/supabase/server";
import AddVideoForm from "@/components/Dashboard/CreateListings/Videos";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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

const VideosFormPage = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
        <AddVideoForm />
      </div>
    </section>
  );
};

export default VideosFormPage;