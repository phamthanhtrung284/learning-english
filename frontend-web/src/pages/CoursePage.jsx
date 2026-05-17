import {
  useEffect,
  useState,
} from "react";

import api
  from "../services/api";
import ExercisePanel
  from "../components/ExercisePanel";
export default function CoursePage() {

  const [course, setCourse] =
    useState(null);

  const fetchCourse =
    async () => {

      try {

        const response =
          await api.get(
            "/courses/c1"
          );

        setCourse(
          response.data
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {
    queueMicrotask(() => void fetchCourse());
  }, []);

  if (!course) {

    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <div
      className="
        max-w-6xl
        mx-auto
        py-16
      "
    >

      {/* title */}
      <h1
        className="
          text-5xl
          font-bold
          text-blue-400
        "
      >
        {course.title}
      </h1>

      {/* description */}
      <p
        className="
          mt-5
          text-gray-400
          text-lg
        "
      >
        {course.description}
      </p>

      {/* chapters */}
      <div
        className="
          mt-14
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        "
      >

        {course.chapters.map(
          (chapter) => (

          <div
            key={chapter.id}

            className="
              bg-slate-900
              border
              border-slate-800

              rounded-3xl
              p-6

              hover:border-blue-500
              transition-all
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              {chapter.title}
            </h2>

            {/* grammar */}
            <div className="mt-5">

              <p
                className="
                  text-sm
                  text-gray-400
                "
              >
                Grammar Focus
              </p>

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mt-2
                "
              >

                {chapter.grammarFocus.map(
                  (
                    item,
                    index
                  ) => (

                  <div
                    key={index}

                    className="
                      px-3
                      py-1

                      rounded-full

                      bg-purple-500/20
                      text-purple-300

                      text-sm
                    "
                  >
                    {item}
                  </div>
                ))}

              </div>

            </div>

            {/* vocab */}
            <div className="mt-5">

              <p
                className="
                  text-sm
                  text-gray-400
                "
              >
                Vocabulary Focus
              </p>

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mt-2
                "
              >

                {chapter.vocabularyFocus.map(
                  (
                    item,
                    index
                  ) => (

                  <div
                    key={index}

                    className="
                      px-3
                      py-1

                      rounded-full

                      bg-blue-500/20
                      text-blue-300

                      text-sm
                    "
                  >
                    {item}
                  </div>
                ))}
<ExercisePanel />
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}