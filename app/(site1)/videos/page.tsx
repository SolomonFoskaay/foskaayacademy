import { createClient } from "@/utils/supabase/server";
import VideosIndex from "@/components/Videos";

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