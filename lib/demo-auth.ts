export type AuthMethod = "email" | "uae-pass";

export type DemoProfile = {
  id: string;
  name: string;
  email: string;
  method: AuthMethod;
};

export type DemoAuthError = "email" | "name" | "code" | "unknown-account" | "duplicate";
export type DemoAuthResult = { ok: true } | { ok: false; error: DemoAuthError };
export type DemoAuthData = { profile: DemoProfile | null; accounts: DemoProfile[] };
export type DemoAuthChange = { result: DemoAuthResult; state: DemoAuthData };

/** A public demonstration code, never an authentication credential. */
export const DEMO_EMAIL_CODE = "246810";

export const EXAMPLE_PROFILE: Readonly<DemoProfile> = Object.freeze({
  id: "demo-email:maya@example.com",
  name: "Maya Hassan",
  email: "maya@example.com",
  method: "email",
});

/** An invented demonstration identity. No UAE PASS service or ID verification is involved. */
export const UAE_PASS_DEMO_PROFILE: Readonly<DemoProfile> = Object.freeze({
  id: "demo-uae-pass:maya",
  name: "Maya Hassan",
  email: "maya@example.com",
  method: "uae-pass",
});

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 80 && !/[\u0000-\u001f\u007f]/.test(name) ? name : null;
}

export function normalizeDemoEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254) return null;
  const parts = email.split("@");
  if (parts.length !== 2 || !parts[0] || parts[0].length > 64) return null;
  if (parts[0].startsWith(".") || parts[0].endsWith(".") || parts[0].includes("..")) return null;
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(email)
    ? email
    : null;
}

function emailProfile(name: string, email: string): DemoProfile {
  return { id: `demo-email:${email}`, name, email, method: "email" };
}

export function initialDemoAuth(): DemoAuthData {
  return { profile: null, accounts: [{ ...EXAMPLE_PROFILE }] };
}

/** Rebuild persisted state from allowed nonsecret fields, ignoring everything else. */
export function sanitizeDemoAuth(value: unknown): DemoAuthData {
  const saved = record(value);
  const accounts: DemoProfile[] = [{ ...EXAMPLE_PROFILE }];
  if (Array.isArray(saved?.accounts)) {
    for (const raw of saved.accounts) {
      const entry = record(raw);
      const email = normalizeDemoEmail(entry?.email);
      const name = cleanName(entry?.name);
      if (!email || !name || entry?.method !== "email" || accounts.some((account) => account.email === email)) continue;
      accounts.push(emailProfile(name, email));
    }
  }
  const savedProfile = record(saved?.profile);
  let profile: DemoProfile | null = null;
  if (savedProfile?.method === "email") {
    const email = normalizeDemoEmail(savedProfile.email);
    const account = accounts.find((candidate) => candidate.email === email);
    if (account) profile = { ...account };
  } else if (
    savedProfile?.method === "uae-pass"
    && savedProfile.id === UAE_PASS_DEMO_PROFILE.id
    && savedProfile.name === UAE_PASS_DEMO_PROFILE.name
    && savedProfile.email === UAE_PASS_DEMO_PROFILE.email
  ) {
    profile = { ...UAE_PASS_DEMO_PROFILE };
  }
  return { profile, accounts };
}

function failure(state: DemoAuthData, error: DemoAuthError): DemoAuthChange {
  return { result: { ok: false, error }, state };
}

export function signInDemo(state: DemoAuthData, emailInput: string, code: string): DemoAuthChange {
  const email = normalizeDemoEmail(emailInput);
  if (!email) return failure(state, "email");
  if (code.trim() !== DEMO_EMAIL_CODE) return failure(state, "code");
  const account = state.accounts.find((candidate) => candidate.email === email);
  if (!account) return failure(state, "unknown-account");
  return { result: { ok: true }, state: { ...state, profile: { ...account, method: "email" } } };
}

export function registerDemo(state: DemoAuthData, nameInput: string, emailInput: string): DemoAuthChange {
  const name = cleanName(nameInput);
  if (!name) return failure(state, "name");
  const email = normalizeDemoEmail(emailInput);
  if (!email) return failure(state, "email");
  if (state.accounts.some((account) => account.email === email)) return failure(state, "duplicate");
  const profile = emailProfile(name, email);
  return {
    result: { ok: true },
    state: { profile, accounts: [...state.accounts, profile] },
  };
}

export function signInDemoWithUaePass(state: DemoAuthData): DemoAuthData {
  return { ...state, profile: { ...UAE_PASS_DEMO_PROFILE } };
}

export function signOutDemo(state: DemoAuthData): DemoAuthData {
  return { ...state, profile: null };
}
