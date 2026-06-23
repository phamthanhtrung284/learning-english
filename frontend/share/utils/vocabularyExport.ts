interface ExportWord {
  word?: string;
  meaning?: string;
  explanation?: string;
  ipa?: string;
  type?: string;
}

function escapeCsvField(value: unknown): string {
  const v = String(value ?? "");
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function triggerDownload(filename: string, mime: string, body: string) {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportVocabularyCsv(words: ExportWord[]) {
  const rows = [
    ["word", "meaning_vi", "definition_en", "ipa", "pos"]
      .map(escapeCsvField)
      .join(","),
    ...words.map((w) =>
      [w.word, w.meaning, w.explanation, w.ipa, w.type]
        .map(escapeCsvField)
        .join(",")
    ),
  ];
  triggerDownload(
    "english-studio-vocabulary.csv",
    "text/csv;charset=utf-8",
    rows.join("\r\n")
  );
}

export function exportVocabularyAnkiTsv(words: ExportWord[]) {
  const lines = words.map((w) => {
    const front = String(w.word ?? "").replace(/\t/g, " ");
    const back = [w.meaning, w.explanation, w.ipa]
      .filter(Boolean)
      .join(" — ")
      .replace(/\t/g, " ");
    return `${front}\t${back}`;
  });
  triggerDownload(
    "english-studio-anki.txt",
    "text/plain;charset=utf-8",
    lines.join("\n")
  );
}

export function buildQuizletImportText(words: ExportWord[]): string {
  return words
    .map((w) => {
      const term = String(w.word ?? "");
      const def = [w.meaning, w.explanation].filter(Boolean).join(" · ");
      return `${term}\t${def}`;
    })
    .join("\n");
}
