const STORAGE_KEY = "es-ui-theme";

export function readStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "night" ? "night" : "day";
  } catch {
    return "day";
  }
}

export function writeStoredTheme(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
