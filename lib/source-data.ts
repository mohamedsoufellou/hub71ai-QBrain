/** Primary reference sources for seeded demo data. These do not establish
 * live inventory, commercial partnerships, appointments or guaranteed approval. */
export const DATA_CHECKED_AT = "2026-10-02";
export const SEED_DATA_NOTE = "Provider facts and published school fees checked on 2 October 2026. Property inventory, photographs, travel fares, hotel rates and assistance charges are illustrative. Confirm dates, eligibility and final terms with the provider.";

export type SeedSource = {
  title: string;
  url: string;
  checkedAt: string;
  basis: "published" | "reference-only" | "illustrative";
  scope: string;
};
function source(title: string, url: string, basis: SeedSource["basis"], scope: string): SeedSource {
  return { title, url, checkedAt: DATA_CHECKED_AT, basis, scope };
}
const propertyReference = source("ADREC market data", "https://adrec.gov.ae/en/market-data", "illustrative", "Real Abu Dhabi community names; individual seeded units, features and prices are illustrative composites, not advertised inventory.");
const reemReference = source("Property Finder · Al Reem two-bedroom rentals", "https://www.propertyfinder.ae/en/rent/abu-dhabi/2-bedroom-apartments-for-rent-al-reem-island.html", "illustrative", "Portal asking-rent reference. Sample two-bedroom rents are calibrated around AED 119,000–130,000; no particular listing is reserved.");
const saadiyatReference = source("Property Finder · Saadiyat Beach Residences", "https://www.propertyfinder.ae/en/rent/abu-dhabi/2-bedroom-apartments-for-rent-saadiyat-island-saadiyat-beach-saadiyat-beach-residences.html", "illustrative", "Published two-bedroom asking rents around AED 170,000–190,000 and community price trends. Sample units and photos are illustrative.");
const reefReference = source("Property Finder · Al Reef three-bedroom villas", "https://www.propertyfinder.ae/en/rent/abu-dhabi/3-bedroom-villas-for-rent-al-reef.html", "illustrative", "Published sample asking rents around AED 120,000–135,000. Seed is a composite example, not live availability.");
const icpReference = source("ICP Smart Services", "https://smartservices.icp.gov.ae/", "reference-only", "Official application channel. Generic seed visa amounts are scenario estimates; final government fee depends on service, validity and inside/outside-UAE status.");
const capitalReference = source("Capital Health · visa results", "https://capitalhealth.ae/services/results-receipts/", "reference-only", "Provider publishes standard within 48h, fast track within 24h and VIP same day. Seed tariffs were not verified and remain illustrative.");
const travelReference = source("Etihad · Abu Dhabi routes", "https://www.etihad.com/en-gb/flights/flights-to-abu-dhabi", "reference-only", "Reference for operating routes. No live schedule, departure, fare or availability is claimed; durations are approximate and date-dependent.");
const airportReference = source("Zayed International Airport · ride-hailing", "https://www.zayedinternationalairport.ae/en/parking-and-transport/taxis-car-rental/ride-hailing", "reference-only", "Careem and Uber are listed airport services. Seed fares, driver assignments and pickup times are illustrative.");
const ftaReference = source("FTA · Tax Residency Certificate fees", "https://tax.gov.ae/en/faq.aspx?keyword=What+are+the+fees+associated+for+the+Tax+Residency+Certificate%3F", "published", "AED 50 submission; electronic certificate AED 1,000 for an unregistered natural person or AED 500 for a registered applicant; optional printed certificate AED 250. Advisory fees are illustrative.");

export const seedSources: Record<string, SeedSource> = {
  "saadiyat-garden-2": saadiyatReference, "saadiyat-residence-3": saadiyatReference,
  "saadiyat-villa-4": propertyReference, "saadiyat-park-1": propertyReference,
  "reem-marina-2": reemReference, "reem-shams-2": reemReference,
  "reem-gate-1": propertyReference, "reem-marina-buy-2": propertyReference,
  "yas-links-3": propertyReference, "yas-water-1": propertyReference, "yas-noya-3": propertyReference,
  "raha-gardens-2": propertyReference, "raha-zeina-3": propertyReference,
  "khalifa-villa-3": propertyReference, "khalifa-garden-4": propertyReference,
  "reef-town-3": reefReference, "reef-downtown-2": propertyReference, "maryah-1": propertyReference,
  cranleigh: source("Cranleigh Abu Dhabi · official policies", "https://cranleigh.fireflycloud.asia/school-policies-1/policies-and-latest-inspection-reports", "reference-only", "School policy index includes ADEK fee letters. A reliable current 2026–27 numeric tuition table was not retrieved; ask admissions rather than inventing a fee."),
  yasmina: source("Yasmina British Academy · admissions and fees", "https://www.yasminabritishacademy.ae/admission/", "published", "2026–27 annual tuition AED 49,740–67,270 by year group; excluded extras listed on the school page."),
  brighton: source("Brighton College Abu Dhabi · school fees", "https://www.brightoncollege.ae/admissions/school-fees", "published", "2026–27 annual tuition AED 50,830–80,780 by year group."),
  repton: source("Repton Abu Dhabi · fees", "https://www.reptonabudhabi.org/fees/", "published", "2026–27 tuition AED 63,740–83,390, 5% credited deposit and AED 750 FS1–Year 2 book fee."),
  acs: source("ACS · 2026–27 tuition and fees", "https://www.acs.sch.ae/sites/default/files/Updated%20Tuition%20and%20Fees%202026-27.AED_.pdf", "published", "KG1 AED 60,765; KG2–Grade 5 AED 83,960; Grades 6–8 AED 87,768; Grades 9–12 AED 101,537. Additional capital/application fees listed."),
  adnoc: source("ADNOC Sas Al Nakhl · admissions", "https://san.adnoc.sch.ae/?lang=en&page_id=11", "published", "2026–27 tuition AED 28,710–54,430, books AED 1,280–2,870 and transportation AED 5,000."),
  "raha-khalifa": source("Raha Khalifa City · tuition fees", "https://riskcc.ae/admission/tuition-fees/", "published", "2026–27 tuition AED 41,550–65,500; transport AED 5,000 and diploma textbooks extra."),
  "al-basma": source("Al Basma · ADEK-approved 2026–27 fee breakdown", "https://www.albasmaschool.ae/policies/School%20Fees%20Breakdown%20ABBS%202026-2027.pdf", "published", "Tuition AED 21,890–44,380; bus fee AED 5,000, kept separate from tuition."),
  fab: source("FAB · Personal Current Account", "https://www.bankfab.com/en-ae/personal/accounts/current-accounts/personal-current-account", "reference-only", "Published resident eligibility and document checklist; zero demo opening charge is not a claim that every bank fee is waived."),
  adcb: source("ADCB · Current Account", "https://www.adcb.com/en/personal/accounts/current-savings-account/adcb-current-accounts.aspx", "published", "AED 5,000 minimum monthly salary; resident document requirements and relationship-balance fee caveat."),
  wio: source("Wio Personal", "https://wio.io/", "reference-only", "Digital identity verification with Emirates ID or UAE work visa; plan prices must be checked in the current app."),
  "fab-islamic": source("FAB · Islamic accounts", "https://www.bankfab.com/en-ae/islamic-banking/personal-islamic-banking/islamic-accounts", "published", "Regular Islamic current account eligibility includes age 21+ and AED 3,000 minimum balance."),
  employment: icpReference, family: source("UAE Government · family residence", "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-family-members", "reference-only", "Income and accommodation requirements; adults aged 18 or older require medical fitness. Family fees depend on applicant ages and final service selection."),
  golden: source("ICP · Golden Residency guide", "https://icp.gov.ae/en/services/uae-golden-residency/", "reference-only", "AED 2 million real-estate investment threshold and ownership, approved financing and health-insurance conditions; eligibility is not established by the seed purchase price."),
  green: source("Abu Dhabi Residents Office · skilled employees", "https://adro.gov.ae/Visas/Types-of-Visas/Abu-Dhabi-Green-Visa/Skilled-Employees", "reference-only", "Five-year Green residence category with qualifying profession, bachelor’s degree and AED 15,000 salary criterion."),
  freelance: source("ADDED · freelancers", "https://www.added.gov.ae/en/live/long-term-residency/abu-dhabi-green-visa/for-freelancers", "reference-only", "MOHRE work permit, qualifying education and AED 360,000 prior annual self-employment income or financial-solvency evidence; no universal licence/residence package price."),
  investor: icpReference, tasheel: icpReference, tamm: icpReference, icp: icpReference,
  seha: source("SEHA", "https://www.seha.ae/", "reference-only", "Public provider reference only. Screening price and processing target must be confirmed; seed AED 320 is illustrative."),
  capital: capitalReference, "capital-fast": capitalReference, "capital-vip": capitalReference,
  "visa-medical-age": source("Capital Health · visa medical screening", "https://capitalhealth.ae/services/visa-medical-screening/", "published", "Children under 18 are exempt from residence visa medical screening; this does not exempt them from health-insurance requirements."),
  emaratax: ftaReference, pwc: ftaReference, deloitte: ftaReference,
  "tax-residency": source("FTA · Tax Resident and Tax Residency Certificate guide", "https://tax.gov.ae/Datafolder/Files/Guides/VAT/VAT%20Guides/Tax-Resident-and-TRC--18-10-2024.pdf", "reference-only", "Domestic residence tests include alternatives to 183 days. Treaty certificate criteria and foreign tax consequences are separate; certificate approval is not automatic."),
  careem: airportReference, uber: airportReference,
  blacklane: source("Blacklane · Abu Dhabi airport transfers", "https://www.blacklane.com/en/countries/uae/abu-dhabi/airport-transfer/", "reference-only", "Provider advertises flight tracking and 1h airport waiting; AED 320 is an illustrative fare, not a quoted booking."),
  "airport-taxi": source("Zayed International Airport · taxis", "https://www.zayedinternationalairport.ae/en/parking-and-transport/taxis-car-rental/taxis-limousines", "reference-only", "24/7 metered taxi service. AED 100 is a sample city-transfer budget, not a fixed airport tariff."),
  "reem-suites": source("Beach Rotana Residences", "https://www.rotana.com/rotanahotelandresorts/unitedarabemirates/abudhabi/beachrotanaresidences", "reference-only", "Official location and equipped kitchens. Seed room rates and photos are illustrative."),
  "saadiyat-beach": source("Park Hyatt Abu Dhabi Hotel and Villas", "https://www.hyatt.com/park-hyatt/en-US/abuph-park-hyatt-abu-dhabi-hotel-and-villas", "reference-only", "Official Saadiyat hotel accommodation reference. Seed rates and photos are illustrative."),
  "yas-plaza": source("Hilton Abu Dhabi Yas Island", "https://www.hilton.com/en-gb/hotels/auhyihi-hilton-abu-dhabi-yas-island/", "reference-only", "Official Yas Bay hotel reference. Offer benefits must be confirmed for dates; rates and photos are illustrative."),
  "staybridge-yas": source("IHG · Staybridge Yas Island", "https://www.ihg.com/staybridge/hotels/us/en/abu-dhabi/auhis/hoteldetail/gallery", "reference-only", "Official property gallery confirms suites with kitchenettes. Seed rates and photos are illustrative."),
  "premier-airport": source("Premier Inn Abu Dhabi Airport Business Park", "https://mena.premierinn.com/en/hotel-directory/abu-dhabi/abu-dhabi-airport-business-park-hotel/", "reference-only", "Official hotel and shuttle reference; check the current timetable. Seed rates and photos are illustrative."),
  "capital-arjaan": source("Capital Centre Arjaan by Rotana", "https://www.rotana.com/arjaanhotelapartments/unitedarabemirates/abudhabi/capitalcentrearjaanbyrotana", "reference-only", "Official serviced-apartment property reference. Seed rates and photos are illustrative."),
  flights: travelReference,
  "London": source("Etihad · London to Abu Dhabi", "https://www.etihad.com/en-gb/flights/flights-from-london-to-abu-dhabi", "reference-only", "LHR → AUH; direct route and approximately seven-hour fastest flight. Fares are illustrative; no departure or availability is claimed."),
  "Cairo": source("Etihad · Cairo to Abu Dhabi", "https://www.etihad.com/en/flights/flights-from-cairo", "reference-only", "CAI → AUH; official origin page lists the route. Fares are illustrative; no departure or availability is claimed."),
  "Mumbai": source("Etihad · Mumbai to Abu Dhabi", "https://www.etihad.com/en/flights/flights-from-mumbai-to-abu-dhabi", "reference-only", "BOM → AUH; direct route and approximately 3h25m fastest flight. Fares are illustrative; no departure or availability is claimed."),
  "Manila": source("Etihad · Manila to Abu Dhabi", "https://www.etihad.com/en-sg/flights/flights-to-abu-dhabi", "reference-only", "MNL → AUH; official destination page lists Manila direct flights. Fares are illustrative; no departure or availability is claimed."),
  "New York": source("Etihad · New York to Abu Dhabi", "https://www.etihad.com/en-gb/flights/flights-to-abu-dhabi", "reference-only", "JFK → AUH; official destination page lists New York direct flights. Fares are illustrative; no departure or availability is claimed."),
  "Paris": source("Etihad · Paris to Abu Dhabi", "https://www.etihad.com/en-gb/flights/flights-to-abu-dhabi", "reference-only", "CDG → AUH; official destination page lists Paris direct flights. Fares are illustrative; no departure or availability is claimed."),
  "Delhi": source("Etihad · Delhi to Abu Dhabi", "https://www.etihad.com/en-in/flights/flights-from-new-delhi-to-abu-dhabi", "reference-only", "DEL → AUH; official airline origin-destination route page. Fares are illustrative; no departure or availability is claimed."),
  "Riyadh": source("Etihad · Riyadh to Abu Dhabi", "https://www.etihad.com/en-sa/flights/flights-from-riyadh-to-abu-dhabi", "reference-only", "RUH → AUH; direct route and approximately 1h45m fastest flight. Fares are illustrative; no departure or availability is claimed."),
  "Singapore": source("Etihad · Singapore to Abu Dhabi", "https://www.etihad.com/en-sg/flights/flights-from-singapore-to-abu-dhabi", "reference-only", "SIN → AUH; direct route and approximately 7h20m fastest flight. Fares are illustrative; no departure or availability is claimed."),
  "Rome": source("Etihad · Rome to Abu Dhabi", "https://www.etihad.com/en-it/flights/flights-from-rome", "reference-only", "FCO → AUH; official origin page lists the route. Fares are illustrative; no departure or availability is claimed."),
  "Madrid": source("Etihad · Madrid to Abu Dhabi", "https://www.etihad.com/en-es/flights/flights-from-madrid-to-abu-dhabi", "reference-only", "MAD → AUH; direct route and approximately seven-hour fastest flight. Fares are illustrative; no departure or availability is claimed."),
  "Sydney": source("Etihad · Sydney to Abu Dhabi", "https://www.etihad.com/en-au/flights//flights-from-sydney-to-abu-dhabi", "reference-only", "SYD → AUH; direct route and approximately 13h40m fastest flight. Fares are illustrative; no departure or availability is claimed."),
};

export function sourceForSeed(id: string): SeedSource | undefined {
  if (id.startsWith("demo-")) return undefined;
  const city = id.replace(/-(?:direct|flex)$/, "");
  return seedSources[id] ?? (city !== id ? seedSources[city] : undefined);
}
