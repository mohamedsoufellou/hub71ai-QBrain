import { banks, centres, cityNames, districts, filers, flightsFrom, homeQuotes, hotels, listings, schools, transfers, visaChannels, visaFees, visas } from "../data";
import { healthDocuments, healthHospitals, healthPlans, matchHealthPlans } from "../health-data";
import { relocationChecklist, SIMULATION_NOTE, taxScenarios, visaScenarios } from "../simulation-seeds";
import { DATA_CHECKED_AT, sourceForSeed } from "../source-data";
import type { AIContext, HomeFilter } from "../types";

export const sections = ["districts", "homes", "visas", "visa_scenarios", "visa_channels", "medical", "schools", "banks", "flights", "hotels", "transfers", "health", "hospitals", "tax", "tax_scenarios", "checklist"] as const;
export type Section = typeof sections[number];
export function records(section: Section, context: AIContext): unknown[] {
  switch (section) {
    case "districts": return districts;
    case "homes": return listings.map((home) => ({ ...home, quotes: homeQuotes(home) }));
    case "visas": return visas.map((visa) => ({ ...visa, feeIllustrationForOneApplicant: visaFees(visa.slug, 1) }));
    case "visa_scenarios": return visaScenarios;
    case "visa_channels": return visaChannels;
    case "medical": return centres;
    case "schools": return schools;
    case "banks": return banks;
    case "flights": return cityNames.flatMap(flightsFrom);
    case "hotels": return hotels;
    case "transfers": return transfers;
    case "health": return (context.healthProfile ? matchHealthPlans(context.healthProfile) : healthPlans).map((plan) => ({ ...plan, documents: healthDocuments, eligibilityChecked: Boolean(context.healthProfile) }));
    case "hospitals": return healthHospitals;
    case "tax": return filers;
    case "tax_scenarios": return taxScenarios;
    case "checklist": return relocationChecklist;
  }
}
export function describeRecord(value: unknown) {
  const record = value as Record<string, unknown>;
  const id = String(record.id ?? record.slug ?? "");
  const source = sourceForSeed(id);
  return { ...record, id, provenance: id.startsWith("demo-") ? { basis: "fictional", note: SIMULATION_NOTE } : source ? { ...source, checkedAt: DATA_CHECKED_AT } : { basis: "reference-or-illustration", note: "Seed reference or scenario; not live availability or guaranteed eligibility." } };
}
export function searchCatalogue(section: Section, query: string, offset = 0, limit = 12, context: AIContext) {
  const pool = records(section, context);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const ranked = pool.map((record) => ({ record, score: terms.reduce((score, term) => score + (JSON.stringify(record).toLowerCase().includes(term) ? 1 : 0), 0) }))
    .filter((item) => !terms.length || item.score > 0).sort((a, b) => b.score - a.score);
  return { section, totalInSection: pool.length, matchingCount: ranked.length, offset, nextOffset: offset + limit < ranked.length ? offset + limit : null, records: ranked.slice(offset, offset + limit).map((item) => describeRecord(item.record)) };
}
export function searchHomes(filter: HomeFilter) {
  const pool = listings.filter((home) => (!filter.kind || home.kind === filter.kind) && (!filter.area || home.areaSlug === filter.area)
    && (filter.beds === undefined || home.beds >= filter.beds) && (filter.max === undefined || home.price <= filter.max)
    && (filter.furnished === undefined || home.furnished === filter.furnished) && (!filter.pet || home.pet));
  const sorted = [...pool].sort((a, b) => filter.school ? a.schoolKm - b.schoolKm || a.price - b.price : a.price - b.price);
  return { filter, exact: sorted.length > 0, matchingCount: sorted.length, records: sorted.slice(0, 12).map((home) => describeRecord({ ...home, priceBasis: home.kind === "rent" ? "AED per year" : "AED total purchase", quotes: homeQuotes(home) })), note: sorted.length ? "Every returned home satisfies the supplied constraints; school proximity is a ranking." : "No exact matches. Ask which constraint to change; do not call a relaxed match exact." };
}
export function catalogueSummary() {
  return { homes: listings.length, districts: districts.length, visaRoutes: visas.length, visaScenarios: visaScenarios.length, visaChannels: visaChannels.length, medical: centres.length,
    schools: schools.length, banks: banks.length, departureCities: cityNames.length, flights: cityNames.reduce((count, city) => count + flightsFrom(city).length, 0), hotels: hotels.length,
    transfers: transfers.length, healthPlans: healthPlans.length, taxProviders: filers.length, taxScenarios: taxScenarios.length };
}
