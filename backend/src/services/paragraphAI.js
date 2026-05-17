export const analyzeParagraph = async (
  paragraphText
) => {

  return {
    translatedText:
      "Khi Ethan kiểm tra điện thoại vào sáng hôm đó, anh nhận thấy một tin nhắn từ số lạ.",

    words: [
      {
        text: "When",
        pos: "conjunction",

        meaning: "khi",

        ipa: "/wen/",

        explanation:
          "Dùng để mở đầu mệnh đề thời gian.",

        collocations: [
          "when I arrived",
          "when he called",
        ],

        native_nuance:
          "Rất phổ biến trong văn nói và viết.",

        linking_instruction:
          "Nối nhẹ với từ sau.",
      },

      {
        text: "Ethan",
        pos: "proper noun",

        meaning: "tên riêng Ethan",

        ipa: "/ˈiːθən/",

        explanation:
          "Tên nhân vật.",

        collocations: [],

        native_nuance:
          "Tên nam phổ biến ở phương Tây.",

        linking_instruction:
          "Nhấn trọng âm đầu.",
      },

      {
        text: "checked",
        pos: "verb",

        meaning: "kiểm tra",

        ipa: "/tʃekt/",

        explanation:
          "Động từ quá khứ của 'check'.",

        collocations: [
          "check the phone",
          "check the message",
        ],

        native_nuance:
          "Mang nghĩa kiểm tra nhanh.",

        linking_instruction:
          "Âm cuối /t/ nối sang từ tiếp theo.",
      },
      {
  text: "what the hell",

  pos: "expression",

  meaning:
    "cái quái gì vậy",

  ipa:
    "/wʌt ðə hel/",

  cefr: "C1",

  explanation:
    "Cụm cảm thán dùng để thể hiện sự ngạc nhiên hoặc khó chịu mạnh.",

  collocations: [
    "what the hell happened",
    "what the hell is going on"
  ],

  examples: [
    "What the hell are you doing?",
    "What the hell happened here?"
  ],

  native_nuance:
    "Informal, emotional, slightly rude.",

  linking_instruction:
    "'what the' thường nối rất nhanh thành /wʌdə/."
},

      {
        text: "his phone",
        pos: "noun phrase",

        meaning: "điện thoại của anh ấy",

        ipa: "/hɪz foʊn/",

        explanation:
          "Cụm danh từ sở hữu.",

        collocations: [
          "pick up his phone",
          "unlock his phone",
        ],

        native_nuance:
          "Cách diễn đạt tự nhiên hàng ngày.",

        linking_instruction:
          "'his' thường đọc nhanh.",
      }
    ]
  };
};