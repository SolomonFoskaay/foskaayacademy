"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { createClient } from "@/utils/supabase/client";

const AddVideoForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("jupfaqanswered_categories")
        .select("*");

      if (!error) {
        setCategories(data.map((cat: any) => ({ value: cat.id, label: cat.name })));
      } else {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !youtubeUrl || !thumbnailUrl || selectedCategories.length === 0) {
      setStatusMessage("Please fill all fields and select at least one category.");
      return;
    }

    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (!urlPattern.test(youtubeUrl)) {
      setStatusMessage("Invalid YouTube URL format.");
      return;
    }
    if (!urlPattern.test(thumbnailUrl)) {
      setStatusMessage("Invalid Thumbnail URL format.");
      return;
    }

    setStatusMessage("Submitting...");

    const supabase = createClient();
    const { error } = await supabase.from("jupfaqanswered_videos").insert({
      title,
      description,
      youtube_url: youtubeUrl,
      thumbnail_url: thumbnailUrl,
      category_1: selectedCategories[0]?.value || null,
      category_2: selectedCategories[1]?.value || null,
      category_3: selectedCategories[2]?.value || null,
      category_4: selectedCategories[3]?.value || null,
      category_5: selectedCategories[4]?.value || null,
    });

    if (error) {
      console.error("Error adding video:", error);
      setStatusMessage(`Error submitting: ${error.message}`);
    } else {
      setStatusMessage("Video added successfully!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-bold">Title *</label>
        <p className="text-sm text-gray-500">Example: JupFAQAnswered Ep17: How Does Governance Work In Jupiter DAO? (ANSWERED)</p>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-bold">Description *</label>
        <p className="text-sm text-gray-500">Example: JupFAQAnswered Ep17: In this Jupiter Frequently Asked Questions Answered Episode...</p>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-bold">YouTube URL *</label>
        <p className="text-sm text-gray-500">Example: https://www.youtube.com/embed/GUgjQAqELdU</p>
        <input
          type="text"
          placeholder="YouTube URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-bold">Thumbnail URL *</label>
        <p className="text-sm text-gray-500">Example: https://i9.ytimg.com/vi_webp/GUgjQAqELdU/maxresdefault.webp?v=67bf36f1&sqp=CKzC_b0G&rs=AOn4CLCph5Se-2N-fS_p6kqaQH_EN3nShg</p>
        <input
          type="text"
          placeholder="Thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-bold">Categories *</label>
        <p className="text-sm text-gray-500">Select up to 5 categories.</p>
        {isClient && (
          <Select
            isMulti
            options={categories}
            value={selectedCategories}
            onChange={(selected) => {
              if (selected.length <= 5) {
                setSelectedCategories(Array.from(selected));
              }
            }}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        )}
      </div>
      <button type="submit" className="bg-purple-600 text-white p-2 rounded">
        Add Video
      </button>
      {statusMessage && <p className="text-sm text-red-500">{statusMessage}</p>}
    </form>
  );
};

export default AddVideoForm;