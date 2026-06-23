export function generateExercises(story: { title: string; paragraphs: { id: number; text: string }[] }) {
  return [
    {
      type: "fill_blank",
      question: "When Ethan checked his _____ that morning...",
      answer: "phone",
      explanation: "The story mentions Ethan checking his phone.",
    },
    {
      type: "synonym",
      question: "Choose the closest meaning of 'strange'.",
      options: ["unusual", "happy", "boring", "safe"],
      answer: "unusual",
      explanation: "'Strange' means unusual or unexpected.",
    },
    {
      type: "paraphrase",
      question: "Rewrite the sentence using different wording.",
      original: "He noticed a strange message.",
      sampleAnswer: "He saw an unusual message.",
    },
    {
      type: "speaking",
      question: "Describe a time you received a strange message.",
    },
    {
      type: "shadowing",
      sentence: "At first, he assumed it was merely a prank.",
    },
  ];
}
