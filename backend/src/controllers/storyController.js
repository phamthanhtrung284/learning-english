import fs from "fs";
import path from "path";

export const getStory = async (req, res) => {
  try {
    const { level, id } = req.params;

    // ROOT PROJECT
    const rootPath = path.resolve();

    // PATH TO STORY
    const storyPath = path.join(
      rootPath,
      "..",
      "stories",
      level.toLowerCase(),
      `story-${id}.json`
    );

    const storyData = fs.readFileSync(
      storyPath,
      "utf-8"
    );

    const story = JSON.parse(storyData);

    res.json(story);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Cannot load story",
    });
  }
};