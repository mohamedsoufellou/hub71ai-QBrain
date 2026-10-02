import { cityNames, listingById, schools, visaBySlug } from "../data";
import { run } from "../flow";
import type { AIContext, HomeFilter, Option, Widget } from "../types";
import { catalogueSummary, searchCatalogue, searchHomes, sections, type Section } from "./catalogue";
import { ChatError, integer, object, profileFields, string, validateProfile } from "./validation";

const nullable = (type: string, extra = {}) => ({ type: [type, "null"], ...extra });
const filterProperties = { kind: nullable("string", { enum: ["rent", "buy", null] }), beds: nullable("integer", { minimum: 0, maximum: 10 }), area: nullable("string"), max: nullable("integer", { minimum: 0, maximum: 100000000 }), school: nullable("boolean"), furnished: nullable("boolean"), pet: nullable("boolean") };
const filterSchema = { type: "object", properties: filterProperties, required: Object.keys(filterProperties), additionalProperties: false };
function tool(name: string, description: string, properties: Record<string, unknown>) {
  return { type: "function", name, description, strict: true, parameters: { type: "object", properties, required: Object.keys(properties), additionalProperties: false } };
}
export const services = ["menu", "homes", "home", "visa", "schools", "bank", "travel", "hotels", "transfers", "health", "tax", "file", "medical"] as const;
export const aiTools = [
  tool("search_catalogue", "Search actual seeded service records and source metadata. Empty query lists records; use offset for more results. Search before giving inventory facts. Health results use the collected health profile when present.", { section: { type: "string", enum: sections }, query: { type: "string" }, offset: nullable("integer", { minimum: 0, maximum: 10000 }), limit: nullable("integer", { minimum: 1, maximum: 24 }) }),
  tool("search_homes", "Find exact seeded homes with hard constraints and school proximity ranking. Prices are annual rent or total purchase. Use null for unknown filters. Never invent matching homes.", { filters: filterSchema }),
  tool("remember_preferences", "Save only relocation facts the user explicitly gave or corrected; null means unchanged. This does not book, pay or submit anything.", Object.fromEntries(Object.entries(profileFields).map(([key, type]) => [key, nullable(type === "number" ? "integer" : type)]))),
  tool("forget_preferences", "Remove preferences the user explicitly asks to forget. Use the known field names.", { fields: { type: "array", items: { type: "string", enum: Object.keys(profileFields) }, maxItems: Object.keys(profileFields).length } }),
  tool("preview_service", "Open one interactive card group. home selection is a known property ID; visa selection is a route slug; travel selection is a known city; schools selection is a curriculum; medical selection is an existing user visa reference. Others accept null. homes must reuse search filters. Cards handle all transactions explicitly.", { service: { type: "string", enum: services }, selection: nullable("string"), filters: { ...filterSchema, type: ["object", "null"] } }),
];
export type ToolState = { context: AIContext; widget?: Widget; options?: Option[]; sources: Map<string, { title: string; url: string }> };
export function parseFilter(value: unknown): HomeFilter {
  const f = object(value);
  const filter: HomeFilter = {};
  if (f.kind != null) {
    if (f.kind !== "rent" && f.kind !== "buy") throw new ChatError("Invalid property purpose.");
    filter.kind = f.kind;
  }
  if (f.beds != null) filter.beds = integer(f.beds, 0, 10);
  if (f.max != null) filter.max = integer(f.max, 0, 100000000);
  if (f.area != null) filter.area = string(f.area, 100);
  for (const key of ["school", "furnished", "pet"] as const) if (f[key] != null) {
    if (typeof f[key] !== "boolean") throw new ChatError("Invalid property preference.");
    filter[key] = f[key];
  }
  return filter;
}
function collectSources(result: unknown, state: ToolState) {
  const records = (result as { records?: Record<string, unknown>[] }).records ?? [];
  for (const record of records) {
    const provenance = record.provenance as { title?: string; url?: string } | undefined;
    const url = provenance?.url ?? (typeof record.source === "string" ? record.source : undefined);
    if (url && /^https:\/\//.test(url)) state.sources.set(url, { title: provenance?.title ?? String(record.name ?? "Provider reference"), url });
  }
}
export function executeTool(name: string, raw: unknown, state: ToolState): unknown {
  const args = object(raw);
  switch (name) {
    case "search_catalogue": {
      if (!sections.includes(args.section as Section)) throw new ChatError("Unknown catalogue section.");
      const result = searchCatalogue(args.section as Section, string(args.query, 300), args.offset == null ? 0 : integer(args.offset, 0, 10000), args.limit == null ? 12 : integer(args.limit, 1, 24), state.context);
      collectSources(result, state); return result;
    }
    case "search_homes": {
      const result = searchHomes(parseFilter(args.filters)); collectSources(result, state); return result;
    }
    case "remember_preferences": {
      const updates = validateProfile(args);
      state.context.profile = { ...state.context.profile, ...updates };
      return { profile: state.context.profile, note: "Explicit preferences saved for this local session; no transaction occurred." };
    }
    case "forget_preferences": {
      if (!Array.isArray(args.fields) || args.fields.length > Object.keys(profileFields).length) throw new ChatError("Invalid preference fields.");
      const profile = { ...state.context.profile };
      for (const field of args.fields) {
        if (typeof field !== "string" || !(field in profileFields)) throw new ChatError("Unknown preference field.");
        delete profile[field as keyof typeof profile];
      }
      state.context.profile = profile; return { profile };
    }
    case "preview_service": {
      const service = string(args.service, 40);
      if (!services.includes(service as typeof services[number])) throw new ChatError("Unknown service.");
      const selection = args.selection == null ? undefined : string(args.selection, 150);
      let result;
      const context = state.context;
      if (service === "homes") {
        const filters = args.filters == null ? {} : parseFilter(args.filters);
        const matches = searchHomes(filters);
        state.widget = { t: "homes", ids: matches.records.slice(0, 4).map((record) => String(record.id)) };
        state.options = [{ label: "Change home preferences", action: { a: "topic", topic: "home" } }];
        return { ...matches, shownIds: state.widget.ids, note: "The exact matches appear as interactive property cards." };
      }
      if (service === "home") {
        if (!selection || !listingById(selection)) throw new ChatError("Unknown home ID.");
        result = run({ a: "home", id: selection }, context);
      } else if (service === "visa" && selection) {
        if (!visaBySlug(selection)) throw new ChatError("Unknown visa route.");
        result = run({ a: "visaFor", slug: selection }, context);
      } else if (service === "schools") {
        if (selection && selection !== "all" && !schools.some((s) => s.curriculum === selection)) throw new ChatError("Unknown curriculum.");
        result = run({ a: "schools", curriculum: selection ?? "all" }, context);
      } else if (service === "travel" && selection) {
        const city = cityNames.find((city) => city.toLowerCase() === selection.toLowerCase());
        if (!city) throw new ChatError("Unknown departure city.");
        // Preview does not alter the selected itinerary; flight cards set it on selection.
        result = run({ a: "city", city }, context);
      } else if (service === "hotels" || service === "transfers") {
        state.widget = { t: service === "hotels" ? "hotels" : "pickup" };
        state.options = undefined;
        return { shown: service, note: "These are previews; select a flight first, then a hotel, then transport to complete travel checkout." };
      } else if (service === "health" && context.healthProfile) {
        result = run({ a: "healthPlans", profile: context.healthProfile }, context);
      } else if (service === "medical") {
        if (!selection || !context.receipts.some((r) => r.kind === "visa" && r.ref === selection)) throw new ChatError("An existing demo visa reference is required.");
        result = run({ a: "medical", ref: selection }, context);
      } else {
        const topic = service === "travel" ? "arrive" : service === "homes" || service === "home" ? "home" : service === "schools" ? "school" : service;
        if (!["menu", "home", "visa", "school", "bank", "arrive", "health", "tax", "file"].includes(topic)) throw new ChatError("Unsupported preview.");
        result = run({ a: "topic", topic: topic as "menu" }, context);
      }
      if (result.receipt || result.advance || result.family) throw new ChatError("Transactions must use the interactive controls.");
      state.widget = result.widget; state.options = result.options;
      return { text: result.text, widget: result.widget, options: result.options, inventoryCounts: catalogueSummary() };
    }
    default: throw new ChatError("Unknown tool.");
  }
}
