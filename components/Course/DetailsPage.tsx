"use client";
import React, { useEffect } from "react";

const CourseDetailsPage = ({ video }) => {
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window !== 'undefined' && video?.yt_video_id) {
      // Create the video container structure
      const container = document.getElementById('video-container');
      if (container) {
        container.innerHTML = `
          <div style="width: 80%; max-width: 640px; max-height: 360px; margin: 0 auto;">
            <div class="epyv-video-container">
              <div id="playButton${video.yt_video_id}" class="play-button" onClick="clickToPlay('${video.yt_video_id}');" style="visibility: hidden;"></div>
              <img id="image${video.yt_video_id}" src="https://img.youtube.com/vi/${video.yt_video_id}/hqdefault.jpg" />
              <div class="epyv-video-player" id="${video.yt_video_id}" data-params="controls=1,rel=1"></div>
            </div>
          </div>
        `;
      }
    }
  }, [video]);

  return (
    <div className="container mx-auto px-4 py-8 pt-40">
      <h1 className="text-4xl font-bold mb-4">{video.title}</h1>
      <div className="mb-8">
        {/* Container for the video player */}
        <div id="video-container" />
        {/* Load the required scripts */}
        <script type="text/javascript" src="/course-videos/epytv.js" />
        <link href="/course-videos/epytv.css" rel="stylesheet" type="text/css" />
      </div>
      <p className="text-gray-600 dark:text-gray-300">{video.description}</p>
    </div>
  );
};

export default CourseDetailsPage;