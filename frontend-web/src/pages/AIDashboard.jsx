import {
  useEffect,
  useState
} from "react";

import api
  from "../services/api";

export default function AIDashboard() {

  const [plan, setPlan] =
    useState(null);

  const fetchPlan =
    async () => {

      try {

        const response =
          await api.get(
            "/adaptive/plan"
          );

        setPlan(
          response.data
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {
    queueMicrotask(() => void fetchPlan());
  }, []);

  if (!plan) {

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
        py-12
      "
    >

      <h1
        className="
          text-5xl
          font-bold
          text-blue-400
        "
      >
        AI Learning Dashboard
      </h1>

      {/* weak vocab */}
      <section className="mt-12">

        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          Weak Vocabulary
        </h2>

        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-3
          "
        >

          {plan.weakWords.map(
            (word) => (

            <div
              key={word._id}

              className="
                px-4
                py-2

                rounded-full

                bg-red-500/20
                text-red-300
              "
            >
              {word.word}
            </div>
          ))}

        </div>

      </section>

      {/* recommended */}
      <section className="mt-12">

        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          Recommended Chapters
        </h2>

        <div
          className="
            mt-5
            grid
            gap-4
          "
        >

          {plan.recommendedChapters.map(
            (chapter) => (

            <div
              key={chapter.id}

              className="
                p-6

                rounded-3xl

                bg-slate-900
              "
            >

              <h3
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                {chapter.title}
              </h3>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
}