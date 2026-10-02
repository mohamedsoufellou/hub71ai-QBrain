import type { District, Hotel, Listing, Quote, School } from "./types";
import type { HealthPlan } from "./health-data";

// Deterministic fictional inventory. Never presented as verified provider offers.
export const SIMULATION_NOTE = "Fictional Wusool simulation record. Prices, availability, eligibility and benefits are invented for testing; no real provider or partnership is represented.";

export function extraHomes(districts: District[]): Listing[] {
  return districts.flatMap((district, areaIndex) =>
    ["rent", "buy"].flatMap((kind) =>
      [0, 1, 2, 3, 4, 5].flatMap((beds) =>
        [0, 1].map((variant): Listing => ({
          id: `demo-home-${district.slug}-${kind}-${beds}-${variant}`,
          title: `${beds === 0 ? "Studio" : `${beds}-bedroom ${beds >= 4 ? "villa" : "apartment"}`} · ${variant ? "garden" : "city"} collection`,
          area: district.name, areaSlug: district.slug, cluster: district.cluster,
          kind: kind as "rent" | "buy", beds, baths: Math.max(1, beds + variant),
          sqm: 38 + beds * 48 + variant * 16,
          price: kind === "rent" ? 38000 + areaIndex * 3500 + beds * 28000 + variant * 9000 : 520000 + areaIndex * 85000 + beds * 610000 + variant * 180000,
          furnished: variant === 1, pet: beds >= 2 || variant === 1,
          schoolKm: Math.round((0.6 + ((areaIndex + beds + variant) % 7) * 0.7) * 10) / 10,
          community: `Wusool Demo ${district.name} ${variant ? "Gardens" : "Court"}`,
          note: SIMULATION_NOTE,
          image: beds >= 4 ? "/photos/khalifa-villa.jpg" : district.cluster === "yas" ? "/photos/yas-links.jpg" : district.cluster === "saadiyat" ? "/photos/saadiyat-garden.jpg" : district.cluster === "raha" ? "/photos/raha-gardens.jpg" : "/photos/reem-marina.jpg",
        })),
      ),
    ),
  );
}

export function extraSchools(districts: District[]): School[] {
  return districts.flatMap((district, i) => ["British", "American", "International Baccalaureate", "Indian CBSE"].map((curriculum, j) => ({
    id: `demo-school-${district.slug}-${j}`, name: `Demo ${district.name} ${curriculum} School`,
    curriculum, fees: `AED ${18000 + i * 2500 + j * 8000}–${35000 + i * 3000 + j * 9000} · fictional annual tuition`,
    area: district.name, areaSlug: district.slug,
    turnaround: "Demo enquiry; simulated assessment and wait-list scenarios",
    review: `${SIMULATION_NOTE} ${j % 2 ? "Simulated waiting list for some year groups." : "Simulated enquiry availability; no place is reserved."} Books, transport and uniforms are separate scenario costs.`,
  })));
}

function demoQuote(id: string, name: string, price: number, note: string): Quote {
  return { id: `demo-${id}`, name: `${name} · fictional demo`, price, role: "Provider", turnaround: "Simulation only; no live appointment", review: SIMULATION_NOTE, note };
}
export const extraBanks = [
  ["starter", "Starter salary account", "Scenario: salary AED 3,000; resident ID and salary evidence; fictional monthly fee AED 20."],
  ["salary", "Everyday salary account", "Scenario: salary AED 5,000; resident ID and salary evidence; fictional monthly fee AED 0 with qualifying payroll."],
  ["premium", "Premium relationship account", "Scenario: salary AED 20,000 or balance AED 100,000; fictional monthly fee AED 100 when criteria are missed."],
  ["islamic", "Islamic account scenario", "Fictional Islamic-product comparison; balance AED 3,000; actual Sharia certification is not claimed."],
  ["freelancer", "Freelancer account", "Scenario: resident ID, permit and source-of-funds review; monthly fee AED 50."],
  ["founder", "Founder business account", "Scenario: company licence, ownership chart, source of funds and registered address; monthly fee AED 150."],
  ["joint", "Joint household account", "Scenario: resident identity verification for both adults; monthly fee AED 25."],
  ["student", "Student account", "Scenario: adult student, resident ID and enrolment letter; monthly fee AED 0."],
  ["nonresident", "Nonresident savings enquiry", "Scenario only: passport, overseas address and enhanced review; no current-account or approval promise."],
  ["multicurrency", "Multi-currency account", "Scenario: resident ID and income evidence; foreign-exchange and international-transfer fees apply."],
  ["retiree", "Retiree account", "Scenario: resident ID and pension evidence; monthly fee AED 30."],
  ["family", "Family budgeting account", "Scenario: resident identity evidence; family budgeting features; monthly fee AED 40."],
].map(([id, name, note]) => demoQuote(`bank-${id}`, name, 0, note));

export function extraHotels(districts: District[]): Hotel[] {
  return districts.flatMap((district, i) => ["Studio", "Family suite"].map((room, j) => ({
    id: `demo-hotel-${district.slug}-${j}`, name: `Demo ${district.name} ${room} Stay`, area: district.name,
    note: `${SIMULATION_NOTE} ${j ? "Two-bedroom family scenario with kitchen and laundry." : "Compact extended-stay scenario with kitchenette."}`,
    image: j ? "/photos/hotel-reem.jpg" : "/photos/hotel-yas.jpg",
    quotes: [demoQuote("stay-standard", "Standard nightly budget", 220 + i * 35 + j * 180, "Fictional nightly amount; tax, meals and cancellation conditions require review."), demoQuote("stay-flex", "Flexible nightly budget", 280 + i * 40 + j * 200, "Fictional flexible-room scenario; no real refund terms are guaranteed.")],
  })));
}
export const extraTransfers = [
  ["solo", "Solo city transfer", 90], ["family", "Family MPV transfer", 190], ["child-seat", "Child-seat transfer", 230],
  ["accessible", "Accessible vehicle enquiry", 220], ["large-luggage", "Large-luggage van", 280], ["premium", "Premium transfer", 420],
  ["yas", "Airport to Yas scenario", 75], ["raha", "Airport to Al Raha scenario", 85], ["saadiyat", "Airport to Saadiyat scenario", 160],
  ["late", "Late arrival transfer", 175], ["group", "Group minibus", 450], ["pet", "Pet-friendly transfer enquiry", 210],
].map(([id, name, price]) => demoQuote(`transfer-${id}`, String(name), Number(price), "Fictional vehicle option. Passenger capacity, luggage, accessibility and child seats must be verified."));

export const extraChannels = ["Document review", "Family attestation support", "Investor document support", "Freelance file preparation", "Translation support", "Renewal document review", "Priority file review", "Remote document consultation"].map((name, i) => demoQuote(`visa-channel-${i}`, name, 150 + i * 75, "Fictional assistance charge; official government fees, attestation and insurance are separate. No submission occurs."));
export const extraCentres = ["City standard screening", "Island standard screening", "Airport-side screening", "Family adult screening", "Weekend screening", "Priority screening", "Accessible screening", "Evening screening"].map((name, i) => demoQuote(`medical-${i}`, name, 250 + i * 40, "Fictional adult residence-screening scenario; this is not a real approved centre, clinical service or result."));
export const extraFilers = ["Simple salary residency review", "Multi-country residency review", "Freelancer residency evidence", "Founder residency evidence", "Family residency evidence", "Treaty certificate review", "Complex travel-day review", "Document translation support"].map((name, i) => ({ ...demoQuote(`tax-${i}`, name, 1350 + i * 250, "Fictional adviser charge plus the existing unregistered-individual FTA fee scenario; eligibility and foreign obligations need separate review."), role: "PRO" as const }));

export const extraHealthPlans: HealthPlan[] = ["Local essentials", "Local family", "Regional cover", "Worldwide excluding North America", "Worldwide comprehensive", "Senior cover"].flatMap((tier, i) => [0, 1, 2].map((variant) => ({
  id: `demo-health-${i}-${variant}`, insurer: "Wusool Demo Insurer (fictional)", name: `${tier} ${["Core", "Plus", "Complete"][variant]} · simulation`,
  area: i < 2 ? "UAE scenario network" : i === 3 ? "Worldwide scenario excluding USA and Canada" : i >= 4 ? "Worldwide scenario" : "Regional scenario; confirm countries",
  annualLimit: `AED ${150000 + i * 300000 + variant * 150000} · fictional benefit limit`,
  premium: "Simulation only; no personalised or binding premium",
  detail: `${SIMULATION_NOTE} Medical underwriting, waiting periods, exclusions and hospital access are unresolved.`,
  benefits: ["Simulated inpatient and outpatient benefits", "Simulated emergency benefit", ...(variant ? ["Optional dental and optical scenario"] : [])],
  source: "", international: i >= 2,
})));

export const visaScenarios = ["employment", "family", "golden", "green", "freelance", "investor"].flatMap((route) =>
  ["pre-arrival", "documents-missing", "documents-ready", "under-review", "medical-required", "renewal"].map((stage, i) => ({
    id: `demo-visa-${route}-${stage}`, route, stage, simulation: true,
    title: `${route} · ${stage} scenario`,
    blockers: i === 1 ? ["Missing attested document", "Insurance confirmation pending"] : i === 0 ? ["Sponsor and category confirmation pending"] : [],
    next: i === 4 ? "Adult applicant screening preference; no medical result is generated" : i === 3 ? "Simulated status review; no approval date promised" : "Review the route checklist and supporting evidence",
    note: SIMULATION_NOTE,
  })));

export const taxScenarios = [0, 45, 89, 90, 120, 182, 183, 250, 330, 365].flatMap((days) => ["salary", "business"].map((income) => ({
  id: `demo-tax-${days}-${income}`, days, income, simulation: true,
  note: "Use the existing tax flow for a general domestic-residence illustration. Days alone do not establish treaty residence, certificate approval or exemption in another country.",
})));

export const relocationChecklist = [
  { id: "pre-arrival", title: "Before arrival", tasks: ["Confirm sponsor and residence route", "Prepare passport and attestation checklist", "Review employer health cover", "Choose a temporary stay", "Record moving budget and family needs"] },
  { id: "first-week", title: "First week", tasks: ["Preview airport transport", "Tour shortlisted homes", "Review adult medical-screening steps", "Compare school admissions requirements", "Prepare bank identity evidence"] },
  { id: "settling", title: "Settling in", tasks: ["Review tenancy and Tawtheeq steps", "Compare insurer network and exclusions", "Confirm school assessment and transport", "Complete provider onboarding directly", "Track saved demo requests in My file"] },
];
