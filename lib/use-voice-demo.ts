"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "./types";

export const voiceSamples = {
  en: { text: "Find me a 2 bedroom apartment in Al Reem under 130,000 dirhams.", src: "/audio/voice-demo-en.m4a" },
  ar: { text: "أحتاج تأمينًا صحيًا لعائلتي في أبوظبي.", src: "/audio/voice-demo-ar.m4a" },
} as const;

/** Plays a recorded sample with its known caption. Never opens a microphone. */
export function useVoiceDemo({ lang, onTranscript }: { lang: Lang; onTranscript: (text: string) => void }) {
  const [snapshot, setSnapshot] = useState<{ lang: Lang; state: "idle" | "playing" | "complete"; error: string | null }>({ lang, state: "idle", error: null });
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);

  const dispose = useCallback(() => {
    generation.current++;
    const current = audio.current;
    audio.current = null;
    if (!current) return;
    current.onplaying = current.ontimeupdate = current.onended = current.onerror = null;
    current.pause();
    current.removeAttribute("src");
    current.load();
  }, []);

  const cancel = useCallback(() => {
    dispose();
    setSnapshot({ lang, state: "idle", error: null });
  }, [dispose, lang]);

  useEffect(() => dispose, [dispose, lang]);

  const start = useCallback(() => {
    dispose();
    const sample = voiceSamples[lang];
    const current = new Audio(sample.src);
    const session = generation.current;
    const words = sample.text.split(" ");
    audio.current = current;
    setSnapshot({ lang, state: "playing", error: null });
    let shown = 0;
    const valid = () => generation.current === session && audio.current === current;
    const fail = () => {
      if (!valid()) return;
      dispose();
      setSnapshot({ lang, state: "idle", error: lang === "ar" ? "تعذّر تشغيل المقطع التجريبي. حاول مرة أخرى." : "The sample audio couldn’t play. Please try again." });
    };
    current.onplaying = () => { if (valid() && shown === 0) onTranscript(""); };
    current.ontimeupdate = () => {
      if (!valid() || !Number.isFinite(current.duration) || current.duration <= 0) return;
      const count = Math.min(words.length, Math.ceil((current.currentTime / current.duration) * words.length));
      if (count <= shown) return;
      shown = count;
      onTranscript(words.slice(0, count).join(" "));
    };
    current.onended = () => {
      if (!valid()) return;
      onTranscript(sample.text);
      dispose();
      setSnapshot({ lang, state: "complete", error: null });
    };
    current.onerror = fail;
    void current.play().catch(fail);
  }, [dispose, lang, onTranscript]);

  return { state: snapshot.lang === lang ? snapshot.state : "idle", error: snapshot.lang === lang ? snapshot.error : null, start, cancel };
}
