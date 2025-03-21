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

const CourseCard = ({ video }: { video: any }) => (
  <Link href={`/course/${video.slug}`}>
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

interface CoursesIndexProps {
  courses: any[];
}

const CourseIndex: React.FC<CoursesIndexProps> = ({ courses }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("fa_course_category_count")
        .select("*");

      if (!error) {
        setCategories(data);
      } else {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const searchMatch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch =
      filterCategory === "All" ||
      [course.category_1, course.category_2, course.category_3, course.category_4, course.category_5].includes(
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
          placeholder="Search Foskaay Academy Courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow border p-2 rounded"
        />
      </div>

      {/* Course Cards Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((video) => (
          <CourseCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default CourseIndex;