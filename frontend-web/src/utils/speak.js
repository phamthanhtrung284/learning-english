/**
 * Speak text using the best available female US English voice.
 * Priority: Samantha (macOS) > Zira (Windows) > any en-US female > any en-US
 */

let _cachedVoice = null;

function getBestVoice() {
  if (_cachedVoice) return _cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const enUS = voices.filter(v => v.lang === "en-US" || v.lang.startsWith("en-US"));

  // Priority list — best natural-sounding female voices across platforms
  const preferred = [
    "Samantha",       // macOS — best quality
    "Karen",          // macOS alternative
    "Moira",          // macOS Irish English (clear)
    "Microsoft Zira", // Windows — clear female voice
    "Microsoft Jenny",// Windows 11 neural
    "Google US English", // Chrome
  ];

  for (const name of preferred) {
    const match = enUS.find(v => v.name.includes(name));
    if (match) { _cachedVoice = match; return match; }
  }

  // Fallback: any en-US female-sounding voice (heuristic: name contains common female names)
  const femaleHint = enUS.find(v => /female|woman|girl|zira|samantha|karen|victoria|allison|ava|susan|jenny/i.test(v.name));
  if (femaleHint) { _cachedVoice = femaleHint; return femaleHint; }

  // Last resort: first en-US voice
  if (enUS.length) { _cachedVoice = enUS[0]; return enUS[0]; }

  return null;
}

export function speak(text, rate = 0.88) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  u.pitch = 1.05; // slightly higher pitch for clearer female voice

  const voice = getBestVoice();
  if (voice) u.voice = voice;

  // voices may not be loaded yet — retry once after load
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
