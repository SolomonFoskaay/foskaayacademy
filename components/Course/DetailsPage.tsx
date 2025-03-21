import React from "react";

const getYouTubeEmbedUrl = (youtubeUrl: string) => {
  const videoIdMatch = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=1&playlist=${videoId}`;
  }
  throw new Error('Invalid YouTube URL');
};

const CourseDetailsPage = ({ video }) => (
  <div className="container mx-auto px-4 py-8 pt-40">
    <h1 className="text-4xl font-bold mb-4">{video.title}</h1>
    <div className="mb-8">
      <iframe
        width="100%"
        height="720"
        src={getYouTubeEmbedUrl(video.youtube_url)}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ border: 'none' }}
      ></iframe>
    </div>
    <p className="text-gray-600 dark:text-gray-300">{video.description}</p>
  </div>
);

export default CourseDetailsPage;