"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createVoiceInputController, type VoiceLanguage, type VoiceSnapshot } from "./voice-input";

const serverSnapshot: VoiceSnapshot = { status: "idle", supported: false, error: null, transcript: "" };

/** Live dictation changes the draft only; the composer decides when to send. */
export function useVoiceInput({ lang, onTranscript }: {
  lang: VoiceLanguage;
  onTranscript: (transcript: string) => void;
}) {
  const [controller] = useState(() => createVoiceInputController({
    lang,
    onTranscript,
  }));
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getState, () => serverSnapshot);

  useEffect(() => { controller.setLanguage(lang); }, [controller, lang]);
  useEffect(() => { controller.setOnTranscript(onTranscript); }, [controller, onTranscript]);
  // Cancel releases the microphone and handlers while allowing React's
  // development Strict Mode to replay the effect with the same controller.
  useEffect(() => () => controller.cancel(), [controller]);

  const start = useCallback(() => {
    controller.setLanguage(lang);
    controller.start();
  }, [controller, lang]);

  return { ...snapshot, start, stop: controller.stop, cancel: controller.cancel };
}
