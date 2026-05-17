import axios
  from "axios";


export const generateStoryLesson =
  async ({
    level,
    topic
  }) => {

  const prompt = `

You are an elite English teacher.

Generate a C1/C2 English learning lesson.

Requirements:

- Topic: ${topic}
- Level: ${level}

Return ONLY valid JSON.

Structure:

{
  "title": "",
  "story": "",
  "translatedStory": "",

  "vocabulary": [
    {
      "word": "",
      "meaning": "",
      "example": ""
    }
  ],

  "grammarFocus": [
    {
      "topic": "",
      "explanation": ""
    }
  ],

  "questions": [
    {
      "question": "",
      "choices": [],
      "answer": ""
    }
  ]
}

Rules:

- Story must feel natural.
- Use advanced C1/C2 vocabulary.
- Include idioms and phrasal verbs.
- Grammar explanations must be concise.
- Questions must test comprehension deeply.

IMPORTANT:

You MUST tokenize the story.

Return:
"words": []

Each token:
{
  "text": "",
  "meaning": "",
  "ipa": "",
  "pos": "",
  "explanation": ""
}

Rules for tokenization:

- A token may be:
  - single word
  - phrasal verb
  - idiom
  - fixed expression

- NEVER split:
  - phrasal verbs
  - idioms
  - collocations
  - fixed expressions

Examples:

CORRECT:
"looking forward to"

WRONG:
"looking"
"forward"
"to"

CORRECT:
"by no means"

WRONG:
"by"
"no"
"means"

Each token must include:
- contextual Vietnamese meaning
- IPA
- grammatical role
- short native explanation
`;


  const response =
    await axios.post(

      "https://openrouter.ai/api/v1/chat/completions",

      {

        model:
          "google/gemma-3-27b-it:free",

        messages: [

          {
            role: "system",
            content:
              "You are an elite English curriculum designer."
          },

          {
            role: "user",
            content: prompt
          }
        ]
      },

      {
        headers: {

          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json"
        }
      }
    );

  const rawText =
    response.data
      .choices[0]
      .message
      .content;

  return JSON.parse(rawText);
};