import InteractiveWord from "./InteractiveWord";

export default function StoryReader({ lesson }) {
  return (
    <div className="mt-10">
      {lesson.source && (
        <div className="surface-panel mb-10 px-5 py-4 text-sm text-slate-400">
          <div className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Source
          </div>
          <div className="mt-2">
            {lesson.source.url ? (
              <a
                href={lesson.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-400 underline decoration-indigo-500/35 underline-offset-2 transition hover:text-indigo-300"
              >
                {lesson.source.name}
              </a>
            ) : (
              <span className="text-slate-200">{lesson.source.name}</span>
            )}
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{lesson.source.license}</p>
          </div>
        </div>
      )}

      <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
        {lesson.title}
      </h2>

      <div className="mt-10 space-y-12">
        {lesson.paragraphs?.map((paragraph, paragraphIndex) => (
          <div key={paragraphIndex} className="surface-panel overflow-visible p-7 md:p-9">
            {paragraph.sentences?.map((sentence, sentenceIndex) => (
              <div key={sentenceIndex} className="mb-10 last:mb-0 overflow-visible">
                <div className="surface-panel relative overflow-visible p-6 md:p-8">
                  <div className="relative flex flex-wrap items-baseline gap-x-1 gap-y-1 text-[clamp(1.15rem,2.8vw,1.65rem)] font-medium leading-relaxed text-slate-100">
                    {sentence.words?.map((word, wordIndex) => (
                      <InteractiveWord
                        key={`${paragraphIndex}-${sentenceIndex}-${wordIndex}`}
                        wordData={word}
                      />
                    ))}
                  </div>
                </div>

                <div className="surface-panel mt-6 border-emerald-500/15 bg-gradient-to-br from-emerald-950/20 to-transparent p-6">
                  <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
                    Sentence meaning
                  </h3>
                  <p className="mt-3 text-[clamp(1rem,2.2vw,1.25rem)] leading-relaxed text-slate-200">
                    {sentence.translatedSentence}
                  </p>
                </div>
              </div>
            ))}

            {paragraph.translatedText ? (
              <div className="mt-8 border-t border-slate-700/45 pt-8 text-[15px] italic leading-relaxed text-slate-500">
                <span className="mb-2 block font-display text-[10px] font-semibold uppercase tracking-[0.2em] not-italic text-slate-600">
                  Paragraph translation
                </span>
                {paragraph.translatedText}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
