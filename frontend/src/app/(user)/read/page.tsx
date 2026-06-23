"use client";

import { useState, useCallback, useEffect } from "react";
import LightNovelLibrary from "@share/component/LightNovelLibrary";

export default function Page() {
  const [chapter, setChapter] = useState<unknown>(null);
  const [zenMode, setZenMode] = useState(false);

  const handleSelectChapter = useCallback((data: unknown) => {
    setChapter(data);
  }, []);

  // Hide the top navbar when in zen mode
  useEffect(() => {
    if (zenMode) {
      document.documentElement.classList.add("zen-active");
    } else {
      document.documentElement.classList.remove("zen-active");
    }
    return () => {
      document.documentElement.classList.remove("zen-active");
    };
  }, [zenMode]);

  return (
    <LightNovelLibrary
      chapter={chapter}
      onSelectChapter={handleSelectChapter}
      zenMode={zenMode}
      onZenModeChange={setZenMode}
    />
  );
}
