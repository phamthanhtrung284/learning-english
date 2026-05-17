/**
 * Vol.1 Chapter 1 — narrative adapted from The Wonderful Wizard of Oz (L. Frank Baum).
 * Full reading unit. Verbatim long text lives on Project Gutenberg.
 */

const g = (meaning, ipa, pos, explanation, synonyms = [], collocations = [], native_nuance = "") => ({
  meaning,
  ipa,
  pos,
  explanation,
  synonyms,
  collocations,
  native_nuance,
});

export const ozVol1Ch1 = {
  slug: "oz-v1-ch1",
  readerTitle: "The Wonderful Wizard of Oz",
  chapterTitle: "Vol.1 · Chapter 1 — The Cyclone (full chapter · learning edition)",
  authorLine: "L. Frank Baum · adaptation for learners",
  blurb:
    "Dorothy, Toto, and a cyclone lift the whole house out of Kansas—the start of a journey with no passport.",
  source: {
    name: "Project Gutenberg — The Wonderful Wizard of Oz",
    url: "https://www.gutenberg.org/ebooks/55",
    license:
      "Public domain in the United States. This is a shortened faithful adaptation for study; read the complete novel at the link.",
  },
  paragraphs: [
    {
      en: "Dorothy lived in the midst of the great Kansas prairies with Uncle Henry, who was a farmer, and Aunt Em, who was the farmer's wife.",
      vi: "Dorothy sống giữa thảo nguyên Kansas bao la cùng chú Henry, một người nông dân, và dì Em, vợ người nông dân đó.",
    },
    {
      en: "Their house was small, for the lumber to build it had to be carried by wagon many miles. There were four walls, a floor and a roof, which made one room.",
      vi: "Nhà họ nhỏ, vì gỗ dựng nhà phải chở bằng xe bò hàng nhiều dặm. Bốn vách, một sàn, một mái — gom thành một căn phòng.",
    },
    {
      en: "There were the churning machine and a washing machine, a cupboard, a table, three or four chairs, and the beds. Uncle Henry and Aunt Em had a big bed in one corner, and Dorothy a little bed in another corner.",
      vi: "Có máy khuấy bơ và máy giặt, một tủ, một bàn, ba bốn ghế, và giường. Chú Henry và dì Em có giường lớn một góc, Dorothy có giường nhỏ một góc khác.",
    },
    {
      en: "There was no cellar except a small hole dug in the ground, called a cyclone cellar, where the family could go in case one of those great whirlwinds arose, mighty enough to crush any building in its path.",
      vi: "Không có tầng hầm ngoài một hố nhỏ đào dưới đất, gọi là hầm tránh lốc, nơi cả nhà chạy xuống khi một trong những cơn lốc xoáy lớn nổi lên, đủ sức nghiền nát nhà cửa trên đường nó đi.",
    },
    {
      en: "It was reached by a trap door in the middle of the floor, from which a ladder led down into the small, dark hole.",
      vi: "Xuống hầm bằng một cửa sập giữa sàn, từ đó thang dẫn xuống cái hố nhỏ tối om.",
    },
    {
      en: "When Dorothy stood in the doorway and looked around, she could see nothing but the great gray prairie on every side. Not a tree nor a house broke the broad sweep of flat country.",
      vi: "Khi Dorothy đứng ở cửa nhìn quanh, cô chỉ thấy thảo nguyên xám bạt ngàn mọi phía. Chẳng cây chẳng nhà cắt ngang cánh đồng phẳng lì.",
    },
    {
      en: "The sun had baked the plowed land into a gray mass, with little cracks running through it. Even the grass was not green, for the sun had burned the tops off the blades until they looked as gray as everything else.",
      vi: "Mặt trời rang đất cày thành khối xám, nứt chân chim. Cỏ cũng chẳng xanh, vì nắng thiêu đỉnh lá đến nỗi chúng xám như mọi thứ khác.",
    },
    {
      en: "Once the house had been painted, but the sun blistered the paint and the rains washed it away, and now the house was as dull and gray as everything else.",
      vi: "Nhà từng được sơn, nhưng nắng làm bong sơn mưa rửa trôi, giờ nhà xám xịt như mọi thứ xung quanh.",
    },
    {
      en: "When Aunt Em came there to live she was a young, pretty wife. The sun and wind had changed her, too. They had taken the sparkle from her eyes and left them a sober gray.",
      vi: "Khi dì Em về đây sống, bà còn là người vợ trẻ xinh. Gió nắng cũng đổi bà. Chúng lấy mất ánh lấp lánh trong mắt bà, chỉ còn xám trầm.",
    },
    {
      en: "They had taken the red from her cheeks and lips, and they were pale also. She was thin and gaunt, and never smiled now.",
      vi: "Chúng lấy hồng trên má và môi bà, giờ nhợt nhạt. Bà gầy gò, và không còn cười.",
    },
    {
      en: "When Dorothy, who was an orphan, first came to her, Aunt Em had been so startled by the child's laughter that she would scream and press her hand upon her heart whenever Dorothy's merry voice reached her ears.",
      vi: "Khi Dorothy, một đứa trẻ mồ côi, mới về với bà, dì Em hoảng đến nỗi khi nghe tiếng cười của đứa bé là la lên và ôm ngực mỗi khi giọng vui của Dorothy vọng tới tai.",
    },
    {
      en: "Now she did not know what to make of the little girl, and looked at her with a wondering gaze that tried to discover what the joke was.",
      vi: "Giờ bà chẳng hiểu nổi cô bé, cứ nhìn cô với ánh mắt thắc mắc như tìm xem trò đùa ở đâu.",
    },
    {
      en: "Uncle Henry never laughed. He worked hard from morning till night and did not know what joy was. He was gray also, from his long beard to his rough boots, and he looked stern and solemn, rarely speaking.",
      vi: "Chú Henry không bao giờ cười. Chú làm việc cật lực từ sáng đến tối và chẳng biết vui là gì. Chú cũng xám, từ râu dài đến ủng thô, trông nghiêm nghị hiếm khi nói.",
    },
    {
      en: "It was Toto who made Dorothy laugh, and saved her from growing as gray as her other surroundings. Toto was not gray; he was a little black dog, with long silky hair and small black eyes that twinkled merrily on either side of his funny, wee nose.",
      vi: "Toto mới làm Dorothy cười, và cứu cô khỏi xám như môi trường quanh cô. Toto không xám; nó là chú chó đen nhỏ, lông mượt mắt đen lấp lánh hai bên cái mũi ngộ nghĩnh.",
    },
    {
      en: "Toto played all day long, and Dorothy played with him, and loved him dearly. To-day, as they played, Dorothy ran into the house to help Aunt Em make the cakes for supper.",
      vi: "Toto chơi cả ngày, Dorothy chơi với nó và yêu nó hết mực. Hôm nay, khi đang chơi, Dorothy chạy vào nhà giúp dì Em làm bánh cho bữa tối.",
    },
    {
      en: "From the far north they heard a low wail of the wind, and Uncle Henry and Dorothy could see where the long grass bowed in waves before the coming storm.",
      vi: "Từ phương bắc xa vọng lại tiếng gió rít thấp, chú Henry và Dorothy thấy cỏ dài cúi thành sóng trước cơn bão đang tới.",
    },
    {
      en: "There came a sharp whistling in the air overhead, and Aunt Em became very much afraid. She called to the men working in the fields, and they ran in just as the storm broke.",
      vi: "Trên không vút tiếng huýt sắc, dì Em hoảng lắm. Bà gọi mấy người đang làm đồng, họ chạy vào đúng lúc bão ập xuống.",
    },
    {
      en: "Uncle Henry ran toward the house to join his wife, and Dorothy caught Toto in her arms and followed her uncle. When they reached the door, the wind was so strong that it nearly pushed them over.",
      vi: "Chú Henry chạy về nhà tìm vợ, Dorothy ôm Toto chạy theo chú. Tới cửa, gió mạnh gần như thổi họ ngã.",
    },
    {
      en: "They had to hold their hats tight with both hands, while the wind shrieked around them. Trees bent and cracked, boards flew from the roof, and the windows rattled as if they would break.",
      vi: "Họ phải giữ chặt mũ bằng hai tay, gió rít quanh họ. Cây cúi nứt, ván bay khỏi mái, cửa sổ lách cách như sắp vỡ.",
    },
    {
      en: "Aunt Em dropped her work and came to the door. One glance showed her the danger close at hand. Quick! she screamed. Run for the cellar!",
      vi: "Dì Em buông việc chạy ra cửa. Một cái liếc là thấy nguy hiểm sát nơi. Nhanh! bà la. Xuống hầm!",
    },
    {
      en: "Toto jumped out of Dorothy's arms and hid under the bed, and the girl started to get him. Aunt Em, badly frightened, threw open the trap door in the floor and climbed down the ladder into the small, dark hole.",
      vi: "Toto nhảy khỏi tay Dorothy chui dưới gầm giường, cô bé định bắt nó. Dì Em hoảng hốt mở bật cửa sập sàn rồi leo thang xuống hố tối nhỏ.",
    },
    {
      en: "Dorothy caught one corner of the table as she was carried past it, but the wind lifted her into the air with a shriek that sounded in her ears like a wild cry.",
      vi: "Dorothy vớ được một góc bàn khi bị cuốn qua, nhưng gió nhấc cô lên không trung cùng tiếng rít như tiếng kêu hoang dại bên tai.",
    },
    {
      en: "Higher and higher she rose until she could see nothing but swirling gray clouds beneath her, and the house spun slowly beneath her feet like a boat in a whirlpool.",
      vi: "Cô bay cao dần đến khi chỉ còn thấy mây xám cuộn bên dưới, ngôi nhà quay chậm dưới chân như thuyền trong xoáy nước.",
    },
    {
      en: "Then a wall of darkness closed around her, and she shut her eyes against the dizzy speed, still clutching Toto, who had leaped into her arms at the last second.",
      vi: "Rồi một bức tường tối bao quanh, cô nhắm mắt chống lại cảm giác chóng mặt, vẫn ôm chặt Toto — nó nhảy vào tay cô giây cuối cùng.",
    },
    {
      en: "Hours passed, or so it seemed, until the motion gentled and the house settled with a long, tired creak. Dorothy opened her eyes and saw soft green light falling through the window.",
      vi: "Trôi qua hàng giờ, ít ra là vậy, cho đến khi chuyển động dịu xuống và nhà hạ bệ kèm tiếng cót két mỏi mệt. Dorothy mở mắt thấy ánh xanh nhẹ rơi qua cửa sổ.",
    },
    {
      en: "Outside was a country she did not know, with strange trees and a road of yellow brick winding into the distance. The cyclone had set her down at the edge of a story she had not finished reading yet.",
      vi: "Bên ngoài là một vùng đất cô chưa từng biết, cây lạ, con đường gạch vàng uốn vào xa. Cơn lốc đặt cô xuống mép một câu chuyện cô chưa đọc hết.",
    },
  ],
  glossary: {
    prairies: g("thảo nguyên", "/ˈpreəriz/", "noun", "Wide grasslands.", [], [], ""),
    farmer: g("nông dân", "/ˈfɑːrmər/", "noun", "Person who farms.", [], [], ""),
    lumber: g("gỗ xẻ", "/ˈlʌmbər/", "noun", "Timber for building.", [], [], ""),
    wagon: g("xe bò / xe ngựa", "/ˈwæɡən/", "noun", "Farm cart.", [], [], ""),
    cupboard: g("tủ bếp", "/ˈkʌbərd/", "noun", "Storage cabinet.", [], [], ""),
    churning: g("khuấy (bơ)", "/ˈtʃɜːrnɪŋ/", "adj", "Making butter by agitation.", [], [], ""),
    cyclone: g("lốc xoáy", "/ˈsaɪkloʊn/", "noun", "Violent rotating storm.", [], [], ""),
    whirlwinds: g("vòi rồng / gió xoáy", "/ˈwɜːrlwɪndz/", "noun", "Spinning columns of air.", [], [], ""),
    trap: g("cửa sập", "/træp/", "noun", "Hinged door in floor.", [], ["trap door"], ""),
    ladder: g("thang", "/ˈlædər/", "noun", "Climbing steps.", [], [], ""),
    plowed: g("đã cày", "/plaʊd/", "verb", "Turned soil for crops.", [], [], ""),
    blades: g("lá cỏ / lưỡi", "/bleɪdz/", "noun", "Grass leaves here.", [], [], ""),
    blistered: g("làm bong / phồng rộp", "/ˈblɪstərd/", "verb", "Raised blisters on surface.", [], [], ""),
    sparkle: g("ánh lấp lánh", "/ˈspɑːrkəl/", "noun", "Small flashes of light.", [], [], ""),
    sober: g("trầm / tỉnh", "/ˈsoʊbər/", "adj", "Serious, not bright.", [], [], ""),
    gaunt: g("hốc hác", "/ɡɔːnt/", "adj", "Very thin.", [], [], ""),
    orphan: g("trẻ mồ côi", "/ˈɔːrfən/", "noun", "Child without parents.", [], [], ""),
    startled: g("giật mình", "/ˈstɑːrtld/", "verb", "Surprised suddenly.", [], [], ""),
    scream: g("la hét", "/skriːm/", "verb", "Cry out loudly in fear.", [], [], ""),
    merry: g("vui vẻ", "/ˈmɛri/", "adj", "Cheerful.", [], [], ""),
    solemn: g("trang nghiêm", "/ˈsɒləm/", "adj", "Serious and formal.", [], [], ""),
    silky: g("mượt như lụa", "/ˈsɪlki/", "adj", "Smooth and soft.", [], [], ""),
    twinkled: g("lấp lánh", "/ˈtwɪŋkəld/", "verb", "Shone intermittently.", [], [], ""),
    dearly: g("hết mực / thân thương", "/ˈdɪrli/", "adv", "With deep affection.", [], [], ""),
    cakes: g("bánh (nướng)", "/keɪks/", "noun", "Baked sweet goods.", [], [], ""),
    supper: g("bữa tối", "/ˈsʌpər/", "noun", "Evening meal.", [], [], ""),
    wail: g("tiếng rít / than", "/weɪl/", "noun", "Long mournful sound.", [], [], ""),
    bowed: g("cúi / oằn", "/boʊd/", "verb", "Bent under pressure.", [], [], ""),
    whistling: g("tiếng huýt", "/ˈwɪsəlɪŋ/", "noun", "High sound of wind.", [], [], ""),
    shrieked: g("rít / la", "/ʃriːkt/", "verb", "Screamed sharply.", [], [], ""),
    rattled: g("lách cách", "/ˈrætəld/", "verb", "Shook with noise.", [], [], ""),
    glance: g("cái liếc", "/ɡlæns/", "noun", "Quick look.", [], [], ""),
    cellar: g("hầm", "/ˈsɛlər/", "noun", "Underground room.", [], [], ""),
    clutching: g("ôm chặt", "/ˈklʌtʃɪŋ/", "verb", "Gripping tightly.", [], [], ""),
    leaped: g("nhảy", "/liːpt/", "verb", "Jumped.", [], [], ""),
    swirling: g("cuộn xoáy", "/ˈswɜːrlɪŋ/", "adj", "Moving in spirals.", [], [], ""),
    whirlpool: g("xoáy nước", "/ˈwɜːrlpuːl/", "noun", "Spinning water.", [], [], ""),
    dizzy: g("chóng mặt", "/ˈdɪzi/", "adj", "Feeling of spinning.", [], [], ""),
    brick: g("gạch", "/brɪk/", "noun", "Baked clay block.", [], ["yellow brick road"], ""),
    winding: g("uốn khúc", "/ˈwaɪndɪŋ/", "adj", "Following curves.", [], [], ""),
    distance: g("phía xa", "/ˈdɪstəns/", "noun", "Far space.", [], [], ""),
    motion: g("chuyển động", "/ˈmoʊʃən/", "noun", "Movement.", [], [], ""),
    gentled: g("dịu đi", "/ˈdʒɛntəld/", "verb", "Became gentle.", [], [], ""),
    creak: g("cót két", "/kriːk/", "noun", "Squeaking sound.", [], [], ""),
    strange: g("lạ", "/streɪndʒ/", "adj", "Unfamiliar.", [], [], ""),
    edge: g("rìa / mép", "/ɛdʒ/", "noun", "Border.", [], [], ""),
    storm: g("bão", "/stɔːrm/", "noun", "Violent weather.", [], [], ""),
    boards: g("ván gỗ", "/bɔːrdz/", "noun", "Wooden planks.", [], [], ""),
    danger: g("nguy hiểm", "/ˈdeɪndʒər/", "noun", "Risk of harm.", [], [], ""),
    badly: g("rất / tệ", "/ˈbædli/", "adv", "Severely.", [], [], ""),
    frightened: g("sợ hãi", "/ˈfraɪtənd/", "adj", "Afraid.", [], [], ""),
    shriek: g("tiếng rít", "/ʃriːk/", "noun", "Sharp cry.", [], [], ""),
    spun: g("quay", "/spʌn/", "verb", "Rotated fast.", [], [], ""),
  },
};
