import { academyVol1Ch1 } from "./academyVol1Ch1.js";
import { aliceVol1Ch1 } from "./aliceVol1Ch1.js";
import { ozVol1Ch1 } from "./ozVol1Ch1.js";

export const WEB_LIGHT_NOVEL_SERIES = [
  {
    id: "academy-original",
    displayTitle: "Offline Mode at the Academy",
    author: "Original · English learning edition",
    tagline: "Game-lit academy · Vol.1 ongoing",
    accent: "from-fuchsia-500 via-purple-500 to-indigo-600",
    coverEmoji: "🎮",
    chapters: [
      {
        id: "academy-v1-ch1",
        label: "Vol.1 · Chapter 1 — Syllabus.exe · full chapter",
        chapter: academyVol1Ch1,
      },
    ],
  },
  {
    id: "alice-gutenberg",
    displayTitle: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll (public domain)",
    tagline: "Classic fantasy · Vol.1",
    accent: "from-amber-400 via-orange-400 to-rose-500",
    coverEmoji: "🐇",
    chapters: [
      {
        id: "alice-v1-ch1",
        label: "Vol.1 · Chapter 1 — Down the Rabbit-Hole · full chapter",
        chapter: aliceVol1Ch1,
      },
    ],
  },
  {
    id: "oz-gutenberg",
    displayTitle: "The Wonderful Wizard of Oz",
    author: "L. Frank Baum (public domain)",
    tagline: "American fairy tale · Vol.1",
    accent: "from-emerald-400 via-teal-500 to-cyan-600",
    coverEmoji: "🌪️",
    chapters: [
      {
        id: "oz-v1-ch1",
        label: "Vol.1 · Chapter 1 — The Cyclone · full chapter",
        chapter: ozVol1Ch1,
      },
    ],
  },
];
