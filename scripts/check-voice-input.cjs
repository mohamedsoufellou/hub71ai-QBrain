/* Run with node scripts/check-voice-input.cjs. Uses synthetic browser events; no microphone or audio is recorded. */
/* eslint-disable @typescript-eslint/no-require-imports -- This dependency-free runner transpiles the application's TypeScript module for Node. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return originalResolve.call(this, name.startsWith("@/") ? path.join(root, name.slice(2)) : name, ...args);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
}

const failures = [];
let checks = 0;
let scenarios = 0;
function equal(actual, expected, message) {
  checks++;
  assert.deepEqual(actual, expected, message);
}
function verify(condition, message) {
  checks++;
  assert.ok(condition, message);
}
function scenario(name, fn) {
  scenarios++;
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function resultEvent(segments, resultIndex = 0) {
  return {
    resultIndex,
    results: segments.map(([transcript, isFinal]) => {
      const result = [{ transcript, confidence: isFinal ? 0.96 : 0.5 }];
      result.isFinal = isFinal;
      return result;
    }),
  };
}

class FakeRecognition {
  static instances = [];
  constructor() {
    this.lang = "";
    this.interimResults = false;
    this.continuous = false;
    this.maxAlternatives = 0;
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.startCalls = 0;
    this.stopCalls = 0;
    this.abortCalls = 0;
    FakeRecognition.instances.push(this);
  }
  start() { this.startCalls++; }
  stop() { this.stopCalls++; }
  abort() { this.abortCalls++; }
  started() { this.onstart?.(); }
  result(segments, resultIndex = 0) { this.onresult?.(resultEvent(segments, resultIndex)); }
  error(error) { this.onerror?.({ error }); }
  ended() { this.onend?.(); }
}

function fakeClock() {
  let time = 0;
  let id = 0;
  const timers = new Map();
  return {
    schedule(callback, delay) {
      const key = ++id;
      timers.set(key, { at: time + delay, callback });
      return () => timers.delete(key);
    },
    advance(duration) {
      const until = time + duration;
      for (;;) {
        const next = [...timers.entries()].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        const [key, timer] = next;
        timers.delete(key);
        time = timer.at;
        timer.callback();
      }
      time = until;
    },
    count: () => timers.size,
  };
}

const { createVoiceInputController, supportsVoiceInput, voiceTranscript, voiceErrorMessage } = require("../lib/voice-input.ts");

function fixture(options = {}) {
  const clock = fakeClock();
  const transcripts = [];
  const states = [];
  const recognizers = [];
  const controller = createVoiceInputController({
    lang: "en",
    onTranscript: (transcript) => transcripts.push(transcript),
    createRecognizer: () => {
      const recognition = new FakeRecognition();
      recognizers.push(recognition);
      return recognition;
    },
    schedule: clock.schedule,
    ...options,
  });
  const unsubscribe = controller.subscribe(() => states.push({ ...controller.getState() }));
  return { controller, clock, transcripts, states, recognizers, unsubscribe, current: () => recognizers.at(-1) };
}
function start(f) {
  f.controller.start();
  const recognition = f.current();
  verify(Boolean(recognition), "A manual start must construct a recognizer");
  recognition.started();
  return recognition;
}
function stash(recognition) {
  return {
    start: recognition.onstart,
    audioStart: recognition.onaudiostart,
    audioEnd: recognition.onaudioend,
    result: recognition.onresult,
    error: recognition.onerror,
    end: recognition.onend,
  };
}
function lateEvents(callbacks) {
  callbacks.start?.();
  callbacks.audioStart?.();
  callbacks.result?.(resultEvent([["Unwanted late speech", true]]));
  callbacks.audioEnd?.();
  callbacks.error?.({ error: "network" });
  callbacks.end?.();
}

scenario("Recognition starts only on a user action and uses the selected language", () => {
  const f = fixture();
  equal(f.recognizers.length, 0, "Controller initialization must not access the microphone");
  equal(f.controller.getState().status, "idle", "A supported browser starts idle");
  equal(f.transcripts, [], "No synthetic dictation can appear before recognition events");
  f.controller.start();
  const recognition = f.current();
  equal(recognition.startCalls, 1, "A manual click starts recognition exactly once");
  equal(recognition.lang, "en-GB", "English recognition uses a commonly supported locale");
  equal(recognition.continuous, false, "A request must not restart ongoing microphone capture");
  equal(recognition.interimResults, true, "Interim speech needs to appear in the draft");
  equal(recognition.maxAlternatives, 1, "Draft uses the best recognition hypothesis");
  equal(f.controller.getState().status, "starting", "The UI waits for a real start event");
  f.controller.start();
  equal(f.recognizers.length, 1, "Repeated clicks cannot create overlapping microphone sessions");
  recognition.started();
  equal(f.controller.getState().status, "listening", "The start event activates the listening UI");
  f.controller.destroy();
});

scenario("Interim speech is revised in place, with no repeated words or final segments", () => {
  const f = fixture();
  const recognition = start(f);
  recognition.result([["I need", false]]);
  recognition.result([["I need a villa", false]]);
  recognition.result([["I need a villa", false]]);
  equal(f.transcripts, ["I need", "I need a villa"], "An identical interim event cannot append or repeat text");
  recognition.result([["I need a villa", true], ["in Khalifa", false]], 0);
  recognition.result([["I need a villa", true], ["in Khalifa City", false]], 1);
  equal(f.controller.getState().transcript, "I need a villa in Khalifa City", "Changed resultIndex preserves earlier final speech");
  recognition.result([["I need a villa", true], ["in Khalifa City", true], ["under 150,000 dirhams", false]], 1);
  equal(f.controller.getState().transcript, "I need a villa in Khalifa City under 150,000 dirhams", "Final and interim segments retain their original order");
  recognition.result([["I need a villa", true], ["in Khalifa City", true]], 2);
  equal(f.controller.getState().transcript, "I need a villa in Khalifa City", "A removed interim tail must disappear from the draft");
  recognition.ended();
  equal(f.controller.getState().status, "idle", "Normal completion returns to an editable idle draft");
  equal(f.current().abortCalls, 0, "Normal completion must not abort finished recognition");
  equal(f.clock.count(), 0, "Normal completion clears microphone timers");
});

scenario("Transcript normalization handles browser array-like lists and Arabic", () => {
  const results = {
    length: 4,
    0: { length: 2, isFinal: true, 0: { transcript: "  أحتاج تأمينًا  " }, 1: { transcript: "Wrong alternative" } },
    1: { length: 1, isFinal: true, 0: { transcript: "صحيًا في أبوظبي" } },
    2: { length: 1, isFinal: false, 0: { transcript: "   " } },
    3: { length: 0, isFinal: false },
  };
  equal(voiceTranscript(results), "أحتاج تأمينًا صحيًا في أبوظبي", "Whitespace and absent hypotheses cannot pollute Arabic dictation");
  equal(voiceTranscript({ length: 0 }), "", "An empty list produces an empty draft");
});

scenario("Stop allows the recognizer's last captured words and never submits a request", () => {
  const f = fixture();
  const recognition = start(f);
  recognition.result([["Open a", false]]);
  f.controller.stop();
  equal(recognition.stopCalls, 1, "Stop asks the browser to finish its current audio");
  equal(recognition.abortCalls, 0, "Stop must allow the last recognition result");
  equal(f.controller.getState().status, "processing", "Processing must not claim the microphone is still listening");
  f.controller.stop();
  equal(recognition.stopCalls, 1, "Repeated stop clicks are harmless");
  recognition.result([["Open a bank account", true]]);
  recognition.ended();
  equal(f.transcripts.at(-1), "Open a bank account", "The last final result remains available for review");
  equal(f.controller.getState().status, "idle", "Finished dictation waits for manual send");
  equal(f.controller.getState().error, null, "Successful final recognition must not leave an error behind");
});

scenario("Stop during permission startup cannot be overwritten by a late start event", () => {
  const f = fixture();
  f.controller.start();
  const recognition = f.current();
  f.controller.stop();
  recognition.started();
  equal(f.controller.getState().status, "processing", "A delayed permission/start event must not resume capture after stop");
  equal(recognition.stopCalls, 1, "Starting-state stop is delivered to the browser");
  f.controller.cancel();
  equal(f.clock.count(), 0, "Cancel also clears startup/processing timers");
});

scenario("Cancel suppresses queued results, errors, and end callbacks", () => {
  const f = fixture();
  const recognition = start(f);
  recognition.result([["Partial request", false]]);
  const callbacks = stash(recognition);
  f.controller.cancel();
  equal(recognition.abortCalls, 1, "Cancel aborts the live microphone session");
  equal(f.controller.getState().transcript, "", "Canceled recognition has no active transcript");
  equal(f.controller.getState().status, "idle", "Cancel leaves voice control ready to retry");
  const savedStates = f.states.length;
  const savedTranscripts = f.transcripts.length;
  lateEvents(callbacks);
  equal(f.states.length, savedStates, "Queued browser callbacks cannot change canceled state");
  equal(f.transcripts.length, savedTranscripts, "Canceled speech cannot refill the user's draft");
  verify([recognition.onstart, recognition.onaudiostart, recognition.onaudioend, recognition.onresult, recognition.onerror, recognition.onend, recognition.onnomatch].every((handler) => handler === null), "Cancel detaches all browser event handlers");
  f.clock.advance(120_000);
  equal(f.states.length, savedStates, "Canceled timeout callbacks cannot show a later error");
});

scenario("Retry isolates the new session from previous recognizers", () => {
  const f = fixture();
  const first = start(f);
  first.result([["Previous words", false]]);
  const callbacks = stash(first);
  f.controller.cancel();
  const second = start(f);
  equal(f.recognizers.length, 2, "A retry creates a separate recognition session");
  equal(f.controller.getState().transcript, "", "Retry begins with a clean session transcript");
  second.result([["Flights from London", true]]);
  lateEvents(callbacks);
  equal(f.controller.getState().transcript, "Flights from London", "Old browser events cannot replace fresh dictation");
  equal(f.controller.getState().status, "listening", "Old end/error events cannot finish or fail the new session");
  f.controller.destroy();
});

scenario("Language changes release old capture and use the new locale on retry", () => {
  const f = fixture();
  const english = start(f);
  f.controller.setLanguage("en");
  equal(english.abortCalls, 0, "Keeping the same language must not interrupt a spoken request");
  const callbacks = stash(english);
  f.controller.setLanguage("ar");
  equal(english.abortCalls, 1, "Language changes stop capture under the previous locale");
  equal(f.controller.getState().status, "idle", "Language change requires a new user-started session");
  const arabic = start(f);
  equal(arabic.lang, "ar-AE", "Arabic recognition uses the UAE locale");
  arabic.result([["أحتاج تأمينًا صحيًا", true]]);
  lateEvents(callbacks);
  equal(f.controller.getState().transcript, "أحتاج تأمينًا صحيًا", "Old-language results cannot overwrite Arabic dictation");
  arabic.error("not-allowed");
  verify(/[\u0600-\u06ff]/.test(f.controller.getState().error), "Microphone permission feedback follows the selected UI language");
});

scenario("Permission, service, silence, device, network, and language errors are explicit and recoverable", () => {
  for (const code of ["not-allowed", "service-not-allowed", "audio-capture", "no-speech", "network", "language-not-supported", "aborted", "unknown-code"]) {
    const f = fixture();
    const recognition = start(f);
    const callbacks = stash(recognition);
    recognition.error(code);
    equal(f.controller.getState().status, "error", `${code} must not pretend recognition succeeded`);
    equal(f.controller.getState().error, voiceErrorMessage(code, "en"), `${code} needs actionable feedback`);
    equal(recognition.abortCalls, 1, `${code} releases microphone capture`);
    equal(f.clock.count(), 0, `${code} cancels microphone timers`);
    const savedStates = f.states.length;
    lateEvents(callbacks);
    equal(f.states.length, savedStates, `${code} cannot be overwritten by queued completion events`);
    const retry = start(f);
    retry.result([["Find a school", true]]);
    retry.ended();
    equal(f.controller.getState().status, "idle", `${code} can be retried after user action`);
    equal(f.controller.getState().error, null, `${code} clears after successful retry`);
    f.controller.destroy();
  }
});

scenario("Unavailable recognition and synchronous browser failures stay honest", () => {
  const unsupported = fixture({ createRecognizer: () => null, supported: false });
  equal(unsupported.controller.getState().status, "unsupported", "Unsupported surfaces report unavailable recognition");
  unsupported.controller.start();
  equal(unsupported.controller.getState().supported, false, "A missing recognizer must not claim microphone support");
  equal(unsupported.controller.getState().error, voiceErrorMessage("unsupported", "en"), "Unsupported browser explains typing fallback");
  equal(unsupported.transcripts, [], "Unavailable speech must not generate a fake transcript");
  for (const errorName of ["SecurityError", "NotAllowedError", "InvalidStateError"]) {
    const failStart = new FakeRecognition();
    failStart.start = () => { throw Object.assign(new Error("browser failure"), { name: errorName }); };
    for (const createRecognizer of [
      () => { throw Object.assign(new Error("constructor failure"), { name: errorName }); },
      () => failStart,
    ]) {
      const f = fixture({ createRecognizer });
      f.controller.start();
      equal(f.controller.getState().status, "error", `${errorName} must be caught instead of crashing the composer`);
      verify(Boolean(f.controller.getState().error), `${errorName} needs helpful feedback`);
      equal(f.clock.count(), 0, `${errorName} cannot leave pending timers`);
      equal(f.transcripts, [], `${errorName} cannot invent recognized speech`);
      f.controller.destroy();
    }
  }
  const crossRealmFailure = fixture({ createRecognizer: () => { throw { name: "SecurityError" }; } });
  crossRealmFailure.controller.start();
  equal(crossRealmFailure.controller.getState().error, voiceErrorMessage("not-allowed", "en"), "Cross-realm permission failures still need actionable microphone feedback");
});

scenario("Silent completion and no-match leave the draft unsent with clear feedback", () => {
  for (const finish of [(recognition) => recognition.ended(), (recognition) => recognition.onnomatch()]) {
    const f = fixture();
    const recognition = start(f);
    finish(recognition);
    equal(f.controller.getState().status, "error", "No recognized speech cannot report success");
    equal(f.controller.getState().error, voiceErrorMessage("no-speech", "en"), "Silence feedback must explain how to retry");
    equal(f.transcripts, [], "Silence cannot create a draft or chat request");
    equal(f.clock.count(), 0, "Silent completion clears session timers");
  }
});

scenario("Startup, listening, and processing timeouts release stuck browser sessions", () => {
  const pending = fixture();
  pending.controller.start();
  pending.clock.advance(19_999);
  equal(pending.controller.getState().status, "starting", "Permission startup remains pending before its deadline");
  pending.clock.advance(1);
  equal(pending.controller.getState().status, "error", "A browser that never starts recognition cannot hang the composer");
  equal(pending.current().abortCalls, 1, "Startup deadline releases the pending session");
  equal(pending.clock.count(), 0, "Startup failure clears its timers");

  const active = fixture();
  const recognition = start(active);
  recognition.result([["A long request", false]]);
  active.clock.advance(59_999);
  equal(active.controller.getState().status, "listening", "Listening stays active before the request limit");
  active.clock.advance(1);
  equal(active.controller.getState().status, "processing", "Long requests stop capture and wait for their final result");
  equal(recognition.stopCalls, 1, "Listening deadline stops audio collection");
  active.clock.advance(10_000);
  equal(active.controller.getState().status, "error", "A browser that never finishes recognition cannot leave a spinner forever");
  equal(recognition.abortCalls, 1, "Processing timeout disconnects the speech service");
  equal(active.clock.count(), 0, "Timed-out processing leaves no microphone timers");
});

scenario("Audio ending waits for final speech without claiming continued listening", () => {
  const f = fixture();
  const recognition = start(f);
  recognition.onaudioend();
  equal(f.controller.getState().status, "processing", "Audio-ended event must update the microphone indicator");
  recognition.result([["I need health insurance", true]]);
  recognition.ended();
  equal(f.transcripts.at(-1), "I need health insurance", "Speech processing after audio end keeps the final words");
  equal(f.clock.count(), 0, "Final audio completion clears deadlines");
});

scenario("Destroy and unsubscribe prevent later callbacks after the composer leaves", () => {
  const f = fixture();
  const recognition = start(f);
  const callbacks = stash(recognition);
  f.unsubscribe();
  const subscribedStates = f.states.length;
  recognition.result([["A draft", false]]);
  equal(f.states.length, subscribedStates, "Unsubscribed UI cannot receive state notifications");
  f.controller.destroy();
  equal(recognition.abortCalls, 1, "Destroy immediately releases microphone capture");
  const savedTranscripts = f.transcripts.length;
  lateEvents(callbacks);
  f.controller.start();
  f.controller.stop();
  f.controller.cancel();
  f.controller.setLanguage("ar");
  f.clock.advance(120_000);
  equal(f.recognizers.length, 1, "Disposed controller must not start another recording");
  equal(f.transcripts.length, savedTranscripts, "Disposed controller must not publish a late transcript");
  equal(f.states.length, subscribedStates, "Disposed controller must not notify React after unmount");
  equal(f.clock.count(), 0, "Destroy clears every scheduled callback");
});

scenario("The current composer callback receives dictation after React rerenders", () => {
  const f = fixture();
  const recognition = start(f);
  const updatedDrafts = [];
  f.controller.setOnTranscript((transcript) => updatedDrafts.push(transcript));
  recognition.result([["Flights from Paris", true]]);
  equal(updatedDrafts, ["Flights from Paris"], "Recognition must target the latest composer callback");
  equal(f.transcripts, [], "A stale callback cannot receive words after a rerender");
  f.controller.destroy();
});

scenario("Synchronous composer teardown cannot start or refill a canceled recording", () => {
  for (const teardown of ["cancel", "destroy"]) {
    const f = fixture();
    f.controller.subscribe(() => {
      if (f.controller.getState().status === "starting") f.controller[teardown]();
    });
    f.controller.start();
    equal(f.current().startCalls, 0, `${teardown} during startup must prevent a later microphone start`);
    equal(f.clock.count(), 0, `${teardown} during startup leaves no timer behind`);
  }
  for (const teardown of ["cancel", "destroy"]) {
    const f = fixture();
    const recognition = start(f);
    f.controller.subscribe(() => {
      if (f.controller.getState().transcript) f.controller[teardown]();
    });
    recognition.result([["Words after the composer leaves", true]]);
    equal(f.transcripts, [], `${teardown} during a result notification cannot refill an obsolete draft`);
  }
  const stopping = fixture();
  const recognition = start(stopping);
  stopping.controller.subscribe(() => {
    if (stopping.controller.getState().status === "processing") stopping.controller.cancel();
  });
  stopping.controller.stop();
  equal(recognition.stopCalls, 0, "Cancel during stop feedback must release rather than operate on a stale recognizer");
  equal(stopping.controller.getState().status, "idle", "A canceled stop cannot be overwritten by a spurious service error");
  equal(stopping.clock.count(), 0, "A canceled stop cannot leave a new deadline running");
});

scenario("Browser capability detection supports native/prefixed APIs and rejects insecure contexts", () => {
  const originalWindow = global.window;
  try {
    delete global.window;
    equal(supportsVoiceInput(), false, "Server rendering must not access browser speech APIs");
    global.window = { isSecureContext: true };
    equal(supportsVoiceInput(), false, "No speech constructor means unsupported");
    global.window = { isSecureContext: true, SpeechRecognition: FakeRecognition };
    equal(supportsVoiceInput(), true, "The standard browser API is supported");
    global.window = { isSecureContext: true, webkitSpeechRecognition: FakeRecognition };
    equal(supportsVoiceInput(), true, "The prefixed browser API is supported");
    global.window = { isSecureContext: false, SpeechRecognition: FakeRecognition };
    equal(supportsVoiceInput(), false, "An insecure origin must not offer nonfunctional recording");
  } finally {
    if (originalWindow === undefined) delete global.window;
    else global.window = originalWindow;
  }
});

scenario("Spoken requests keep bedroom counts, budgets and Arabic category intent", () => {
  const { interpret } = require("../lib/intent.ts");
  equal(interpret("Find me a two bedroom apartment in Al Reem under 130,000 dirhams."), {
    a: "homes", filter: { kind: "rent", area: "reem", beds: 2, max: 130000, school: false },
  }, "A recognizer spelling out two must preserve the housing filters");
  equal(interpret("أحتاج شقة غرفتين في الريم أقل من ١٣٠ ألف درهم"), {
    a: "homes", filter: { kind: "rent", area: "reem", beds: 2, max: 130000, school: false },
  }, "Arabic words, digits and currency magnitude must preserve the same filters");
  equal(interpret("أحتاج تأمينًا صحيًا لعائلتي في أبوظبي."), { a: "topic", topic: "health" }, "The Arabic voice sample must open health cover, rather than a family visa");
  equal(interpret("أريد رحلة من لندن"), { a: "city", city: "London" }, "An Arabic origin must select the correct flight city");
  equal(interpret("أحتاج مدرسة في الريم"), { a: "topic", topic: "school" }, "A district mentioned with schools cannot open housing");
  equal(interpret("I need a golden visa and live in Al Reem"), { a: "visaFor", slug: "golden" }, "A district mentioned with a visa cannot open housing");
});

scenario("Every displayed demo caption has a playable local audio asset", () => {
  const { voiceSamples } = require("../lib/use-voice-demo.ts");
  for (const sample of Object.values(voiceSamples)) {
    const asset = fs.readFileSync(path.join(root, "public", sample.src));
    verify(asset.length > 10000, "The sample must contain actual audio, not an empty stub");
    equal(asset.subarray(4, 8).toString(), "ftyp", "The browser sample must be an MPEG-4 audio container");
    verify(sample.text.length > 20, "The sample must provide a complete, editable request");
  }
});

console.log(`\n${scenarios - failures.length}/${scenarios} scenarios passed; ${checks} checks.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
