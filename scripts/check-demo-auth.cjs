/* Run with node scripts/check-demo-auth.cjs. All identities and storage in this runner are synthetic. */
/* eslint-disable @typescript-eslint/no-require-imports -- Transpile the application's TypeScript modules for Node without an additional test dependency. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const stored = new Map();
global.localStorage = {
  getItem: (key) => stored.get(key) ?? null,
  setItem: (key, value) => stored.set(key, String(value)),
  removeItem: (key) => stored.delete(key),
};

const {
  DEMO_EMAIL_CODE,
  EXAMPLE_PROFILE,
  UAE_PASS_DEMO_PROFILE,
  initialDemoAuth,
  normalizeDemoEmail,
  registerDemo,
  sanitizeDemoAuth,
  signInDemo,
  signInDemoWithUaePass,
  signOutDemo,
} = require("../lib/demo-auth.ts");

let checks = 0;
let scenarios = 0;
const failures = [];
function equal(actual, expected, message) { checks++; assert.deepEqual(actual, expected, message); }
function verify(value, message) { checks++; assert.ok(value, message); }
async function scenario(name, run) {
  scenarios++;
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function freshStore() {
  const filename = path.resolve(__dirname, "../lib/auth-store.ts");
  delete require.cache[filename];
  return require(filename).useAuth;
}

async function run() {
  await scenario("Fresh preview and the public example account", () => {
    const state = initialDemoAuth();
    equal(state.profile, null, "No guest is automatically signed in");
    equal(state.accounts, [EXAMPLE_PROFILE], "The supplied example account exists on first visit");
    const change = signInDemo(state, " MAYA@EXAMPLE.COM ", DEMO_EMAIL_CODE);
    equal(change.result, { ok: true }, "The public demo code signs in the example account");
    equal(change.state.profile, EXAMPLE_PROFILE, "Email casing and surrounding whitespace reconcile");
    equal(state.profile, null, "Model transitions do not mutate the previous snapshot");
  });

  await scenario("Invalid email, code and missing account do not establish a session", () => {
    const state = initialDemoAuth();
    for (const email of ["", "maya", "maya@", "@example.com", "maya@@example.com", ".maya@example.com", "maya..hassan@example.com", "maya@-example.com", "maya@example.c"]) {
      equal(normalizeDemoEmail(email), null, `Reject ${JSON.stringify(email)}`);
      const change = signInDemo(state, email, DEMO_EMAIL_CODE);
      equal(change.result, { ok: false, error: "email" }, "Return a translatable email error");
      equal(change.state, state, "Keep the session and accounts unchanged");
    }
    equal(signInDemo(state, "maya@example.com", "123456").result, { ok: false, error: "code" }, "An arbitrary code is not a successful demo login");
    equal(signInDemo(state, "missing@example.com", DEMO_EMAIL_CODE).result, { ok: false, error: "unknown-account" }, "A missing local account requires registration");
    equal(state.profile, null, "Failed attempts do not create a profile");
  });

  await scenario("Registration, duplicate reconciliation and later email sign-in", () => {
    const initial = initialDemoAuth();
    equal(registerDemo(initial, " ", "lina@example.com").result, { ok: false, error: "name" }, "An empty display name has an explicit error");
    equal(registerDemo(initial, "Lina", "bad-email").result, { ok: false, error: "email" }, "Registration validates the email");
    const created = registerDemo(initial, "  Lina   Ahmed  ", " LINA@EXAMPLE.COM ");
    equal(created.result, { ok: true }, "Valid registration immediately starts the demo session");
    equal(created.state.profile, { id: "demo-email:lina@example.com", name: "Lina Ahmed", email: "lina@example.com", method: "email" }, "Registration normalizes only public profile fields");
    equal(created.state.accounts.length, 2, "Registration adds one local account");
    equal(initial.accounts.length, 1, "Previous accounts remain immutable");
    const duplicate = registerDemo(created.state, "Different Person", "LINA@example.com");
    equal(duplicate.result, { ok: false, error: "duplicate" }, "Case-insensitive duplicates ask the user to sign in");
    equal(duplicate.state, created.state, "A duplicate cannot overwrite a name or session");
    const signedOut = signOutDemo(created.state);
    equal(signedOut.profile, null, "Sign-out removes only the session");
    equal(signedOut.accounts, created.state.accounts, "The registered local account remains available");
    equal(signInDemo(signedOut, "lina@example.com", DEMO_EMAIL_CODE).state.profile, created.state.profile, "Registered users can sign back in with the public demonstration code");
  });

  await scenario("UAE PASS is an explicit fixed simulation", () => {
    const original = initialDemoAuth();
    const state = signInDemoWithUaePass(original);
    equal(state.profile, UAE_PASS_DEMO_PROFILE, "Only the supplied fictional identity is created");
    equal(state.profile.method, "uae-pass", "The session exposes the simulated method");
    equal(state.accounts, original.accounts, "UAE PASS does not create a credential account");
    equal(original.profile, null, "The prior guest remains unchanged");
    equal(Object.keys(state.profile).sort(), ["email", "id", "method", "name"], "No real ID, token, password or verification claim exists");
    equal(signOutDemo(state).profile, null, "The simulated session signs out normally");
  });

  await scenario("Persisted profiles are rebuilt from a strict nonsecret allowlist", () => {
    const saved = {
      password: "do-not-store",
      token: "do-not-store",
      verified: true,
      accounts: [
        { id: "forged", name: "Maya Changed", email: "MAYA@example.com", method: "email", password: "secret" },
        { id: "forged", name: "Lina Ahmed", email: "LINA@example.com", method: "email", password: "secret", emiratesId: "not-an-id" },
        { name: "Duplicate", email: "lina@example.com", method: "email" },
        { name: "Invalid", email: "invalid", method: "email" },
        { name: "Real-looking claim", email: "someone@example.com", method: "uae-pass", verified: true },
      ],
      profile: { id: "forged", name: "Override", email: "lina@example.com", method: "email", accessToken: "secret", demoCode: DEMO_EMAIL_CODE },
    };
    const state = sanitizeDemoAuth(saved);
    equal(state.accounts.length, 2, "Only distinct valid local email accounts survive");
    equal(state.accounts[0], EXAMPLE_PROFILE, "The built-in example remains consistent");
    equal(state.profile, state.accounts[1], "An email session resolves to its stored account");
    equal(state.profile.id, "demo-email:lina@example.com", "An arbitrary persisted ID is replaced with the demo identity");
    equal(Object.keys(state).sort(), ["accounts", "profile"], "Unknown top-level fields are discarded");
    equal(Object.keys(state.accounts[1]).sort(), ["email", "id", "method", "name"], "Sensitive account fields are discarded");
    for (const secret of ["password", "token", "accessToken", "emiratesId", "verified", "demoCode", DEMO_EMAIL_CODE]) {
      verify(!JSON.stringify(state).includes(secret), `Persistence excludes ${secret}`);
    }
    equal(sanitizeDemoAuth({ accounts: [], profile: { ...EXAMPLE_PROFILE, email: "unregistered@example.com" } }).profile, null, "A missing account cannot restore an email session");
    equal(sanitizeDemoAuth({ profile: { ...UAE_PASS_DEMO_PROFILE, name: "An invented verified identity" } }).profile, null, "Unknown UAE PASS identities are discarded");
    equal(sanitizeDemoAuth({ profile: UAE_PASS_DEMO_PROFILE }).profile, UAE_PASS_DEMO_PROFILE, "Only the explicit UAE PASS mock restores");
    for (const malformed of [null, "bad-json", 7, [], { accounts: [null, {}, []], profile: [] }]) {
      equal(sanitizeDemoAuth(malformed), initialDemoAuth(), "Malformed persistence falls back to a guest demo");
    }
  });

  await scenario("Real Zustand persistence, reload hydration and chat isolation", async () => {
    stored.clear();
    const chat = JSON.stringify({ state: { messages: [{ id: "keep", text: "Existing relocation plan" }], receipts: [{ ref: "keep-file" }] }, version: 4 });
    stored.set("wusool", chat);
    const store = freshStore();
    equal(store.getState().profile, null, "Store starts as a guest");
    equal(store.getState().register("Sara Ali", "sara@example.com"), { ok: true }, "The UI store uses the registration model");
    const saved = JSON.parse(stored.get("wusool-demo-auth"));
    equal(saved.state.profile.name, "Sara Ali", "The demonstration session is saved locally");
    equal(Object.keys(saved.state).sort(), ["accounts", "profile"], "Only nonsecret data enters storage");
    equal(stored.get("wusool"), chat, "Registration preserves the existing conversation and receipts");
    const reloaded = freshStore();
    equal(reloaded.getState().profile, null, "skipHydration avoids a server/client initial-render mismatch");
    await reloaded.persist.rehydrate();
    equal(reloaded.getState().profile.name, "Sara Ali", "Explicit client hydration restores the saved session");
    reloaded.getState().signOut();
    equal(reloaded.getState().profile, null, "Store sign-out clears the session");
    equal(reloaded.getState().accounts.length, 2, "Sign-out keeps the registered account");
    equal(stored.get("wusool"), chat, "Sign-out preserves the existing conversation and receipts");
    equal(reloaded.getState().signIn("sara@example.com", DEMO_EMAIL_CODE), { ok: true }, "A registered account signs back in through the store");
    reloaded.getState().signInWithUaePass();
    equal(reloaded.getState().profile, UAE_PASS_DEMO_PROFILE, "The store supplies the simulated UAE PASS profile");
    equal(stored.get("wusool"), chat, "UAE PASS also leaves the conversation intact");
  });

  await scenario("Store hydration strips legacy secrets without replacing actions", async () => {
    stored.set("wusool-demo-auth", JSON.stringify({ version: 0, state: { profile: { ...EXAMPLE_PROFILE, password: "legacy-secret" }, accounts: [EXAMPLE_PROFILE], accessToken: "legacy-token" } }));
    const store = freshStore();
    await store.persist.rehydrate();
    equal(store.getState().profile, EXAMPLE_PROFILE, "The old demo session migrates without credentials");
    verify(typeof store.getState().signOut === "function", "Persisted data cannot replace store actions");
    const saved = stored.get("wusool-demo-auth");
    verify(!saved.includes("legacy-secret") && !saved.includes("legacy-token"), "Migration rewrites storage without sensitive fields");
    store.getState().signOut();
    equal(store.getState().profile, null, "Store actions remain functional after migration");
  });

  console.log(`\n${scenarios} scenarios, ${checks} checks${failures.length ? `, ${failures.length} failure(s)` : " passed"}.`);
  if (failures.length) process.exitCode = 1;
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
