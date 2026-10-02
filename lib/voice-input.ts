export type VoiceLanguage = "en" | "ar";
export type VoiceStatus = "idle" | "starting" | "listening" | "processing" | "error" | "unsupported";

export type VoiceSnapshot = {
  status: VoiceStatus;
  supported: boolean;
  error: string | null;
  transcript: string;
};

export type VoiceResultEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    length: number;
    readonly [index: number]: { transcript: string };
  }>;
};

/** The browser API is not included in every TypeScript DOM library. */
export type VoiceRecognizer = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onresult: ((event: VoiceResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onnomatch: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

type VoiceRecognizerConstructor = new () => VoiceRecognizer;
type Schedule = (callback: () => void, delay: number) => () => void;

function browserConstructor(): VoiceRecognizerConstructor | null {
  if (typeof window === "undefined" || window.isSecureContext === false) return null;
  const browser = window as Window & {
    SpeechRecognition?: VoiceRecognizerConstructor;
    webkitSpeechRecognition?: VoiceRecognizerConstructor;
  };
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition ?? null;
}

export function supportsVoiceInput(): boolean {
  return browserConstructor() !== null;
}

function browserRecognizer(): VoiceRecognizer | null {
  const Constructor = browserConstructor();
  return Constructor ? new Constructor() : null;
}

const scheduleTimeout: Schedule = (callback, delay) => {
  const id = setTimeout(callback, delay);
  return () => clearTimeout(id);
};

function startErrorCode(error: unknown): string {
  const name = typeof error === "object" && error !== null && "name" in error ? error.name : null;
  return name === "NotAllowedError" || name === "SecurityError" ? "not-allowed" : "unknown";
}

export function voiceErrorMessage(code: string, lang: VoiceLanguage): string {
  const messages: Record<string, [string, string]> = {
    "not-allowed": ["Microphone access was denied. Allow it in your browser settings, then try again.", "تم رفض الوصول إلى الميكروفون. اسمح به في إعدادات المتصفح ثم حاول مجدداً."],
    "service-not-allowed": ["Your browser has blocked its speech service. Try another supported browser or type your request.", "حظر المتصفح خدمة التعرف على الكلام. جرّب متصفحاً يدعمها أو اكتب طلبك."],
    "audio-capture": ["No microphone is available. Check that it is connected and allowed in your device settings.", "الميكروفون غير متاح. تأكد من توصيله والسماح باستخدامه في إعدادات الجهاز."],
    "no-speech": ["I didn’t hear a request. Tap the microphone and speak again, or type your request.", "لم أسمع طلباً. اضغط على الميكروفون وتحدث مجدداً أو اكتب طلبك."],
    network: ["The speech service couldn’t connect. Check your connection and try again, or type your request.", "تعذر الاتصال بخدمة التعرف على الكلام. تحقق من الاتصال وحاول مجدداً أو اكتب طلبك."],
    "language-not-supported": ["Your browser’s speech service doesn’t support this language. Try switching languages or type your request.", "خدمة التعرف على الكلام في متصفحك لا تدعم هذه اللغة. جرّب تغيير اللغة أو اكتب طلبك."],
    unsupported: ["This browser doesn’t support voice input. You can still type your request.", "هذا المتصفح لا يدعم الإدخال الصوتي. يمكنك كتابة طلبك."],
    timeout: ["The speech service took too long to respond. Try again or type your request.", "استغرقت خدمة التعرف على الكلام وقتاً طويلاً. حاول مجدداً أو اكتب طلبك."],
    aborted: ["Voice input stopped. Tap the microphone to try again.", "توقف الإدخال الصوتي. اضغط على الميكروفون للمحاولة مجدداً."],
  };
  const message = messages[code] ?? ["Voice input couldn’t start. Try again or type your request.", "تعذر بدء الإدخال الصوتي. حاول مجدداً أو اكتب طلبك."];
  return message[lang === "ar" ? 1 : 0];
}

/** Results contain the complete session, including a replaceable interim tail. */
export function voiceTranscript(results: VoiceResultEvent["results"]): string {
  const parts: string[] = [];
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const phrase = result?.[0]?.transcript.trim();
    if (phrase) parts.push(phrase);
  }
  return parts.join(" ");
}

type VoiceInputOptions = {
  lang: VoiceLanguage;
  onTranscript: (transcript: string) => void;
  createRecognizer?: () => VoiceRecognizer | null;
  supported?: boolean;
  schedule?: Schedule;
};

/**
 * One user-started recognition session. No recording is retained by Wusool and
 * no message is submitted here. The browser may use a remote speech service.
 * A factory and scheduler can be supplied for deterministic lifecycle tests.
 */
export function createVoiceInputController(options: VoiceInputOptions) {
  let lang = options.lang;
  let onTranscript = options.onTranscript;
  const createRecognizer = options.createRecognizer ?? browserRecognizer;
  const schedule = options.schedule ?? scheduleTimeout;
  const supported = options.supported ?? (options.createRecognizer ? true : supportsVoiceInput());
  let state: VoiceSnapshot = { status: supported ? "idle" : "unsupported", supported, error: null, transcript: "" };
  const subscribers = new Set<() => void>();
  let recognizer: VoiceRecognizer | null = null;
  let generation = 0;
  let disposed = false;
  let cancelTimeout: (() => void) | null = null;

  function publish(next: Partial<VoiceSnapshot>) {
    if (disposed) return;
    state = { ...state, ...next };
    subscribers.forEach((subscriber) => subscriber());
  }

  function clearTimeout() {
    cancelTimeout?.();
    cancelTimeout = null;
  }

  function release(abort: boolean) {
    generation += 1;
    clearTimeout();
    const previous = recognizer;
    recognizer = null;
    if (!previous) return;
    previous.onstart = previous.onaudiostart = previous.onaudioend = previous.onend = previous.onnomatch = null;
    previous.onresult = previous.onerror = null;
    if (abort) {
      try { previous.abort(); } catch { /* A completed session may already be disconnected. */ }
    }
  }

  function fail(code: string) {
    release(true);
    publish({ status: code === "unsupported" ? "unsupported" : "error", ...(code === "unsupported" ? { supported: false } : {}), error: voiceErrorMessage(code, lang) });
  }

  function deadline(delay: number, callback: () => void) {
    clearTimeout();
    const session = generation;
    cancelTimeout = schedule(() => {
      if (!disposed && session === generation && recognizer) callback();
    }, delay);
  }

  function stop() {
    if (disposed || !recognizer || state.status === "processing") return;
    const current = recognizer;
    const session = generation;
    const active = () => !disposed && recognizer === current && generation === session;
    publish({ status: "processing" });
    if (!active()) return;
    deadline(10_000, () => fail("timeout"));
    if (!active()) return;
    try { current.stop(); } catch { if (active()) fail("aborted"); }
  }

  return {
    getState: () => state,
    subscribe: (subscriber: () => void) => {
      subscribers.add(subscriber);
      return () => { subscribers.delete(subscriber); };
    },
    start() {
      if (disposed || recognizer) return;
      let current: VoiceRecognizer | null;
      try { current = createRecognizer(); } catch (error) {
        fail(startErrorCode(error));
        return;
      }
      if (!current) { fail("unsupported"); return; }
      release(true);
      recognizer = current;
      const session = generation;
      const active = () => !disposed && recognizer === current && generation === session;
      // Use a commonly supported English locale; UAE context comes from the request.
      current.lang = lang === "ar" ? "ar-AE" : "en-GB";
      // A single spoken request avoids automatic microphone restarts on mobile.
      current.continuous = false;
      current.interimResults = true;
      current.maxAlternatives = 1;
      publish({ status: "starting", supported: true, error: null, transcript: "" });
      if (!active()) return;
      current.onstart = current.onaudiostart = () => {
        if (!active() || state.status === "processing") return;
        publish({ status: "listening" });
        if (active() && state.status === "listening") deadline(60_000, stop);
      };
      current.onaudioend = () => {
        if (!active()) return;
        publish({ status: "processing" });
        if (active()) deadline(10_000, () => fail("timeout"));
      };
      current.onresult = (event) => {
        if (!active()) return;
        const transcript = voiceTranscript(event.results);
        if (transcript !== state.transcript) {
          publish({ transcript });
          if (active()) onTranscript(transcript);
        }
      };
      current.onerror = (event) => { if (active()) fail(event.error); };
      current.onnomatch = () => { if (active()) fail("no-speech"); };
      current.onend = () => {
        if (!active()) return;
        const heard = state.transcript.length > 0;
        release(false);
        publish({ status: heard ? "idle" : "error", error: heard ? null : voiceErrorMessage("no-speech", lang) });
      };
      deadline(20_000, () => fail("timeout"));
      if (!active()) return;
      try { current.start(); } catch (error) {
        if (active()) fail(startErrorCode(error));
      }
    },
    stop,
    setOnTranscript(listener: (transcript: string) => void) {
      onTranscript = listener;
    },
    cancel() {
      release(true);
      publish({ status: state.supported ? "idle" : "unsupported", error: null, transcript: "" });
    },
    setLanguage(next: VoiceLanguage) {
      if (next === lang) return;
      lang = next;
      release(true);
      publish({ status: state.supported ? "idle" : "unsupported", error: null, transcript: "" });
    },
    destroy() {
      disposed = true;
      subscribers.clear();
      release(true);
    },
  };
}
