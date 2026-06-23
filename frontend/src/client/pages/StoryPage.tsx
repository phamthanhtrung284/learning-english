"use client";

import { useState } from "react";
import api from "@share/services/api";
import InteractiveWord from "@share/component/InteractiveWord";

export default function StoryPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<Record<string, unknown> | null>(null);

  const generateLesson = async () => {
    if (!topic.trim()) return;
    try {
      setLoading(true);
      const response = await api.post("/ai/generate-lesson", { topic, level: "C2" });
      setLesson(response.data);
    } catch (error) {
      console.log(error);
      alert("Generate lesson lỗi");
    } finally {
      setLoading(false);
    }
  };

  const lessonData = lesson as {
    title?: string;
    paragraphs?: {
      sentences?: {
        words?: { text: string; meaning: string; ipa: string; pos: string; explanation: string }[];
      }[];
      translatedText?: string;
    }[];
  } | null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-blue-400">C2 Story Reader</h1>
        <p className="mt-4 text-gray-400">AI-generated native stories.</p>

        <div className="mt-10 flex gap-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ví dụ: Cyberpunk detective"
            className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none focus:border-blue-500"
          />
          <button
            onClick={generateLesson}
            disabled={loading}
            className="px-8 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-bold disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {lessonData && (
          <div className="mt-12">
            <h2 className="text-4xl font-bold text-yellow-400">{lessonData.title}</h2>

            <div className="mt-10 space-y-10">
              {lessonData.paragraphs?.map((paragraph, paragraphIndex) => (
                <div key={paragraphIndex} className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                  <div className="text-2xl leading-loose flex flex-wrap">
                    {paragraph.sentences?.map((sentence, sentenceIndex) => (
                      <div key={sentenceIndex} className="inline">
                        {sentence.words?.map((word, wordIndex) => (
                          <InteractiveWord
                            key={wordIndex}
                            wordData={{
                              text: word.text,
                              fromGlossary: false,
                              meaning: word.meaning || "",
                              ipa: word.ipa || "",
                              pos: word.pos || "",
                              explanation: word.explanation || "",
                              synonyms: [],
                              collocations: [],
                              native_nuance: "",
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 bg-green-950 border border-green-800 rounded-2xl p-5">
                    <div className="text-green-400 font-bold text-lg">Nghĩa đoạn văn</div>
                    <div className="mt-3 text-gray-300 italic text-xl leading-relaxed">
                      {paragraph.translatedText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
