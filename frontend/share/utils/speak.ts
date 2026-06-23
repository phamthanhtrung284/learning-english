let _cachedVoice: SpeechSynthesisVoice | null = null;

function getBestVoice() {
  if (_cachedVoice) return _cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const enUS = voices.filter((v) => v.lang === "en-US" || v.lang.startsWith("en-US"));

  const preferred = [
    "Samantha",
    "Karen",
    "Moira",
    "Microsoft Zira",
    "Microsoft Jenny",
    "Google US English",
  ];

  for (const name of preferred) {
    const match = enUS.find((v) => v.name.includes(name));
    if (match) {
      _cachedVoice = match;
      return match;
    }
  }

  const femaleHint = enUS.find((v) =>
    /female|woman|girl|zira|samantha|karen|victoria|allison|ava|susan|jenny/i.test(v.name)
  );
  if (femaleHint) {
    _cachedVoice = femaleHint;
    return femaleHint;
  }

  if (enUS.length) {
    _cachedVoice = enUS[0];
    return enUS[0];
  }

  return null;
}

export function speak(text: string, rate = 0.88) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  u.pitch = 1.05;

  const voice = getBestVoice();
  if (voice) u.voice = voice;

  if (!voice && window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      _cachedVoice = null;
      const v = getBestVoice();
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.onvoiceschanged = null;
    };
    return;
  }

  window.speechSynthesis.speak(u);
}
