// /components/Header/TitleAnimated.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const TitleAnimated = () => {
  const [currentCategory, setCurrentCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabaseClient = createClient();

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabaseClient
        .from("jupfaqanswered_categories")
        .select("name");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
      } else {
        setCategories(categoriesData.map((cat) => cat.name));
      }

      // Fetch total questions
      const { count: questionsCount, error: questionsError } = await supabaseClient
        .from("jupfaqanswered_videos")
        .select("*", { count: "exact" })
        .eq("moderation_status", "approved");

      if (questionsError) {
        console.error("Error fetching total questions:", questionsError);
      } else {
        setTotalQuestions(questionsCount ?? 0);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const categoryIndex = setInterval(() => {
      setCurrentCategory((prevCategory) => {
        const currentIndex = categories.indexOf(prevCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        return categories[nextIndex];
      });
    }, 2000);

    return () => clearInterval(categoryIndex);
  }, [categories]);

  return (
    <div className="text-center">
      <motion.h1
        className="mb-2 text-2xl font-bold text-green-500 md:text-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="flex items-center justify-center gap-1">
          <span>Search Answers to {totalQuestions}+ Jupiter Frequently Asked Questions</span>
          <span>{"=>"}</span>
          <motion.span
            className="inline-block text-center text-purple-400"
            style={{ padding: "0 0.5rem" }}
            key={currentCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {currentCategory}
          </motion.span>
        </div>
      </motion.h1>

      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <label className="text-l my-6 font-bold text-purple-500">
          Earn Using & Exploring Solana Projects
        </label>
        <span className="text-white-400 text-center">
          {" "}
          {"=>"} <a href="/earn">Learn More!</a>
        </span>
      </motion.div> */}
    </div>
  );
};

export default TitleAnimated;