"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const getYouTubeEmbedUrl = (youtubeUrl: string) => {
  const videoIdMatch = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3`;
  } else {
    throw new Error('Invalid YouTube URL');
  }
};

const VideoCard = ({ video }: { video: any }) => (
  <Link href={`/videos/${video.slug}`}>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <iframe
          width="100%"
          height="100%"
          src={getYouTubeEmbedUrl(video.youtube_url)}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: 'none', border: 'none' }} // Disable interaction
        ></iframe>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
      </div>
    </div>
  </Link>
);

interface VideosIndexProps {
  videos: any[];
}

const VideosIndex: React.FC<VideosIndexProps> = ({ videos }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("jupfaqanswered_categories_count")
        .select("*");

      if (!error) {
        setCategories(data);
      } else {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const searchMatch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch =
      filterCategory === "All" ||
      [video.category_1, video.category_2, video.category_3, video.category_4, video.category_5].includes(
        categories.find((cat) => cat.name === filterCategory)?.id
      );

    return searchMatch && categoryMatch;
  });

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded mr-2 bg-purple-600 text-white"
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name} ({category.video_count})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search Jup FAQ Answered videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow border p-2 rounded"
        />
      </div>

      {/* Video Cards Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideosIndex;