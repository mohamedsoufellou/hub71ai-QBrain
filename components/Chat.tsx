"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUp, LoaderCircle, Mic, Search, Square, Volume2 } from "lucide-react";
import { ServiceIcon } from "./ServiceIcon";
import { ServiceCards } from "./ServiceCards";
import { useT } from "./ui";
import { Mark } from "./Mark";
import { Step } from "./Steps";
import { useFile } from "@/lib/store";
import { useVoiceInput } from "@/lib/use-voice-input";
import { useVoiceDemo } from "@/lib/use-voice-demo";

function subscribeCompact(callback: () => void) {
  const query = window.matchMedia("(max-width: 600px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const isCompact = () => window.matchMedia("(max-width: 600px)").matches;
const serverCompact = () => false;

function Activity({ label }: { label: string }) {
  return (
    <div className="wu-typing" role="status" aria-live="polite" aria-atomic="true">
      <Mark size={22} />
      <span className="wu-typing__label">{label}</span>
      <span className="wu-typing__dots" aria-hidden><i /><i /><i /></span>
    </div>
  );
}

function PendingActivity() {
  const t = useT();
  const [working, setWorking] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setWorking(true), 1100);
    return () => window.clearTimeout(timer);
  }, []);
  return <Activity label={working ? t("Working on your request…", "جارٍ العمل على طلبك…") : t("Thinking…", "جارٍ التفكير…")} />;
}

function Composer({ big = false, onAsk }: { big?: boolean; onAsk: (text: string) => void }) {
  const t = useT();
  const compact = useSyncExternalStore(subscribeCompact, isCompact, serverCompact);
  const lang = useFile((s) => s.lang);
  const pending = useFile((s) => s.pending || s.playback !== null);
  const [text, setText] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const draft = useRef("");
  const statusId = useId();
  const acceptTranscript = useCallback((phrase: string) => {
    setText([draft.current, phrase].filter(Boolean).join(" "));
  }, []);
  const voice = useVoiceInput({ lang, onTranscript: acceptTranscript });
  const demo = useVoiceDemo({ lang, onTranscript: acceptTranscript });
  const listening = voice.status === "starting" || voice.status === "listening";
  const processing = voice.status === "processing";
  const demoPlaying = demo.state === "playing";
  const busy = listening || processing || demoPlaying;
  const error = voice.error ?? demo.error;
  const status = demoPlaying ? t("Sample playing. Microphone off.", "المقطع التجريبي يعمل. الميكروفون مغلق.")
    : demo.state === "complete" ? t("Sample ready. Review and send.", "المثال جاهز. راجعه ثم أرسله.")
    : voice.status === "starting" ? t("Waiting for microphone…", "في انتظار الميكروفون…")
    : voice.status === "listening" ? t("Listening. Speak your request.", "أستمع. قل طلبك.")
    : processing ? t("Finishing your words…", "جارٍ إكمال كلماتك…")
    : voice.transcript ? t("Ready. Edit or send your words.", "جاهز. عدّل كلماتك أو أرسلها.")
    : voice.supported ? t("Speak in English", "تحدث بالعربية") : t("Try Chrome or Safari for voice", "جرّب كروم أو سفاري للصوت");

  function cancelInput() {
    voice.cancel();
    demo.cancel();
    setText(draft.current);
    field.current?.focus();
  }

  return (
    <div className="wu-composer" data-voice-active={busy || undefined}>
    <form
      className="hal-search"
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        if (busy) {
          if (listening) voice.stop();
          return;
        }
        voice.cancel();
        demo.cancel();
        onAsk(text.trim() || (big ? t("Let's start with Wusool", "لنبدأ مع وصول") : ""));
        setText("");
        draft.current = "";
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && busy) {
          event.preventDefault();
          cancelInput();
        }
      }}
    >
      <label className="hal-search__field">
        <Search className="hal-icon hal-search__icon hal-search__icon--muted" aria-hidden />
        <span className="hal-hidden-visually">{t("Your message", "رسالتك")}</span>
        <input
          ref={field}
          value={text}
          readOnly={busy}
          aria-describedby={statusId}
          onChange={(e) => {
            voice.cancel();
            demo.cancel();
            setText(e.target.value);
          }}
          placeholder={
            big ? compact ? t("Ask Wusool…", "اسأل وصول…") : t("Let’s start with Wusool…", "لنبدأ مع وصول…") : t("Type a message", "اكتب رسالة")
          }
        />
      </label>
      <button
        type="button"
        className="wu-voice-button"
        data-active={listening || undefined}
        aria-pressed={listening}
        aria-label={listening ? t("Stop voice input", "أوقف الإدخال الصوتي") : t("Speak your request", "قل طلبك")}
        title={voice.supported ? t("Your browser’s speech service processes your audio. Tap to speak.", "تعالج خدمة الصوت في متصفحك التسجيل. اضغط للتحدث.") : t("This browser does not support voice input. Try Chrome or Safari.", "هذا المتصفح لا يدعم الإدخال الصوتي. جرّب كروم أو سفاري.")}
        disabled={!voice.supported || processing || demoPlaying || pending}
        onClick={() => {
          if (listening) voice.stop();
          else {
            demo.cancel();
            draft.current = text.trim();
            voice.start();
          }
        }}
      >
        {listening ? <Square size={16} fill="currentColor" strokeWidth={0} aria-hidden /> : <Mic size={21} strokeWidth={1.6} aria-hidden />}
      </button>
      <div className="hal-search__cta">
        {big ? (
          <button type="submit" disabled={busy || pending} className="hal-btn hal-btn--primary hal-btn--lg">
            {t("Let’s start", "لنبدأ")}
          </button>
        ) : (
          <button type="submit" disabled={busy || pending || !text.trim()} className="hal-btn hal-btn--secondary wu-send" aria-label={pending ? t("Wusool is responding", "وصول يرد") : t("Send", "أرسل")}>
            {pending ? <LoaderCircle className="hal-icon hal-icon--sm wu-response-spinner" aria-hidden /> : <ArrowUp className="hal-icon hal-icon--sm" aria-hidden />}
          </button>
        )}
      </div>
    </form>
    <div className="wu-voice-toolbar">
      <p className="wu-voice-status" id={statusId} role="status" aria-live="polite">
        {busy && <span className="wu-voice-progress" aria-hidden><span /><span /><span /></span>}
        {status}
      </p>
      {busy ? (
        <button type="button" className="wu-voice-demo" onClick={cancelInput}>{t("Cancel", "إلغاء")}</button>
      ) : (
        <button type="button" className="wu-voice-demo" aria-label={t("Play voice demo", "شغّل المقطع الصوتي التجريبي")} onClick={() => {
          voice.cancel();
          draft.current = text.trim();
          demo.start();
        }}>
          <Volume2 size={16} strokeWidth={1.6} aria-hidden />
          {t("Play demo", "جرّب الصوت")}
        </button>
      )}
    </div>
    {error && <p className="wu-voice-error" role="alert">{error}</p>}
    </div>
  );
}

function AssistantStatus() {
  const t = useT();
  const profile = useFile((s) => s.profile);
  const preferences = Object.entries(profile).filter(([key]) => key !== "sarahDemoStage");
  return (
    <div className="wu-assistant-status">
      <span>{t("Demo chat", "محادثة تجريبية")}</span>
      {preferences.length > 0 && <details>
        <summary>{t("Your preferences", "تفضيلاتك")}</summary>
        <dl>{preferences.map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, " $1").toLowerCase()}</dt><dd>{typeof value === "boolean" ? (value ? t("Yes", "نعم") : t("No", "لا")) : String(value)}</dd></div>)}</dl>
      </details>}
    </div>
  );
}

export function Chat() {
  const messages = useFile((s) => s.messages);
  const pending = useFile((s) => s.pending);
  const playback = useFile((s) => s.playback);
  const chatError = useFile((s) => s.chatError);
  const retry = useFile((s) => s.retry);
  const t = useT();
  const ask = useFile((s) => s.ask);
  const act = useFile((s) => s.act);
  const end = useRef<HTMLDivElement>(null);
  const typing = useRef<HTMLDivElement>(null);
  const lastId = messages.at(-1)?.id;
  const phase = playback?.phase;
  const latestReceipt = new Map<string, string>();
  for (const m of messages) if (m.widget?.t === "receipt") latestReceipt.set(m.widget.ref, m.id);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (pending || phase === "thinking" || phase === "working") typing.current?.scrollIntoView({ block: "end", behavior });
    else end.current?.scrollIntoView({ block: "end", behavior });
  }, [phase, messages.length, pending, chatError]);

  if (messages.length === 0) {
    return (
      <section className="hal-container wu-chat-hero">
        <h1 className="hal-display">
          {t("Your", "")}
          {" "}<button type="button" className="wu-hero-link" onClick={() => act({ a: "topic", topic: "home" }, "Find a home")}>
            <ServiceIcon topic="home" />
            {t("home", "سكنك")}
          </button>
          {t(", your", " و")}
          {" "}<button type="button" className="wu-hero-link" onClick={() => act({ a: "topic", topic: "visa" }, "Get a visa")}>
            <ServiceIcon topic="visa" />
            {t("visa", "تأشيرتك")}
          </button>
          {t(", and your", " و")}
          {" "}<button type="button" className="wu-hero-link" onClick={() => act({ a: "topic", topic: "arrive" }, "Plan my travel")}>
            <ServiceIcon topic="arrive" />
            {t("flight", "رحلتك")}
          </button>
          {t(" to Abu Dhabi, sorted in one", " إلى أبوظبي في")} <em>{t("conversation", "محادثة واحدة")}</em>
        </h1>
        <p className="hal-lede">
          {t("Ask in your own words. Book, pay, and file without leaving the chat.", "اسأل بكلماتك. احجز وادفع وقدّم دون مغادرة المحادثة.")}
        </p>
        <div className="hal-w-search">
          <Composer big onAsk={ask} />
          <AssistantStatus />
        </div>
        <ServiceCards onSelect={act} />
        <aside className="hal-microblock">
          <span className="hal-microblock__mark">
            <Mark size={22} />
          </span>
          <p className="hal-microblock__text">
            {t(
              "This is a demo. Payments, bookings, and filings are simulated.",
              "هذا عرض تجريبي. المدفوعات والحجوزات والطلبات محاكاة.",
            )}
          </p>
        </aside>
      </section>
    );
  }

  return (
    <>
      <div className="wu-thread">
        {messages.map((message) => {
          const live = message.id === lastId;
          const revealing = playback?.id === message.id;
          const writing = revealing && playback.phase === "writing";
          if (revealing && !writing) {
            return (
              <div key={message.id} ref={typing} className="wu-activity">
                <Activity label={playback.phase === "thinking" ? t("Thinking…", "جارٍ التفكير…") : t(...playback.activity)} />
              </div>
            );
          }
          const widget =
            message.widget?.t === "receipt" && latestReceipt.get(message.widget.ref) !== message.id ? undefined : message.widget;
          if (message.role === "you") {
            return (
              <p key={message.id} className="wu-you">
                {message.text}
              </p>
            );
          }
          return (
            <div key={message.id} className="wu-reply" data-live={live}>
              <div className="wu-reply__author"><Mark size={18} /><span>Wusool</span></div>
              <p className="wu-reply__text" data-ai={Boolean(message.model) || undefined} aria-live={live ? "polite" : undefined} aria-busy={writing} aria-atomic="true">
                {writing ? message.text.slice(0, playback.characters) : message.text}
                {writing && <span className="wu-reply__cursor" aria-hidden />}
              </p>
              {!revealing && message.model && <span className="wu-ai-attribution">{t("Demo response · simulation", "رد تجريبي · محاكاة")}</span>}
              {!revealing && Boolean(message.sources?.length) && <details className="wu-ai-sources"><summary>{t("Data references", "مراجع البيانات")}</summary>{message.sources?.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>)}</details>}
              {!revealing && widget ? (
                <div className="wu-step" inert={!live || pending || playback !== null}>
                  <Step widget={widget} act={act} />
                </div>
              ) : null}
              {live && !revealing && !pending && message.options?.length ? (
                <div className="wu-choices">
                  {message.options.map((option) => (
                    <button key={option.label} type="button" className="hal-chip" onClick={() => act(option.action, option.label)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {pending && <div ref={typing} className="wu-activity"><PendingActivity /></div>}
        {chatError && <div className="wu-ai-error" role="alert"><p>{chatError}</p><button className="hal-chip" type="button" onClick={() => void retry()}>{t("Try again", "حاول مجدداً")}</button></div>}
      </div>
      <div className="wu-dock">
        <Composer onAsk={ask} />
        <AssistantStatus />
      </div>
      <div ref={end} aria-hidden="true" />
    </>
  );
}
