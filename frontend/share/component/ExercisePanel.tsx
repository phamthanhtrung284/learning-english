"use client";

import { useEffect, useState } from "react";
import api from "@share/services/api";

interface Exercise {
  type: string;
  question: string;
  options?: string[];
}

export default function ExercisePanel() {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    api
      .get("/exercises/c1/chapter/1")
      .then(({ data }) => setExercises(data))
      .catch(() => {});
  }, []);

  return (
    <div className="mt-20 space-y-6">
      <h2 className="text-4xl font-bold text-white">Exercises</h2>
      {exercises.map((exercise, index) => (
        <div
          key={index}
          className="border border-slate-800 rounded-3xl bg-slate-900 p-6"
        >
          <div className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
            {exercise.type}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">
            {exercise.question}
          </h3>
          {exercise.options && (
            <div className="mt-5 grid gap-3">
              {exercise.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  className="rounded-2xl bg-slate-800 p-4 text-left transition-all hover:bg-slate-700"
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
