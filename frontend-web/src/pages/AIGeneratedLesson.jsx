import { useState }
from "react";

import api
from "../services/api";

import StoryReader
from "../components/StoryReader";

export default function
AIGeneratedLesson() {

  const [lesson, setLesson] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const generateLesson =
    async () => {

      try {

        setLoading(true);

        const response =
          await api.post(
            "/ai/generate-lesson",

            {
              topic: "Cyberpunk",
              level: "C2"
            }
          );

        setLesson(
          response.data
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  return (

    <div
      className="
        min-h-screen

        bg-slate-950

        text-white

        px-6
        py-12
      "
    >

      <button

        onClick={generateLesson}

        className="
          bg-blue-500

          hover:bg-blue-600

          px-6
          py-3

          rounded-2xl

          transition-all
        "
      >
        Generate AI Lesson
      </button>

      {loading && (

        <div className="mt-8">
          AI generating lesson...
        </div>
      )}

      {lesson && (

        <StoryReader
          lesson={lesson}
        />
      )}

    </div>
  );
}