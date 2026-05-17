import {
  useEffect,
  useState,
} from "react";

import api
  from "../services/api";

export default function ExercisePanel() {

  const [
    exercises,
    setExercises
  ] = useState([]);

  const fetchExercises =
    async () => {

      try {

        const response =
          await api.get(
            "/exercises/c1/chapter/1"
          );

        setExercises(
          response.data
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {
    queueMicrotask(() => void fetchExercises());
  }, []);

  return (
    <div
      className="
        mt-20
        space-y-6
      "
    >

      <h2
        className="
          text-4xl
          font-bold
          text-white
        "
      >
        Exercises
      </h2>

      {exercises.map(
        (
          exercise,
          index
        ) => (

        <div
          key={index}

          className="
            bg-slate-900

            border
            border-slate-800

            rounded-3xl
            p-6
          "
        >

          {/* type */}
          <div
            className="
              inline-block

              px-3
              py-1

              rounded-full

              bg-blue-500/20
              text-blue-300

              text-sm
            "
          >
            {exercise.type}
          </div>

          {/* question */}
          <h3
            className="
              mt-4
              text-xl
              text-white
              font-semibold
            "
          >
            {exercise.question}
          </h3>

          {/* options */}
          {exercise.options && (

            <div
              className="
                mt-5
                grid
                gap-3
              "
            >

              {exercise.options.map(
                (
                  option,
                  optionIndex
                ) => (

                <button
                  key={optionIndex}

                  className="
                    text-left

                    p-4

                    rounded-2xl

                    bg-slate-800
                    hover:bg-slate-700

                    transition-all
                  "
                >
                  {option}
                </button>
              ))}

            </div>
          )}

        </div>
      ))}

    </div>
  );
}