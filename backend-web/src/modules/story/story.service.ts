import fs from "fs";
import path from "path";

export async function getStory(level: string, id: string) {
  const rootPath = path.resolve();
  const storyPath = path.join(
    rootPath,
    "..",
    "stories",
    level.toLowerCase(),
    `story-${id}.json`
  );

  const storyData = fs.readFileSync(storyPath, "utf-8");
  return JSON.parse(storyData);
}

export async function listStories() {
  const rootPath = path.resolve();
  const storiesBase = path.join(rootPath, "..", "stories");

  if (!fs.existsSync(storiesBase)) {
    return [];
  }

  const levels = fs.readdirSync(storiesBase, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const result: { level: string; id: string; title?: string }[] = [];

  for (const level of levels) {
    const levelPath = path.join(storiesBase, level);
    const files = fs.readdirSync(levelPath).filter((f) => f.startsWith("story-") && f.endsWith(".json"));

    for (const file of files) {
      const id = file.replace("story-", "").replace(".json", "");
      try {
        const content = JSON.parse(fs.readFileSync(path.join(levelPath, file), "utf-8"));
        result.push({ level, id, title: content.title });
      } catch {
        result.push({ level, id });
      }
    }
  }

  return result;
}
