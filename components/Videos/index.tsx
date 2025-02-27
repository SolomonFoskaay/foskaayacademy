import React from "react";
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

const VideoCard = ({ video }) => (
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

const VideosIndex = ({ videos }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {videos.map((video) => (
      <VideoCard key={video.id} video={video} />
    ))}
  </div>
);

export default VideosIndex;