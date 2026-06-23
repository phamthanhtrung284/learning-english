const STORAGE_KEY = "englishStudio.wordLookup.v1";

export function readWordLookupCache(lemma: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data[lemma] ?? null;
  } catch {
    return null;
  }
}

export function writeWordLookupCache(lemma: string, entry: Record<string, string>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[lemma] = entry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function deleteWordLookupCache(lemma: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    delete data[lemma];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
