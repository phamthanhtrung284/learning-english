interface GlossaryEntry {
  meaning: string;
  ipa: string;
  pos: string;
  explanation: string;
  synonyms: string[];
  collocations: string[];
  native_nuance: string;
}

const g = (
  meaning: string,
  ipa: string,
  pos: string,
  explanation: string,
  synonyms: string[] = [],
  collocations: string[] = [],
  native_nuance: string = ""
): GlossaryEntry => ({
  meaning,
  ipa,
  pos,
  explanation,
  synonyms,
  collocations,
  native_nuance,
});

interface ChapterData {
  slug: string;
  readerTitle: string;
  chapterTitle: string;
  authorLine: string;
  blurb: string;
  source: {
    name: string;
    url: string;
    license: string;
  } | null;
  paragraphs: { en: string; vi: string }[];
  glossary: Record<string, GlossaryEntry>;
}

export const aliceVol1Ch1: ChapterData = {
  slug: "alice-v1-ch1",
  readerTitle: "Alice's Adventures in Wonderland",
  chapterTitle: "Vol.1 · Chapter 1 — Down the Rabbit-Hole (full chapter · learning edition)",
  authorLine: "Lewis Carroll · adaptation for learners",
  blurb:
    "Alice is tired of sitting by the river—then a White Rabbit, a tunnel, and a world where the rules of logic are optional.",
  source: {
    name: "Project Gutenberg — Alice's Adventures in Wonderland (verbatim text)",
    url: "https://www.gutenberg.org/ebooks/11",
    license:
      "Public domain in the United States. This chapter text is a faithful shortened adaptation for study; the complete novel is free at the link above.",
  },
  paragraphs: [
    { en: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do.", vi: "Alice bắt đầu cảm thấy rất mệt vì phải ngồi cạnh chị bên bờ sông, và vì chẳng có gì để làm." },
    { en: "Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.", vi: "Một lần hay hai cô thò nhìn vào quyển sách chị đang đọc, nhưng trong đó chẳng có tranh hay hội thoại." },
    { en: "And what is the use of a book, thought Alice, without pictures or conversations?", vi: "Và một cuốn sách thì có ích gì, Alice nghĩ, nếu không có tranh hay hội thoại?" },
    { en: "So she was considering in her own mind, as well as she could, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies.", vi: "Thế là cô tự hỏi trong đầu, cố hết sức, liệu niềm vui kết vòng hoa cúc có đáng công bật dậy hái hoa hay không." },
    { en: "When suddenly a White Rabbit with pink eyes ran close by her.", vi: "Bỗng một chú Thỏ Trắng mắt hồng chạy sát ngang qua cô." },
    { en: "There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself Oh dear! Oh dear! I shall be late!", vi: "Chẳng có gì quá lạ ở điều đó; Alice cũng chẳng thấy quá lạ khi nghe Thỏ lẩm bẩm Ôi trời! Ôi trời! Ta sẽ muộn mất!" },
    { en: "But when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet.", vi: "Nhưng khi Thỏ thật sự lôi một chiếc đồng hồ ra túi áo gi-lê, nhìn nó, rồi vội chạy tiếp, Alice bật đứng dậy." },
    { en: "For it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity she ran across the field after it.", vi: "Vì chợt loé trong đầu cô là chưa bao giờ thấy con thỏ nào có túi áo gi-lê hay đồng hồ để lôi ra, và cháy lòng tò mò, cô chạy qua đồng theo sau nó." },
    { en: "Fortunately she was just in time to see it pop down a large rabbit-hole under the hedge.", vi: "May mắn là cô vừa kịp thấy nó chui xuống một hang thỏ lớn dưới hàng rào cây." },
    { en: "Another moment gone how Alice would manage it she never considered, but in she went after it, never once considering how in the world she was to get out again.", vi: "Một khoảnh khắc nữa trôi qua, Alice chẳng kịp nghĩ làm sao để xoay sở, nhưng cô đã nhảy theo sau, chưa một lần nghĩ làm sao để ra lại." },
    { en: "The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.", vi: "Hang thỏ đi thẳng như một đường hầm một đoạn, rồi dốc đột xuống, dốc đến mức Alice chẳng kịp nghĩ dừng lại trước khi nhận ra mình đang rơi xuống một cái giếng rất sâu." },
    { en: "Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next.", vi: "Hoặc giếng rất sâu, hoặc cô rơi rất chậm, vì cô có đủ thời gian lúc rơi để nhìn quanh và tự hỏi chuyện gì sẽ đến tiếp theo." },
    { en: "First she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well and noticed that they were filled with cupboards and book-shelves.", vi: "Đầu tiên cô cố nhìn xuống đoán mình sắp tới đâu, nhưng tối quá chẳng thấy gì; rồi cô nhìn vách giếng và nhận ra chúng đầy tủ nhỏ và kệ sách." },
    { en: "Here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labeled ORANGE MARMALADE, but to her disappointment it was empty.", vi: "Chỗ này chỗ kia cô thấy bản đồ và tranh treo trên móc. Cô lấy xuống một lọ từ một kệ khi đi qua; nhãn ghi MỨT CAM, nhưng thất vọng thay, lọ trống không." },
    { en: "She did not like to drop the jar for fear of killing somebody underneath, so managed to put it into one of the cupboards as she fell past it.", vi: "Cô không muốn buông lọ vì sợ làm ai đó bên dưới bị thương, nên cố nhét nó vào một cái tủ khi rơi ngang qua." },
    { en: "Well, thought Alice to herself, after such a fall as this, I shall think nothing of tumbling downstairs! How brave they will all think me at home!", vi: "Chà, Alice tự nhủ, sau một cú rơi như thế này, mình sẽ chẳng thấy gì ghê khi lăn cầu thang nữa! Ở nhà họ sẽ khen mình can đảm biết bao!" },
    { en: "Poor little feet, she went on, who will put on your shoes and stockings for you now, dears? I shall be a great deal too far off to trouble myself about you.", vi: "Hai bàn chân bé nhỏ tội nghiệp, cô nói tiếp, ai sẽ mang giày và tất cho các em bây giờ? Mình sẽ ở quá xa để bận tâm về các em." },
    { en: "Presently she began again. I wonder how many miles I have fallen by this time? I must be getting somewhere near the centre of the earth.", vi: "Một lúc sau cô lại bắt đầu. Không biết giờ mình đã rơi bao nhiêu dặm? Hẳn là gần tới tâm trái đất rồi." },
    { en: "Let me see: that would be four thousand miles down, I think— for, you see, Alice had learned several things of this sort in her lessons in the schoolroom.", vi: "Để xem: chừng bốn nghìn dặm xuống, mình nghĩ vậy— vì, bạn thấy đấy, Alice đã học được vài điều kiểu này trong lớp." },
    { en: "Suddenly thump! thump! down she came upon a heap of sticks and dry leaves, and the fall was over.", vi: "Bỗng cốp! cốp! cô rơi xuống một đống cành khô và lá, và cú rơi chấm dứt." },
    { en: "Alice was not a bit hurt, and she jumped to her feet in a moment. She looked up, but it was all dark overhead; before her was another long passage, and the White Rabbit was still in sight, hurrying down it.", vi: "Alice chẳng hề đau, và nhảy bật dậy ngay. Cô nhìn lên, nhưng phía trên tối om; trước mặt là một hành lang dài khác, và Thỏ Trắng vẫn còn trong tầm mắt, vội vã chạy xuống đó." },
    { en: "There was not a moment to be lost. Away went Alice like the wind, and was just in time to hear it say, as it turned a corner, Oh my ears and whiskers, how late it is getting!", vi: "Không thể chậm trễ một giây. Alice lao đi như gió, vừa kịp nghe Thỏ nói khi quẹo góc: Ôi tai và ria của ta, trễ quá rồi!" },
    { en: "She was close behind it when she turned the corner, but the Rabbit was no longer to be seen. She found herself in a long, low hall, lit by a row of lamps hanging from the roof.", vi: "Cô sát ngay sau khi quẹo góc, nhưng Thỏ không còn thấy đâu. Cô thấy mình trong một sảnh dài trần thấp, được thắp bằng một dãy đèn treo từ mái." },
    { en: "There were doors all round the hall, but they were all locked; and when Alice had been all the way down one side and up the other, trying every door, she walked sadly down the middle, wondering how she was ever to get out again.", vi: "Xung quanh sảnh là những cánh cửa, nhưng tất cả đều khóa; khi Alice đi hết một bên rồi bên kia, thử từng cửa, cô buồn bã bước giữa sảnh, tự hỏi làm sao ra được." },
    { en: "Suddenly she came upon a little three-legged table, all made of solid glass. There was nothing on it except a tiny golden key, and Alice's first thought was that it might belong to one of the doors of the hall.", vi: "Bỗng cô thấy một chiếc bàn ba chân nhỏ, làm bằng kính đặc. Trên bàn chẳng có gì ngoài một chiếc chìa khóa vàng bé xíu, và ý nghĩ đầu tiên của Alice là nó có thể mở một trong các cánh cửa của sảnh." },
    { en: "But alas! either the locks were too large, or the key was too small, but at any rate it would not open any of them.", vi: "Nhưng than ôi! hoặc ổ khóa quá to, hoặc chìa khóa quá nhỏ, dù sao thì nó chẳng mở được cửa nào." },
    { en: "However, on the second time round, she came upon a low curtain she had not noticed before, and behind it was a little door about fifteen inches high.", vi: "Tuy nhiên, lần đi vòng thứ hai, cô thấy một tấm rèm thấp trước đó không để ý, và phía sau là một cánh cửa nhỏ chừng mười lăm inch." },
    { en: "She tried the little golden key in the lock, and to her great delight it fitted! Alice opened the door and found that it led into a small passage, not much larger than a rat-hole.", vi: "Cô thử chìa khóa vàng nhỏ trong ổ, và mừng rỡ thay, vừa khít! Alice mở cửa và thấy nó dẫn vào một lối đi nhỏ, chẳng lớn hơn hang chuột là mấy." },
    { en: "She knelt down and looked along the passage into the loveliest garden you ever saw. How she longed to get out of that dark hall, and wander about among those beds of bright flowers and those cool fountains!", vi: "Cô quỳ xuống nhìn dọc lối đi ra khu vườn xinh đẹp nhất từng thấy. Cô thèm được ra khỏi sảnh tối đó, đi lạc giữa những luống hoa rực rỡ và những đài phun nước mát lành!" },
    { en: "But she could not even get her head through the doorway. And even if my head would go through, thought poor Alice, it would be of very little use without my shoulders.", vi: "Nhưng cô chẳng nhét nổi cả đầu qua cửa. Và dù đầu lọt được, Alice tội nghiệp nghĩ, không có vai thì cũng chẳng ích gì." },
    { en: "Oh, how I wish I could shut up like a telescope! I think I could, if I only knew how to begin. For, you see, so many out-of-the-way things had happened lately that Alice had begun to think that very few things indeed were really impossible.", vi: "Ôi, ước gì mình thu nhỏ lại như kính vọng! Mình nghĩ là được, nếu biết bắt đầu từ đâu. Vì, bạn thấy đấy, dạo này chuyện lạ xảy ra nhiều đến nỗi Alice bắt đầu tin rằng chẳng còn mấy thứ là thật sự không thể." },
  ],
  glossary: {
    bank: g("bờ sông", "/bæŋk/", "noun", "River bank."),
    peeped: g("thò nhìn", "/piːpt/", "verb", "Looked secretly."),
    conversations: g("hội thoại", "/ˌkɒnvərˈseɪʃənz/", "noun", "Dialogue."),
    considering: g("cân nhắc", "/kənˈsɪdərɪŋ/", "verb", "Thinking about."),
    daisy: g("hoa cúc", "/ˈdeɪzi/", "noun", "Small white flower."),
    chain: g("vòng / chuỗi", "/tʃeɪn/", "noun", "Linked series."),
    remarkable: g("đáng chú ý", "/rɪˈmɑːrkəbl/", "adj", "Worthy of attention."),
    waistcoat: g("áo gi-lê", "/ˈweɪskoʊt/", "noun", "Sleeveless jacket."),
    pocket: g("túi (quần áo)", "/ˈpɒkɪt/", "noun", "Small cloth pouch."),
    hurried: g("vội vàng", "/ˈhɜːrid/", "verb", "Moved quickly."),
    curiosity: g("tò mò", "/ˌkjʊəriˈɒsəti/", "noun", "Desire to learn."),
    hedge: g("hàng rào cây", "/hɛdʒ/", "noun", "Row of shrubs."),
    rabbit: g("con thỏ", "/ˈræbɪt/", "noun", "Small mammal."),
    hole: g("hang / lỗ", "/hoʊl/", "noun", "Opening in the ground."),
    tunnel: g("đường hầm", "/ˈtʌnəl/", "noun", "Underground passage."),
    dipped: g("dốc xuống", "/dɪpt/", "verb", "Dropped at an angle."),
    well: g("giếng", "/wɛl/", "noun", "Deep hole for water."),
    cupboards: g("tủ (nhỏ)", "/ˈkʌbərdz/", "noun", "Storage cabinets."),
    shelves: g("kệ sách", "/ʃɛlvz/", "noun", "Flat storage boards."),
    labeled: g("dán nhãn", "/ˈleɪbəld/", "verb", "Marked with a label."),
    marmalade: g("mứt cam", "/ˈmɑːrməleɪd/", "noun", "Citrus jam."),
    disappointment: g("thất vọng", "/ˌdɪsəˈpɔɪntmənt/", "noun", "Sadness when hopes fail."),
    tumbling: g("lăn / ngã nhào", "/ˈtʌmblɪŋ/", "verb", "Falling rolling."),
    brave: g("can đảm", "/breɪv/", "adj", "Not afraid."),
    stockings: g("tất dài", "/ˈstɒkɪŋz/", "noun", "Close-fitting leg wear."),
    miles: g("dặm", "/maɪlz/", "noun", "Distance measure."),
    centre: g("tâm / trung tâm", "/ˈsɛntər/", "noun", "Middle point."),
    earth: g("trái đất", "/ɜːrθ/", "noun", "The planet."),
    thump: g("tiếng cốp", "/θʌmp/", "noun", "Heavy dull sound."),
    heap: g("đống", "/hiːp/", "noun", "Pile."),
    passage: g("lối đi / hành lang", "/ˈpæsɪdʒ/", "noun", "Corridor."),
    whiskers: g("ria mép", "/ˈwɪskərz/", "noun", "Facial hair on animals."),
    lamps: g("đèn", "/læmps/", "noun", "Light fixtures."),
    locked: g("bị khóa", "/lɒkt/", "verb", "Secured with a lock."),
    sadly: g("buồn bã", "/ˈsædli/", "adv", "In a sad way."),
    three: g("ba", "/θriː/", "num", "The number 3."),
    legged: g("có … chân", "/ˈlɛɡɪd/", "adj", "Having legs."),
    solid: g("đặc / rắn", "/ˈsɒlɪd/", "adj", "Not hollow."),
    glass: g("kính / thủy tinh", "/ɡlæs/", "noun", "Transparent material."),
    golden: g("bằng vàng / màu vàng", "/ˈɡoʊldən/", "adj", "Made of or like gold."),
    key: g("chìa khóa", "/kiː/", "noun", "Tool to open locks."),
    locks: g("ổ khóa", "/lɒks/", "noun", "Devices that secure doors."),
    curtain: g("tấm rèm", "/ˈkɜːrtən/", "noun", "Hanging fabric."),
    delight: g("niềm vui / thích thú", "/dɪˈlaɪt/", "noun", "Great pleasure."),
    fitted: g("vừa khít", "/ˈfɪtɪd/", "verb", "Matched size exactly."),
    rat: g("con chuột", "/ræt/", "noun", "Rodent."),
    knelt: g("quỳ", "/nɛlt/", "verb", "Past of kneel."),
    garden: g("khu vườn", "/ˈɡɑːrdən/", "noun", "Outdoor planted area."),
    wandered: g("đi lang thang", "/ˈwɒndərd/", "verb", "Walked without aim."),
    fountains: g("đài phun nước", "/ˈfaʊntɪnz/", "noun", "Water features."),
    doorway: g("khung cửa ra vào", "/ˈdɔːrweɪ/", "noun", "Door opening."),
    shoulders: g("vai", "/ˈʃoʊldərz/", "noun", "Body part."),
    telescope: g("kính thiên văn / thu nhỏ", "/ˈtɛlɪskoʊp/", "noun", "Optical device; metaphor shrink."),
    impossible: g("không thể", "/ɪmˈpɒsəbl/", "adj", "Cannot happen."),
    white: g("trắng", "/waɪt/", "adj", "Color."),
    sister: g("chị / em gái", "/ˈsɪstər/", "noun", "Female sibling."),
    pictures: g("tranh ảnh", "/ˈpɪktʃərz/", "noun", "Illustrations."),
    pleasure: g("niềm vui", "/ˈplɛʒər/", "noun", "Enjoyment."),
    trouble: g("rắc rối / công sức", "/ˈtrʌbəl/", "noun", "Difficulty or effort."),
    picking: g("hái / nhặt", "/ˈpɪkɪŋ/", "verb", "Choosing from a group."),
    suddenly: g("bỗng nhiên", "/ˈsʌdənli/", "adv", "Without warning."),
    watch: g("đồng hồ", "/wɒtʃ/", "noun", "Timepiece worn on body."),
    burning: g("cháy bỏng / rực lên", "/ˈbɜːrnɪŋ/", "adj", "Intense feeling."),
    field: g("cánh đồng", "/fiːld/", "noun", "Open land."),
    fortunately: g("may mắn là", "/ˈfɔːrtʃənətli/", "adv", "Luckily."),
    pop: g("chui / bật", "/pɒp/", "verb", "Go quickly into."),
  },
};
