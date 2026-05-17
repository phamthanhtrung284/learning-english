export const generateExercises =
  (story) => {

  return [

    // FILL BLANK
    {
      type: "fill_blank",

      question:
        "When Ethan checked his _____ that morning...",

      answer:
        "phone",

      explanation:
        "The story mentions Ethan checking his phone."
    },

    // VOCAB
    {
      type: "synonym",

      question:
        "Choose the closest meaning of 'strange'.",

      options: [
        "unusual",
        "happy",
        "boring",
        "safe"
      ],

      answer:
        "unusual",

      explanation:
        "'Strange' means unusual or unexpected."
    },

    // PARAPHRASE
    {
      type: "paraphrase",

      question:
        "Rewrite the sentence using different wording.",

      original:
        "He noticed a strange message.",

      sampleAnswer:
        "He saw an unusual message."
    },

    // SPEAKING
    {
      type: "speaking",

      question:
        "Describe a time you received a strange message."
    },

    // SHADOWING
    {
      type: "shadowing",

      sentence:
        "At first, he assumed it was merely a prank."
    }
  ];
};