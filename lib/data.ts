import { extraHomes, extraSchools, extraBanks, extraHotels, extraTransfers, extraChannels, extraCentres, extraFilers } from "./simulation-seeds";
import type { Flight, Hotel, District, Listing, Quote, School, VisaType } from "./types";

// Reference facts checked against primary sources on 2026-10-02.
// Property images and transactional quotes are illustrative demo inventory.
export const districts: District[] = [
  {
    slug: "saadiyat",
    name: "Saadiyat",
    nameAr: "السعديات",
    cluster: "saadiyat",
    character: "Beach, museums, and school campuses. Premium coastal living, with rents generally above Al Reem and Al Reef.",
    climate: "Open to the gulf. Afternoon wind off the water. Shade is planned, not inherited.",
    commute: "Allow roughly 15–25 minutes to Al Maryah, depending on your building and traffic. Check the school run at your usual time.",
    schools: "Cranleigh Abu Dhabi and American Community School are on Saadiyat. NYU Abu Dhabi is also here.",
  },
  {
    slug: "reem",
    name: "Al Reem",
    nameAr: "الريم",
    cluster: "reem",
    character: "Towers, a marina, and daily errands on foot. The practical address for a first lease.",
    climate: "Built-up. Evenings are usable. Midday is a walk between lobbies.",
    commute: "Close to Al Maryah and the Corniche. A short bridge, not a highway.",
    schools: "Repton Abu Dhabi has Rose and Fry campuses on Al Reem. Other curriculum choices may require a school bus or car.",
  },
  {
    slug: "yas",
    name: "Yas",
    nameAr: "ياس",
    cluster: "yas",
    character: "Circuit, waterpark, golf, and a growing set of apartments. Good if the airport is a weekly fact.",
    climate: "Exposed. Villas get more garden wind than the tower blocks.",
    commute: "Near the airport and the E10. The office islands are a deliberate drive.",
    schools: "Yas American Academy is on Yas Island. Yasmina British Academy is in Khalifa City, so compare the actual route.",
  },
  {
    slug: "raha",
    name: "Al Raha",
    nameAr: "الراحة",
    cluster: "raha",
    character: "Beach apartments between the airport and the city. A compromise address, in the useful sense.",
    climate: "Sea front on the gardens side. Hotter inland toward the mall.",
    commute: "Airport in minutes. Downtown in twenty when the E10 behaves.",
    schools: "Raha International and Yasmina serve nearby Al Raha Gardens and Khalifa City. ADNOC Sas Al Nakhl is a separate campus.",
  },
  {
    slug: "khalifa",
    name: "Khalifa City",
    nameAr: "مدينة خليفة",
    cluster: "raha",
    character: "Villas behind walls. The family answer when a tower is the wrong shape of life.",
    climate: "Inland and residential. Outdoor areas need shade; check cooling costs and garden maintenance in the lease.",
    commute: "South of the island core. Budget the school run before you budget the rent.",
    schools: "Yasmina British Academy and Raha International Khalifa City are local options. Compare year-group availability and the pickup route.",
  },
  {
    slug: "reef",
    name: "Al Reef",
    nameAr: "الريف",
    cluster: "raha",
    character: "Townhouses at a lower yearly rent. Newer, drier, and more car-bound than Reem.",
    climate: "Desert edge. Dust days show up on the cars.",
    commute: "Airport side of the city. Downtown is a commute, not an errand.",
    schools: "Nurseries inside the community. Primary and secondary usually mean a drive.",
  },
  {
    slug: "maryah",
    name: "Al Maryah",
    nameAr: "المارية",
    cluster: "reem",
    character: "The financial square. Towers, the mall, and leases aimed at a single professional or a couple.",
    climate: "Glass and podium shade. The gulf is close and mostly looked at.",
    commute: "If the office is here, the commute is an elevator. Schools are not.",
    schools: "Not a school island. Treat it as a downtown base and drive for campuses.",
  },

  { slug: "bloom", name: "Bloom Gardens", nameAr: "حدائق بلووم", cluster: "raha", character: "A villa and townhouse community near Khalifa Park, distinct from Khalifa City.", climate: "Landscaped paths; shade and outdoor comfort depend on the season.", commute: "Compare routes to ADNEC, the city centre and your workplace at the time you travel.", schools: "Brighton College Abu Dhabi is in the community. The correct campus and year-group availability still need confirmation." },
  { slug: "bahia", name: "Al Bahia", nameAr: "الباهية", cluster: "raha", character: "A suburban district north-east of the city, separate from Al Reef and Khalifa City.", climate: "Residential plots and open roads; budget for cooling and shaded outdoor space.", commute: "Check your journey to Yas, the airport and the city before choosing a home.", schools: "Al Basma British School is in Al Bahia. School bus coverage is confirmed by the school, not assumed from the address." },

];

export const listings: Listing[] = [
  {
    id: "saadiyat-garden-2",
    title: "Two-bedroom garden apartment",
    area: "Saadiyat",
    areaSlug: "saadiyat",
    cluster: "saadiyat",
    kind: "rent",
    beds: 2,
    baths: 2,
    sqm: 128,
    price: 180000,
    furnished: true,
    pet: false,
    schoolKm: 1.4,
    community: "Saadiyat Beach Residences",
    note: "Illustrative furnished apartment with balcony. Confirm beach access, parking allocation and pet policy with the landlord. Demo property, not live availability.",
    image: "/photos/saadiyat-garden.jpg",
  },
  {
    id: "saadiyat-villa-4",
    title: "Four-bedroom villa",
    area: "Saadiyat",
    areaSlug: "saadiyat",
    cluster: "saadiyat",
    kind: "buy",
    beds: 4,
    baths: 5,
    sqm: 420,
    price: 13000000,
    furnished: false,
    pet: true,
    schoolKm: 2.1,
    community: "Hidd Al Saadiyat",
    note: "Illustrative resale villa with a service kitchen. A property price above AED 2 million may satisfy the investment value test; title evidence and ICP approval are still required. Demo property, not live availability.",
    image: "/photos/saadiyat-villa.jpg",
  },
  {
    id: "reem-marina-2",
    title: "Two-bedroom marina apartment",
    area: "Al Reem",
    areaSlug: "reem",
    cluster: "reem",
    kind: "rent",
    beds: 2,
    baths: 3,
    sqm: 118,
    price: 125000,
    furnished: true,
    pet: false,
    schoolKm: 3.5,
    community: "Marina Square",
    note: "Sample furnished apartment in Marina Square. Repton is on Al Reem; check the route to the appropriate campus and year group. Demo property, not live availability.",
    image: "/photos/reem-marina.jpg",
  },
  {
    id: "reem-gate-1",
    title: "One-bedroom tower apartment",
    area: "Al Reem",
    areaSlug: "reem",
    cluster: "reem",
    kind: "rent",
    beds: 1,
    baths: 2,
    sqm: 78,
    price: 95000,
    furnished: true,
    pet: false,
    schoolKm: 2.1,
    community: "Gate Towers, Shams Abu Dhabi",
    note: "Illustrative one-bedroom apartment with communal gym and pool. Confirm chiller charges, cheque count and the current building rules. Demo property, not live availability.",
    image: "/photos/reem-gate.jpg",
  },
  {
    id: "yas-links-3",
    title: "Three-bedroom canal apartment",
    area: "Yas",
    areaSlug: "yas",
    cluster: "yas",
    kind: "rent",
    beds: 3,
    baths: 4,
    sqm: 168,
    price: 190000,
    furnished: false,
    pet: true,
    schoolKm: 1.8,
    community: "Water’s Edge",
    note: "Unfurnished canal-side sample apartment. Yas American Academy is on the island. Confirm pets, cooling charges and parking before a viewing. Demo property, not live availability.",
    image: "/photos/yas-links.jpg",
  },
  {
    id: "raha-gardens-2",
    title: "Two-bedroom waterfront apartment",
    area: "Al Raha",
    areaSlug: "raha",
    cluster: "raha",
    kind: "rent",
    beds: 2,
    baths: 2,
    sqm: 112,
    price: 140000,
    furnished: true,
    pet: false,
    schoolKm: 3.2,
    community: "Al Muneera, Al Raha Beach",
    note: "Illustrative furnished apartment in Al Muneera. This is Al Raha Beach, distinct from the villa community of Al Raha Gardens. Demo property, not live availability.",
    image: "/photos/raha-gardens.jpg",
  },
  {
    id: "khalifa-villa-3",
    title: "Three-bedroom family villa",
    area: "Khalifa City",
    areaSlug: "khalifa",
    cluster: "raha",
    kind: "rent",
    beds: 3,
    baths: 4,
    sqm: 280,
    price: 130000,
    furnished: false,
    pet: true,
    schoolKm: 2.4,
    community: "Khalifa City",
    note: "Sample unfurnished villa with a staff room and covered parking. Clarify whether utilities and maintenance are separate from rent. Demo property, not live availability.",
    image: "/photos/khalifa-villa.jpg",
  },
  {
    id: "reef-town-3",
    title: "Three-bedroom townhouse",
    area: "Al Reef",
    areaSlug: "reef",
    cluster: "raha",
    kind: "rent",
    beds: 3,
    baths: 3,
    sqm: 196,
    price: 125000,
    furnished: false,
    pet: true,
    schoolKm: 4.6,
    community: "Al Reef",
    note: "Sample townhouse with a private garden. Annual rent is calibrated to published Al Reef asking prices. Check maintenance, cheque count and school transport. Demo property, not live availability.",
    image: "/photos/reef-town.jpg",
  },
  {
    id: "maryah-1",
    title: "One-bedroom city apartment",
    area: "Al Maryah",
    areaSlug: "maryah",
    cluster: "reem",
    kind: "rent",
    beds: 1,
    baths: 1,
    sqm: 74,
    price: 125000,
    furnished: true,
    pet: false,
    schoolKm: 8,
    community: "Al Maryah Island",
    note: "Furnished downtown. A central base for ADGM; families should compare transport to their chosen school. Demo property, not live availability.",
    image: "/photos/maryah.jpg",
  },

  { id: "saadiyat-park-1", title: "One-bedroom campus-side apartment", area: "Saadiyat", areaSlug: "saadiyat", cluster: "saadiyat", kind: "rent", beds: 1, baths: 2, sqm: 78, price: 115000, furnished: false, pet: false, schoolKm: 2.6, community: "Park View", note: "Sample apartment near NYU Abu Dhabi. Annual rent estimate; confirm cooling, parking and school-campus distances. Demo property, not live availability.", image: "/photos/saadiyat-garden.jpg" },
  { id: "saadiyat-residence-3", title: "Three bedrooms with a staff room", area: "Saadiyat", areaSlug: "saadiyat", cluster: "saadiyat", kind: "rent", beds: 3, baths: 4, sqm: 186, price: 215000, furnished: false, pet: false, schoolKm: 2.3, community: "Saadiyat Beach Residences", note: "Sample family apartment calibrated to the community’s published asking-rent range. Verify beach access and the actual school run. Demo property, not live availability.", image: "/photos/saadiyat-garden.jpg" },
  { id: "reem-shams-2", title: "Two bedrooms near Repton", area: "Al Reem", areaSlug: "reem", cluster: "reem", kind: "rent", beds: 2, baths: 3, sqm: 120, price: 120000, furnished: false, pet: false, schoolKm: 1.8, community: "Shams Abu Dhabi", note: "Illustrative apartment with two bathrooms and a guest washroom. Compare the Rose and Fry campus routes for your child’s year. Demo property, not live availability.", image: "/photos/reem-marina.jpg" },
  { id: "reem-marina-buy-2", title: "Two-bedroom marina resale", area: "Al Reem", areaSlug: "reem", cluster: "reem", kind: "buy", beds: 2, baths: 3, sqm: 130, price: 2100000, furnished: false, pet: false, schoolKm: 3.4, community: "Marina Square", note: "Illustrative resale apartment. Budget separately for registration, brokerage and ongoing service charges. Golden residence requires additional title and eligibility checks. Demo property, not live availability.", image: "/photos/reem-marina.jpg" },
  { id: "yas-water-1", title: "One-bedroom canal apartment", area: "Yas", areaSlug: "yas", cluster: "yas", kind: "rent", beds: 1, baths: 1, sqm: 65, price: 105000, furnished: false, pet: false, schoolKm: 3.2, community: "Water’s Edge", note: "Sample apartment on Yas Island. Confirm furnished status, parking, cooling fees and the route to Yas American Academy. Demo property, not live availability.", image: "/photos/yas-links.jpg" },
  { id: "yas-noya-3", title: "Three-bedroom Noya townhouse", area: "Yas", areaSlug: "yas", cluster: "yas", kind: "rent", beds: 3, baths: 4, sqm: 167, price: 210000, furnished: false, pet: true, schoolKm: 3.6, community: "Noya", note: "Illustrative townhouse with garden and staff room. Pet permission and community access are subject to the signed lease. Demo property, not live availability.", image: "/photos/khalifa-villa.jpg" },
  { id: "raha-zeina-3", title: "Three-bedroom beach apartment", area: "Al Raha", areaSlug: "raha", cluster: "raha", kind: "rent", beds: 3, baths: 4, sqm: 188, price: 195000, furnished: false, pet: false, schoolKm: 5.2, community: "Al Zeina", note: "Sample family apartment in Al Raha Beach. Check whether beach access, parking and cooling are included. Demo property, not live availability.", image: "/photos/raha-gardens.jpg" },
  { id: "khalifa-garden-4", title: "Four-bedroom garden villa", area: "Khalifa City", areaSlug: "khalifa", cluster: "raha", kind: "rent", beds: 4, baths: 5, sqm: 325, price: 180000, furnished: false, pet: true, schoolKm: 2.8, community: "Khalifa City", note: "Illustrative villa with separate kitchen and staff room. Confirm garden maintenance, utilities and the actual route to Yasmina or Raha Khalifa City. Demo property, not live availability.", image: "/photos/khalifa-villa.jpg" },
  { id: "reef-downtown-2", title: "Two-bedroom community apartment", area: "Al Reef", areaSlug: "reef", cluster: "raha", kind: "rent", beds: 2, baths: 2, sqm: 112, price: 90000, furnished: false, pet: false, schoolKm: 6.2, community: "Al Reef Downtown", note: "Illustrative lower-budget apartment, distinct from Al Reef Villas. School bus route and utility costs should be checked before signing. Demo property, not live availability.", image: "/photos/reef-town.jpg" },

];

export const visas: VisaType[] = [
  {
    slug: "employment",
    title: "Employment residence",
    titleAr: "إقامة عمل",
    who: "A person with a job offer from a mainland or free-zone employer in Abu Dhabi. The employer is the sponsor.",
    documents: [
      "Passport with at least 6 months of validity",
      "Photographs to the current specification",
      "Attested degree, if the role requires one",
      "Offer or contract from the sponsor",
    ],
    timeline: "Often a few weeks once the employer files. Entry permit, medical, biometrics, and the Emirates ID are separate steps.",
    cost: "Most government fees sit with the employer. Ask who pays the medical, the ID, and any typing center.",
    next: "Put the employer's PRO in the file before you book the flight.",
  },
  {
    slug: "family",
    title: "Family sponsorship",
    titleAr: "كفالة عائلية",
    who: "Spouse and children sponsored by a resident with AED 4,000 monthly income, or AED 3,000 plus employer-provided accommodation. Parents have separate conditions.",
    documents: [
      "Sponsor's Emirates ID and residence visa",
      "Attested marriage certificate for a spouse",
      "Attested birth certificates for children",
      "Tenancy contract, often required as proof of housing",
      "Passport copy for each person",
    ],
    timeline: "Apply after the sponsor’s residence is issued. Prepare attested certificates, accommodation and insurance; adults aged 18 or over need medical fitness screening. Timings depend on the complete file.",
    cost: "Government fees depend on residence duration and whether the applicant is inside or outside the UAE. Attestation, medical fitness for adults and health insurance are separate costs.",
    next: "Start attestation in the country of the marriage and the births. Do not wait until landing.",
  },
  {
    slug: "golden",
    title: "Golden visa",
    titleAr: "الإقامة الذهبية",
    who: "Renewable long-term residence for eligible investors, entrepreneurs and specialized talent. The real-estate investor route requires property worth at least AED 2 million, with the required ownership evidence.",
    documents: [
      "Passport",
      "Evidence for the category: title deed, investment papers, or a nomination",
      "Health insurance as required for the category",
      "Recent passport photograph",
    ],
    timeline: "Eligibility review comes first, followed by the applicable entry/status, medical fitness, residence and Emirates ID steps. No approval date is guaranteed.",
    cost: "Government fees depend on category and duration. The property investment is separate from application fees, medical fitness, Emirates ID and health insurance.",
    next: "Name the category before you name a villa. The file should say why you qualify.",
  },
  {
    slug: "green",
    title: "Green residency",
    titleAr: "الإقامة الخضراء",
    who: "Five-year self-sponsored residence. Skilled employees need a qualifying occupation, a bachelor’s degree and a salary of at least AED 15,000 a month; freelancers and investors have separate tests.",
    documents: [
      "Passport and current status",
      "Proof of the category: degree and salary, or a freelance permit and income",
      "Health insurance",
      "Evidence of income at the current threshold",
    ],
    timeline: "Eligibility review and the residence/ID steps are separate. Adult applicants complete medical fitness when instructed; processing depends on the complete application.",
    cost: "You pay the government fees yourself. Price the freelance permit and the residence as two bills.",
    next: "Confirm the eligible Green residence category and sponsor arrangement before preparing the application.",
  },
  {
    slug: "freelance",
    title: "Freelance permit",
    titleAr: "تصريح عمل حر",
    who: "A work permit or licence for the approved activity. It does not itself grant residence. Green residence for freelancers requires a MOHRE permit, qualifying education and income or financial-solvency evidence.",
    documents: [
      "Passport",
      "Portfolio or proof of the activity the permit allows",
      "A free-zone application",
      "Later, the residence medical and ID",
    ],
    timeline: "The permit can be days. The residence that lets you live here is a second process.",
    cost: "The activity licence or permit and residence are separate applications. Obtain the current price from the issuing authority; there is no universal AED 7,500 freelance package.",
    next: "Pick the free zone for the activity you actually do. Then attach a residence path.",
  },
  {
    slug: "investor",
    title: "Investor / partner",
    titleAr: "مستثمر أو شريك",
    who: "A founder or shareholder sponsoring residence through a mainland company or a free-zone entity.",
    documents: [
      "Passport",
      "Trade license and memorandum",
      "Share evidence",
      "Office or flexi-desk contract, if the license requires premises",
    ],
    timeline: "License first, residence second. Bank account often third, and the bank will ask for both.",
    cost: "License, establishment card, residence, and a registered address. Treat the first year as a setup budget, not a visa fee.",
    next: "Open the money file beside this one. The license and the tax registration are the same story.",
  },
];

export const schools: School[] = [
  { id: "cranleigh", name: "Cranleigh Abu Dhabi", curriculum: "British", fees: "Request the current year-group fee", area: "Saadiyat Island", areaSlug: "saadiyat", turnaround: "School confirms assessment and places", review: "British curriculum on Saadiyat. Fees, assessment requirements and availability must be confirmed for your child’s year group." },
  { id: "yasmina", name: "Yasmina British Academy", curriculum: "British", fees: "AED 49,740–67,270 · 2026–27 tuition", area: "Khalifa City", areaSlug: "khalifa", turnaround: "Enquiry response within 2 working days", review: "FS1–Year 1: AED 49,740; Years 2–6: AED 51,180. Uniform, meals, transport, exam fees and some activities are extra." },
  { id: "brighton", name: "Brighton College Abu Dhabi", curriculum: "British", fees: "AED 50,830–80,780 · 2026–27 tuition", area: "Bloom Gardens / Khalifa Park", areaSlug: "bloom", turnaround: "Assessment subject to year-group availability", review: "FS1: AED 50,830; Years 1–5: AED 62,610. Annual tuition is split 40% / 30% / 30%; check additional costs with admissions." },
  { id: "repton", name: "Repton Abu Dhabi", curriculum: "British", fees: "AED 63,740–83,390 · 2026–27 tuition", area: "Al Reem Island", areaSlug: "reem", turnaround: "Admissions confirms tour and assessment", review: "Rose: FS1–Year 2; Fry: Years 3–13. A 5% deposit is credited toward tuition; FS1–Year 2 has an additional AED 750 book fee." },
  { id: "acs", name: "American Community School of Abu Dhabi", curriculum: "American / IB", fees: "AED 60,765–101,537 · 2026–27 tuition", area: "Saadiyat Island", areaSlug: "saadiyat", turnaround: "Admissions reviews a complete application", review: "KG1: AED 60,765; KG2–Grade 5: AED 83,960. One-time capital fee AED 27,000 and application fee AED 630 are additional. American curriculum with IB/AP high-school options." },
  { id: "adnoc", name: "ADNOC Schools · Sas Al Nakhl", curriculum: "American", fees: "AED 28,710–54,430 · 2026–27 tuition", area: "Sas Al Nakhl", areaSlug: "raha", turnaround: "Admissions confirms assessment and availability", review: "American Massachusetts curriculum. Tuition varies by grade; books cost AED 1,280–2,870 and optional transport AED 5,000 a year." },
  { id: "raha-khalifa", name: "Raha International · Khalifa City Campus", curriculum: "International Baccalaureate", fees: "AED 41,550–65,500 · 2026–27 tuition", area: "Khalifa City", areaSlug: "khalifa", turnaround: "Admissions reviews reports and year-group fit", review: "Grades 1–6: AED 57,220; Grades 7–12: AED 65,500. Transport is AED 5,000 annually; diploma textbooks are purchased separately." },
  { id: "al-basma", name: "Al Basma British School", curriculum: "British", fees: "AED 21,890–44,380 · 2026–27 tuition", area: "Al Bahia", areaSlug: "bahia", turnaround: "School confirms the correct year group and place", review: "Years 4–5: AED 32,940; Year 13: AED 44,380. Published bus fee is AED 5,000 annually. Al Bahia is a separate area from Al Reef." },
];

export const banks: Quote[] = [
  { id: "fab", name: "FAB Personal Current Account", price: 0, role: "Provider", turnaround: "Apply digitally or at a branch; bank verification required", review: "For UAE residents. Passport, residence visa, Emirates ID and proof of income may be required.", note: "No demo opening charge. Maintenance and transaction charges depend on the bank’s current fee schedule; an account is not approved by this demo." },
  { id: "adcb", name: "ADCB Current Account", price: 0, role: "Provider", turnaround: "Hayyak application; documents and eligibility checked by ADCB", review: "UAE residents; the published current-account minimum monthly salary is AED 5,000. Passport, residence visa, Emirates ID and salary certificate are listed requirements.", note: "Monthly fees can apply if your segment’s relationship-balance criteria are not met. Hayyak supports English and Arabic." },
  { id: "wio", name: "Wio Personal", price: 0, role: "Provider", turnaround: "Digital onboarding with Emirates ID or eligible UAE work visa", review: "Wio supports identity verification with an Emirates ID or UAE work visa and a selfie. Plan pricing and eligibility appear in the app.", note: "No demo opening charge. This does not mean all monthly plan fees or transfers are free." },
  { id: "fab-islamic", name: "FAB Islamic Current Account", price: 0, role: "Provider", turnaround: "Bank verifies resident status and source of funds", review: "Published eligibility includes UAE residents aged 21 or over. The regular Islamic current account requires an AED 3,000 minimum balance.", note: "Check the applicable fees and Shari’ah product terms with FAB before opening." },
];

// Portals are research tools, not parties that issue a landlord’s binding quote.
export function homeQuotes(listing: Listing): Quote[] {
  return [
    { id: "landlord", name: "Landlord · sample offer", price: listing.price, role: "Provider", turnaround: "Viewing and landlord approval needed", review: "The rent or sale amount belongs to this illustrative property. It is not a live or reserved listing.", note: "Confirm the payment schedule, deposit, cooling, maintenance and pet policy before signing." },
    { id: "licensed-agent", name: "Licensed agency · sample offer", price: listing.price, role: "PRO", turnaround: "Agency checks the property and arranges a viewing", review: "Same sample property price; no fabricated discount across listing portals.", note: "An agency’s licence, brokerage fee and VAT must be verified in a written agreement. This demo has no agency partnership." },
  ];
}

const cities = [
  { city: "London", airport: "LHR", hours: "About 7h", price: 2450 },
  { city: "Cairo", airport: "CAI", hours: "About 3h 30m", price: 1180 },
  { city: "Mumbai", airport: "BOM", hours: "About 3h 20m", price: 890 },
  { city: "Manila", airport: "MNL", hours: "About 9h", price: 1640 },
  { city: "New York", airport: "JFK", hours: "About 13h", price: 3950 },
  { city: "Paris", airport: "CDG", hours: "About 6h 45m", price: 2280 },
  { city: "Delhi", airport: "DEL", hours: "About 4h", price: 1100 },
  { city: "Riyadh", airport: "RUH", hours: "About 2h", price: 650 },
  { city: "Singapore", airport: "SIN", hours: "About 7h 30m", price: 2300 },
  { city: "Rome", airport: "FCO", hours: "About 6h", price: 2150 },
  { city: "Madrid", airport: "MAD", hours: "About 7h", price: 2400 },
  { city: "Sydney", airport: "SYD", hours: "About 13h 40m", price: 4200 },
];
export const cityNames = cities.map((c) => c.city);

function fare(price: number) { return Math.round(price / 10) * 10; }

export function flightsFrom(city: string): Flight[] {
  const c = cities.find((x) => x.city.toLowerCase() === city.trim().toLowerCase());
  if (!c) return [];
  const quote = (id: string, name: string, price: number, note: string): Quote => ({
    id, name, price, role: "Provider", turnaround: "Select a travel date and confirm with Etihad",
    review: "Illustrative one-way fare for one adult; not live availability, a published airline fare, or an issued ticket.", note,
  });
  return [
    { id: `${c.city}-direct`, city: c.city, code: `${c.airport} → AUH`, depart: "Choose dates", duration: c.hours, stops: "Etihad · direct route", image: "/photos/flight-day.jpg", quotes: [quote("etihad", "Etihad · economy example", c.price, "Demo budget only. Baggage, change fees and final fare depend on the date and fare family.")] },
    { id: `${c.city}-flex`, city: c.city, code: `${c.airport} → AUH`, depart: "Choose dates", duration: c.hours, stops: "Etihad · flexible fare example", image: "/photos/flight-night.jpg", quotes: [quote("etihad-flex", "Etihad · flexible example", fare(c.price * 1.28), "Demo budget for a more flexible ticket. Confirm the actual change/refund rules and baggage allowance before purchase.")] },
  ];
}

export function flightById(id: string) {
  // Find an exact known ID; an unknown city must never silently become London.
  for (const city of cityNames) {
    const found = flightsFrom(city).find((flight) => flight.id === id);
    if (found) return found;
  }
  return undefined;
}

function stayQuotes(hotel: string, night: number): Quote[] {
  return [
    { id: "hotel-direct", name: `${hotel} · sample rate`, price: night, role: "Provider", turnaround: "Hotel confirms room and dates", review: "Illustrative nightly budget, not a scraped live rate or a confirmed room.", note: "Final price depends on occupancy, room, dates, tax treatment, meals and cancellation terms." },
    { id: "hotel-flex", name: `${hotel} · flexible example`, price: fare(night * 1.15), role: "Provider", turnaround: "Hotel confirms the cancellation deadline", review: "Illustrative alternative budget with an assumed flexibility premium. No cancellation benefit is guaranteed.", note: "Request the hotel’s written rate terms; verify which local fees are included." },
  ];
}

export const hotels: Hotel[] = [
  { id: "reem-suites", name: "Beach Rotana Residences", area: "Al Zahiyah", note: "Real serviced-apartment property near Abu Dhabi Mall; studios and apartments include kitchens. Images and nightly rates are illustrative.", image: "/photos/hotel-reem.jpg", quotes: stayQuotes("Rotana", 650) },
  { id: "saadiyat-beach", name: "Park Hyatt Abu Dhabi Hotel and Villas", area: "Saadiyat Island", note: "Real beachfront hotel with rooms, suites and villas on Saadiyat. Images and nightly rates are illustrative.", image: "/photos/hotel-beach.jpg", quotes: stayQuotes("Hyatt", 1150) },
  { id: "yas-plaza", name: "Hilton Abu Dhabi Yas Island", area: "Yas Bay, Yas Island", note: "Real waterfront hotel in Yas Bay. Confirm the applicable room offer and attraction benefits for your dates. Images and nightly rates are illustrative.", image: "/photos/hotel-yas.jpg", quotes: stayQuotes("Hilton", 750) },
  { id: "staybridge-yas", name: "Staybridge Suites Abu Dhabi Yas Island", area: "Yas Island", note: "Real IHG extended-stay hotel with suites and kitchens. Confirm weekly housekeeping, meals and the exact room layout. Images and nightly rates are illustrative.", image: "/photos/hotel-reem.jpg", quotes: stayQuotes("IHG", 600) },
  { id: "premier-airport", name: "Premier Inn Abu Dhabi Airport (Business Park)", area: "Airport Business Park", note: "Real hotel in the airport business park. It is separate from the current terminal; confirm the shuttle timetable. Images and nightly rates are illustrative.", image: "/photos/hotel-yas.jpg", quotes: stayQuotes("Premier Inn", 350) },
  { id: "capital-arjaan", name: "Capital Centre Arjaan by Rotana", area: "Capital Centre / ADNEC", note: "Real serviced-apartment property near ADNEC, with equipped kitchenettes. Images and nightly rates are illustrative.", image: "/photos/hotel-reem.jpg", quotes: stayQuotes("Rotana", 500) },
];

export const NIGHTS = 14;

export const transfers: Quote[] = [
  { id: "careem", name: "Careem · airport pickup", price: 120, role: "Provider", turnaround: "Request or reserve in the app; availability varies", review: "Careem is listed by Zayed International Airport as an available ride-hailing service.", note: "Illustrative AUH-to-central-Abu-Dhabi budget. Actual fare, pickup point, wait time and luggage capacity must be confirmed in the app." },
  { id: "uber", name: "Uber · airport pickup", price: 125, role: "Provider", turnaround: "Request or reserve in the app; availability varies", review: "Uber is listed by Zayed International Airport as an available ride-hailing service.", note: "Illustrative city transfer budget. A reservation is subject to the provider’s terms and does not guarantee an assigned driver in this demo." },
  { id: "blacklane", name: "Blacklane · chauffeur", price: 320, role: "Provider", turnaround: "Book with flight number and destination", review: "The provider advertises flight tracking, meet-and-greet and one hour of airport waiting time.", note: "Illustrative Business Class transfer budget. A destination and pickup date are needed for a real quote; confirm passenger, luggage and child-seat requirements." },
  { id: "airport-taxi", name: "Airport taxi · metered", price: 100, role: "Provider", turnaround: "Available at the airport taxi rank 24/7", review: "Zayed International Airport publishes a metered taxi service; the meter determines the final fare.", note: "Illustrative city transfer budget, not a fixed-price reservation or a driver assigned before landing." },
];

export const visaChannels: Quote[] = [
  { id: "tasheel", name: "Licensed typing centre · demo", price: 250, role: "PRO", turnaround: "Centre reviews documents before submission", review: "Illustrative document-preparation service. Verify that the centre is authorised for your ICP transaction.", note: "AED 250 is a demo assistance estimate, not a published centre tariff. Government application fees are separate." },
  { id: "tamm", name: "ICP Customer Happiness Centre", price: 0, role: "Provider", turnaround: "Check the service and appointment requirements with ICP", review: "ICP customer centres provide identity and residency services. The available transaction depends on the centre.", note: "No added assistance fee in the demo; official fees still apply. TAMM provides Abu Dhabi service guidance but is not substituted for the issuing authority." },
  { id: "icp", name: "ICP Smart Services", price: 0, role: "Provider", turnaround: "Online application after documents and eligibility are ready", review: "Official federal portal for the applicable identity and residency application.", note: "No Wusool assistance fee. Government fees, screening and insurance are not waived." },
];

export const centres: Quote[] = [
  { id: "seha", name: "SEHA Visa Screening · standard", price: 320, role: "Provider", turnaround: "Confirm processing time and appointment with SEHA", review: "Use a Department of Health-approved visa-screening service for the relevant residence application.", note: "Demo price estimate; confirm the current adult visa-screening package directly. This is separate from treatment or a health-insurance plan." },
  { id: "capital", name: "Capital Health · standard screening", price: 250, role: "Provider", turnaround: "Published standard-result target: within 48 hours", review: "Capital Health states that visa fitness results are linked to ICP. Children below 18 do not need visa medical screening.", note: "AED 250 is a demo estimate, not a verified current tariff. Confirm the price, location and appointment before payment." },
  { id: "capital-fast", name: "Capital Health · fast-track screening", price: 350, role: "Provider", turnaround: "Published fast-track-result target: within 24 hours", review: "The same provider offers a fast-track screening service. Results can depend on additional tests or review.", note: "AED 350 is a demo estimate; verify the current package tariff directly." },
  { id: "capital-vip", name: "Capital Health · VIP screening", price: 500, role: "Provider", turnaround: "Published VIP-result target: same day", review: "Capital Health publishes a VIP visa-screening option. A same-day result is subject to its clinical and operational conditions.", note: "AED 500 is a demo estimate; confirm the current tariff and cutoff time." },
];

export const filers: Quote[] = [
  { id: "emaratax", name: "FTA · Tax Residency Certificate", price: 1050, role: "Provider", turnaround: "FTA reviews the complete application; approval is not automatic", review: "Published fee for an unregistered natural person: AED 50 submission plus AED 1,000 electronic certificate.", note: "This example is for an unregistered individual. A registered applicant pays AED 500 plus AED 50; a printed copy costs an additional AED 250. Treaty requirements may differ." },
  { id: "pwc", name: "Tax adviser · assisted demo filing", price: 2050, role: "PRO", turnaround: "Adviser prepares evidence; FTA decides the application", review: "Illustrative assisted route; no quote or partnership is claimed for PwC or any real advisory firm.", note: "Demo total includes AED 1,050 FTA fees for an unregistered individual plus AED 1,000 illustrative assistance. Obtain a written professional quote." },
  { id: "deloitte", name: "Tax adviser · complex-file demo", price: 3050, role: "PRO", turnaround: "Review timeline depends on countries and supporting evidence", review: "Illustrative specialist review for a more complex residency file; no quote or partnership is claimed for Deloitte.", note: "Demo total includes AED 1,050 FTA fees plus AED 2,000 illustrative assistance. A certificate does not automatically remove foreign-country tax obligations." },
];

export function hotelById(id: string) { return hotels.find((h) => h.id === id); }

export function visaFees(slug: string, people: number): [string, number][] {
  // These are scenario budgets, not an official all-inclusive ICP quotation.
  // Medical is paid in the later screening step; insurance and work licences
  // depend on individual circumstances and must not be charged a second time.
  const count = Number.isFinite(people) ? Math.max(1, Math.floor(people)) : 1;
  if (slug === "employment") return [["Employer-sponsored residence · employer payment in this demo", 0]];
  const longStay = slug === "golden" || slug === "green";
  const perPerson: [string, number][] = [
    ["Entry / status processing · demo estimate", 500],
    ["Residence issuance · demo estimate", longStay ? 1000 : 300],
    ["Emirates ID · demo estimate", slug === "golden" ? 1150 : slug === "green" ? 650 : 370],
  ];
  return perPerson.map(([label, amount]) => [count > 1 ? `${label} · ${count} applicants` : label, amount * count]);
}

export function districtBySlug(slug: string) { return districts.find((d) => d.slug === slug); }
export function listingById(id: string) { return listings.find((l) => l.id === id); }
export function visaBySlug(slug: string) { return visas.find((v) => v.slug === slug); }
export function schoolById(id: string) { return schools.find((s) => s.id === id); }
export function listingsIn(slug: string) { return listings.filter((l) => l.areaSlug === slug); }

// The same expanded inventory powers the cards, scripted flow and AI tools.
listings.push(...extraHomes(districts));
schools.push(...extraSchools(districts));
banks.push(...extraBanks);
hotels.push(...extraHotels(districts));
transfers.push(...extraTransfers);
visaChannels.push(...extraChannels);
centres.push(...extraCentres);
filers.push(...extraFilers);
