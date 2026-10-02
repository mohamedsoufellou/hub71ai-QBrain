"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { run, visaStages } from "./flow";
import { interpret } from "./intent";
import { runSarahDemo, sarahDemoAction } from "./sarah-demo";
import { uid } from "./format";
import { chatActivity, type ChatPlayback } from "./chat-activity";
import type { Action, AIReply, ChatMessage, Family, HealthProfile, Lang, Option, Receipt, RelocationProfile, Trip } from "./types";

type State = {
  lang: Lang;
  messages: ChatMessage[];
  receipts: Receipt[];
  trip: Trip;
  family: Family;
  profile: RelocationProfile;
  healthProfile?: HealthProfile;
  chatMode: "ai" | "demo";
  pending: boolean;
  playback: ChatPlayback | null;
  chatError: string | null;
  aiStatus: { configured: boolean; model: string; catalogue: Record<string, number> } | null;
  checkAI: () => Promise<void>;
  setChatMode: (mode: "ai" | "demo") => void;
  retry: () => Promise<void>;
  setLang: (lang: Lang) => void;
  ask: (text: string) => Promise<void>;
  act: (action: Action, label: string) => void;
  reset: () => void;
};

const empty = {
  profile: {} as RelocationProfile,
  healthProfile: undefined as HealthProfile | undefined,
  messages: [] as ChatMessage[],
  receipts: [] as Receipt[],
  trip: {} as Trip,
  family: { spouse: true, kids: 0, parents: 0 } as Family,
};

function you(text: string): ChatMessage {
  return { id: uid("you"), role: "you", text };
}

function update(ref: string, stage: number): { text: string; options: Option[] } {
  const check: Option = { label: "Check for an update", action: { a: "update", ref } };
  if (stage === 1) return { text: `Demo status for ${ref}: application under review. In a real application, ICP provides the status and processing time.`, options: [check] };
  if (stage === 2) {
    return {
      text: `Demo status for ${ref}: initial review completed. Adult applicants aged 18 or over need a residence medical screening next. Book a simulated appointment to continue.`,
      options: [{ label: "Book the medical test", action: { a: "medical", ref } }],
    };
  }
  if (stage === 3) return { text: `Demo status for ${ref}: your medical appointment is saved. This preview now moves to biometrics and Emirates ID. In a real application, attend the screening and wait for the result before this step.`, options: [check] };
  return {
    text: `The simulated timeline for ${ref} is complete. No visa or Emirates ID has been issued. A real application completes only after ICP approval, medical clearance and any required biometrics.`,
    options: [
      { label: "Open a bank account", action: { a: "topic", topic: "bank" } },
      { label: "Show my file", action: { a: "topic", topic: "file" } },
    ],
  };
}

let requestVersion = 0;
let controller: AbortController | undefined;
let playbackTimer: ReturnType<typeof setTimeout> | undefined;
function cancelPlayback() {
  clearTimeout(playbackTimer);
  playbackTimer = undefined;
}

function presentReply(updates: Partial<State>, action?: Action, fromAI = false) {
  cancelPlayback();
  const message = updates.messages?.at(-1);
  if (!message || typeof window === "undefined") {
    useFile.setState({ ...updates, playback: null });
    return;
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const text = message.text;
  const playback: ChatPlayback = { id: message.id, phase: "thinking", activity: chatActivity(action), characters: 0 };
  function writeReply() {
    if (reducedMotion) {
      useFile.setState({ playback: null });
      return;
    }
    const started = Date.now();
    // Small word groups keep the reveal quick, including for longer AI answers.
    const duration = Math.min(650, Math.max(280, text.length * 2));
    function write() {
      const progress = Math.min(1, (Date.now() - started) / duration);
      if (progress === 1) {
        useFile.setState({ playback: null });
        return;
      }
      const boundary = text.indexOf(" ", Math.ceil(progress * text.length));
      useFile.setState({ playback: { ...playback, phase: "writing", characters: boundary === -1 ? text.length : boundary } });
      playbackTimer = setTimeout(write, 32);
    }
    write();
  }
  useFile.setState({ ...updates, playback: fromAI ? { ...playback, phase: "writing" } : playback });
  if (fromAI) {
    writeReply();
    return;
  }
  playbackTimer = setTimeout(() => {
    useFile.setState({ playback: { ...playback, phase: "working" } });
    playbackTimer = setTimeout(writeReply, reducedMotion ? 300 : 500);
  }, reducedMotion ? 300 : 420);
}

function cancelRequest() {
  cancelPlayback();
  requestVersion++;
  controller?.abort();
  controller = undefined;
}
async function requestAI(text: string, append = true) {
  if (useFile.getState().pending) return;
  const clean = text.trim();
  if (!clean) return;
  const state = useFile.getState();
  const messages = append ? [...state.messages, you(clean)] : state.messages;
  cancelRequest();
  const version = requestVersion;
  const currentController = new AbortController();
  controller = currentController;
  useFile.setState({ messages, pending: true, playback: null, chatError: null });
  try {
    // Bound history independently of the persisted conversation. Keep the latest request.
    const history = messages.slice(-40).map(({ role, text }) => ({ role, text: text.slice(0, 8000) }));
    while (history.length > 1 && JSON.stringify(history).length > 35000) history.shift();
    const response = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      signal: AbortSignal.any([currentController.signal, AbortSignal.timeout(100000)]),
      body: JSON.stringify({ messages: history, context: { lang: state.lang, profile: state.profile, healthProfile: state.healthProfile, family: state.family, trip: state.trip, receipts: state.receipts.slice(0, 50) } }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The AI request failed. Please try again.");
    if (version !== requestVersion) return;
    const reply = result as AIReply;
    if (typeof reply.text !== "string" || !reply.text.trim()) throw new Error("The assistant returned an empty response. Please retry.");
    presentReply({ pending: false, profile: reply.profile ?? state.profile, family: reply.family ?? state.family,
      messages: [...useFile.getState().messages, { id: uid("w"), role: "wusool", text: reply.text, widget: reply.widget, options: reply.options, sources: reply.sources, model: reply.model }] }, undefined, true);
  } catch (error) {
    if (version !== requestVersion) return;
    useFile.setState({ pending: false, chatError: error instanceof Error && error.name !== "TimeoutError" ? error.message : "The AI request timed out. Please retry." });
  } finally { if (version === requestVersion) controller = undefined; }
}

export const useFile = create<State>()(
  persist(
    (set, get) => ({
      lang: "en",
      ...empty,
      chatMode: "demo",
      pending: false,
      playback: null,
      chatError: null,
      aiStatus: null,
      checkAI: async () => {
        try {
          const response = await fetch("/api/chat", { cache: "no-store" });
          if (response.ok) set({ aiStatus: await response.json() });
        } catch { /* Sending a message provides an actionable error and retry. */ }
      },
      setChatMode: (chatMode) => { cancelRequest(); set({ chatMode, pending: false, playback: null, chatError: null }); },
      retry: async () => {
        const last = get().messages.at(-1);
        if (last?.role === "you") await requestAI(last.text, false);
      },
      setLang: (lang) => set({ lang }),
      ask: async (text) => {
        const clean = text.trim();
        if (!clean || get().pending) return;
        const state = get();
        const scenario = runSarahDemo([...state.messages, you(clean)], state.profile);
        if (scenario) {
          cancelRequest();
          presentReply({ profile: scenario.profile, family: scenario.family ?? state.family, chatError: null,
            messages: [...state.messages, you(clean), { id: uid("w"), role: "wusool", text: scenario.text, widget: scenario.widget, options: scenario.options, sources: scenario.sources, model: scenario.model }] }, { a: "sarahDemo", stage: "documents" });
          return;
        }
        if (get().chatMode === "ai") return requestAI(clean);
        const action = interpret(clean);
        if (action) return get().act(action, clean);
        presentReply({
          messages: [
            ...get().messages,
            you(clean),
            {
              id: uid("w"),
              role: "wusool",
              text: "Let’s start with Wusool. Choose a home, visas, travel, banking, schools, health insurance, or tax advice.",
              widget: { t: "menu" },
            },
          ],
        });
      },
      act: (action, label) => {
        cancelRequest();
        set({ pending: false, playback: null, chatError: null });
        if (action.a === "sarahDemo") {
          const state = get();
          const scenario = sarahDemoAction(action, state.profile);
          presentReply({ profile: scenario.profile, family: scenario.family ?? state.family,
            messages: [...state.messages, you(label), { id: uid("w"), role: "wusool", text: scenario.text, widget: scenario.widget, options: scenario.options, sources: scenario.sources, model: scenario.model }] }, action);
          return;
        }
        if (action.a === "healthPlans" || action.a === "healthPlan" || action.a === "healthQuote") set({ healthProfile: action.profile });
        if (action.a === "homes") {
          const filter = action.filter;
          set({ profile: { ...get().profile, ...(filter.kind ? { housingKind: filter.kind } : {}), ...(filter.max !== undefined ? { annualHousingBudget: filter.max } : {}), ...(filter.beds !== undefined ? { bedrooms: filter.beds } : {}), ...(filter.area ? { area: filter.area } : {}), ...(filter.pet !== undefined ? { pet: filter.pet } : {}), ...(filter.furnished !== undefined ? { furnished: filter.furnished } : {}) } });
        }
        if (action.a === "city") set({ profile: { ...get().profile, originCity: action.city } });
        if (action.a === "schools" && action.curriculum !== "all") set({ profile: { ...get().profile, curriculum: action.curriculum } });
        const state = get();
        if (action.a === "update") {
          const receipt = state.receipts.find((r) => r.ref === action.ref);
          if (!receipt || receipt.kind !== "visa") {
            presentReply({ messages: [...state.messages, you(label), {
              id: uid("w"), role: "wusool", text: "I couldn’t find a visa application with that reference. Open your file to choose an existing demo application.",
              options: [{ label: "Show my file", action: { a: "topic", topic: "file" } }],
            }] }, action);
            return;
          }
          const current = receipt.stage ?? 0;
          const medicalBooked = state.receipts.some((r) => r.kind === "medical" && r.lines.some(([key, value]) => key === "Visa application" && value === action.ref));
          const next = current === 2 && !medicalBooked ? 2 : Math.min(current + 1, visaStages.length - 1);
          const reply = update(action.ref, next);
          presentReply({
            receipts: state.receipts.map((r) => (r.ref === action.ref ? { ...r, stage: next } : r)),
            messages: [...state.messages, you(label), { id: uid("w"), role: "wusool", ...reply, widget: { t: "receipt", ref: action.ref } }],
          }, action);
          return;
        }
        const result = run(action, { receipts: state.receipts, trip: state.trip, family: state.family });
        let receipts = result.receipt ? [result.receipt, ...state.receipts] : state.receipts;
        if (result.advance) {
          const { ref, stage } = result.advance;
          receipts = receipts.map((r) => (r.ref === ref ? { ...r, stage: Math.max(r.stage ?? 0, stage) } : r));
        }
        presentReply({
          receipts,
          trip: result.trip ?? state.trip,
          family: result.family ?? state.family,
          messages: [
            ...state.messages,
            you(label),
            { id: uid("w"), role: "wusool", text: result.text, widget: result.widget, options: result.options },
          ],
        }, action);
      },
      reset: () => { cancelRequest(); set({ ...empty, pending: false, playback: null, chatError: null }); },
    }),
    {
      name: "wusool",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ lang, messages, receipts, trip, family, profile, healthProfile, chatMode }) => ({ lang, messages, receipts, trip, family, profile, healthProfile, chatMode }),
      migrate: () => ({ lang: "en", ...empty }),
    },
  ),
);
