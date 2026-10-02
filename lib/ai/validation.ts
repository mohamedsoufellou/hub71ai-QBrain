import type { AIContext, ChatMessage, RelocationProfile, Trip } from "../types";
import { validHealthProfile } from "../health-data";

export class ChatError extends Error {
  constructor(message: string, public status = 400, public code = "INVALID_REQUEST") { super(message); }
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ChatError("Expected an object.");
  return value as Record<string, unknown>;
}
export function string(value: unknown, max = 500): string {
  if (typeof value !== "string" || value.length > max) throw new ChatError("A text value is missing or too long.");
  return value;
}
export function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new ChatError("A numeric value is outside the supported range.");
  return value;
}
export const profileFields = {
  sarahDemoStage: "string",
  name: "string", originCity: "string", moveDate: "string", employment: "string",
  monthlySalary: "number", annualHousingBudget: "number", bedrooms: "number", area: "string",
  housingKind: "string", curriculum: "string", pet: "boolean", furnished: "boolean", priorities: "string",
} as const;
export function validateProfile(value: unknown): RelocationProfile {
  const input = object(value);
  const output: Record<string, unknown> = {};
  for (const [key, type] of Object.entries(profileFields)) {
    const field = input[key];
    if (field === undefined || field === null) continue;
    if (typeof field !== type) throw new ChatError(`Invalid preference: ${key}.`);
    output[key] = type === "string" ? string(field, key === "priorities" ? 1000 : 150) : type === "number" ? integer(field, 0, key === "bedrooms" ? 10 : 100000000) : field;
  }
  if (output.housingKind && !["rent", "buy"].includes(String(output.housingKind))) throw new ChatError("Invalid housing kind.");
  if (output.sarahDemoStage && !["documents", "assessed"].includes(String(output.sarahDemoStage))) throw new ChatError("Invalid demo assessment stage.");
  return output as RelocationProfile;
}
export function validateRequest(value: unknown): { messages: Pick<ChatMessage, "role" | "text">[]; context: AIContext } {
  const body = object(value);
  if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 40) throw new ChatError("Send between 1 and 40 messages.");
  const messages = body.messages.map((value) => {
    const m = object(value);
    if (m.role !== "you" && m.role !== "wusool") throw new ChatError("Invalid message role.");
    return { role: m.role, text: string(m.text, 8000) } as Pick<ChatMessage, "role" | "text">;
  });
  if (messages.at(-1)?.role !== "you" || !messages.at(-1)?.text.trim()) throw new ChatError("The last message must be your request.");
  const c = object(body.context);
  if (c.lang !== "en" && c.lang !== "ar") throw new ChatError("Unsupported language.");
  const f = object(c.family);
  if (typeof f.spouse !== "boolean") throw new ChatError("Invalid family details.");
  const family = { spouse: f.spouse, kids: integer(f.kids, 0, 6), parents: integer(f.parents, 0, 2) };
  const t = object(c.trip);
  const trip: Trip = {};
  for (const key of ["city", "flightLabel", "hotelLabel", "transferLabel"] as const) if (t[key] !== undefined) trip[key] = string(t[key], 500);
  for (const key of ["flightPrice", "hotelTotal"] as const) if (t[key] !== undefined) trip[key] = integer(t[key], 0, 100000000);
  if (!Array.isArray(c.receipts) || c.receipts.length > 100) throw new ChatError("Too many saved records.");
  const kinds = ["viewing", "lease", "visa", "medical", "tax", "bank", "trip", "school", "health"];
  const receipts = c.receipts.map((value) => {
    const r = object(value);
    if (!kinds.includes(String(r.kind)) || !Array.isArray(r.lines) || r.lines.length > 20) throw new ChatError("Invalid saved record.");
    const lines = r.lines.map((line) => {
      if (!Array.isArray(line) || line.length !== 2) throw new ChatError("Invalid record details.");
      return [string(line[0], 200), string(line[1], 1000)] as [string, string];
    });
    return { ref: string(r.ref, 100), kind: r.kind as AIContext["receipts"][number]["kind"], title: string(r.title, 300), lines,
      ...(r.total === undefined ? {} : { total: integer(r.total, 0, 100000000) }), ...(r.stage === undefined ? {} : { stage: integer(r.stage, 0, 4) }) };
  });
  let healthProfile: AIContext["healthProfile"];
  if (c.healthProfile !== undefined) {
    const h = object(c.healthProfile);
    const candidate = { emirate: h.emirate, visa: h.visa, age: h.age, dependants: h.dependants, income: h.income, employerCover: h.employerCover, coverage: h.coverage, hospital: h.hospital } as AIContext["healthProfile"];
    if (!candidate || !validHealthProfile(candidate)) throw new ChatError("Invalid health comparison details.");
    healthProfile = candidate;
  }
  return { messages, context: { lang: c.lang, family, trip, receipts, profile: validateProfile(c.profile), ...(healthProfile ? { healthProfile } : {}) } };
}
