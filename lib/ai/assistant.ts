import { run } from "../flow";
import { interpret } from "../intent";
import type { AIContext, AIReply, ChatMessage } from "../types";
import { runSarahDemo } from "../sarah-demo";

export const DEMO_MODEL = "mock";

export async function runAssistant(messages: Pick<ChatMessage, "role" | "text">[], context: AIContext): Promise<AIReply> {
  const scenario = runSarahDemo(messages, context.profile);
  if (scenario) return scenario;
  const action = interpret(messages.at(-1)?.text ?? "") ?? { a: "topic", topic: "menu" };
  const profile = { ...context.profile };
  if (action.a === "homes") {
    const { kind, max, beds, area, pet, furnished } = action.filter;
    if (kind !== undefined) profile.housingKind = kind;
    if (max !== undefined) profile.annualHousingBudget = max;
    if (beds !== undefined) profile.bedrooms = beds;
    if (area !== undefined) profile.area = area;
    if (pet !== undefined) profile.pet = pet;
    if (furnished !== undefined) profile.furnished = furnished;
  }
  if (action.a === "city") profile.originCity = action.city;
  const result = run(action, context);
  return { text: result.text, widget: result.widget, options: result.options, profile, model: DEMO_MODEL, sources: [] };
}
