"use client";

import InteractiveWord from "./InteractiveWord";
import { splitParagraphToSentences } from "@share/utils/splitParagraphToSentences";

interface SentenceData {
  words: Array<{
    word: string;
    meaning: string;
    ipa: string;
    pos: string;
    explanation: string;
    fromGlossary: boolean;
  }>;
  translation: string;
}

interface ParagraphData {
  en: string;
  vi: string;
  sentences: SentenceData[];
}

interface StoryData {
  source: string;
  title: string;
  paragraphs: ParagraphData[];
}

export default function StoryReader({ data }: { data: StoryData }) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
          {data.source}
        </p>
        <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-[var(--text)]">
          {data.title}
        </h1>
      </div>

      {data.paragraphs.map((para, pi) => (
        <div key={pi} className="space-y-4">
          {para.sentences && para.sentences.length > 0 ? (
            para.sentences.map((sent, si) => (
              <p
                key={si}
                className="text-base leading-relaxed tracking-wide text-[var(--text)]"
              >
                {sent.words.map((w, wi) => (
                  <InteractiveWord
                    key={wi}
                    wordData={{
                      text: w.word,
                      fromGlossary: w.fromGlossary,
                      meaning: w.meaning,
                      ipa: w.ipa,
                      pos: w.pos,
                      explanation: w.explanation,
                    }}
                  />
                ))}
              </p>
            ))
          ) : (
            <p className="text-base leading-relaxed tracking-wide text-[var(--text)]">
              {splitParagraphToSentences(para.en).map((s, i) => (
                <span key={i} className="mr-1">
                  {s}
                </span>
              ))}
            </p>
          )}

          {para.vi && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
              <p className="text-sm italic leading-relaxed text-[var(--text-soft)]">
                {para.vi}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
