import { createClient } from "@/utils/supabase/server";
import VideoDetailsPage from "@/components/Videos/DetailsPage";

const VideoPage = async ({ params }) => {
  const supabase = createClient();
  const { data: video, error } = await supabase
    .from("jupfaqanswered_videos")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !video) {
    console.error("Error fetching video:", error);
    return <div>Video not found</div>;
  }

  return <VideoDetailsPage video={video} />;
};

export default VideoPage;