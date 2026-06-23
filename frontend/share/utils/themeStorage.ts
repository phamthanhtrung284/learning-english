const STORAGE_KEY = "es-ui-theme";

export function readStoredTheme(): "day" | "night" {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "night" ? "night" : "day";
  } catch {
    return "day";
  }
}

export function writeStoredTheme(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
