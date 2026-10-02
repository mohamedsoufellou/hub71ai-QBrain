export type Lang = "en" | "ar";

export type Cluster = "saadiyat" | "yas" | "reem" | "raha";

export type Purpose = "viewing" | "bank" | "medical";

export type Income = "salary" | "business";

export type Topic = "menu" | "home" | "visa" | "tax" | "bank" | "arrive" | "school" | "health" | "file";

export type HealthProfile = {
  emirate: "abu-dhabi" | "dubai" | "other";
  visa: "resident" | "pending" | "visitor";
  age: number;
  dependants: number;
  income: "over5000" | "upTo5000";
  employerCover: "yes" | "no" | "unknown";
  coverage: "uae" | "international";
  hospital: string;
};

export type HomeFilter = {
  kind?: "rent" | "buy";
  beds?: number;
  area?: string;
  max?: number;
  school?: boolean;
  furnished?: boolean;
  pet?: boolean;
};

export type Family = { spouse: boolean; kids: number; parents: number };

export type Payment = {
  for: "lease" | "visa" | "tax" | "trip";
  title: string;
  subject: string;
  lines: [string, number][];
  via?: string;
};

export type Action =
  | { a: "sarahDemo"; stage: "documents" | "assessment" | "quote" | "schools" | "career"; documents?: DemoDocument[]; sample?: boolean }
  | { a: "topic"; topic: Topic }
  | { a: "homes"; filter: HomeFilter }
  | { a: "home"; id: string }
  | { a: "viewing"; id: string; provider: string; price: number }
  | { a: "slot"; purpose: Purpose; subject: string; day: string; time: string; via?: string; price?: number }
  | { a: "lease"; id: string; provider: string; price: number }
  | { a: "pay"; payment: Payment }
  | { a: "paid"; payment: Payment }
  | { a: "visaFor"; slug: string }
  | { a: "family"; family: Family }
  | { a: "docs"; slug: string }
  | { a: "channel"; slug: string; id: string }
  | { a: "medical"; ref: string }
  | { a: "centre"; ref: string; id: string }
  | { a: "filer"; id: string }
  | { a: "update"; ref: string }
  | { a: "tax"; days: number; income: Income }
  | { a: "bank"; bank: string }
  | { a: "city"; city: string }
  | { a: "flight"; id: string; provider: string; price: number }
  | { a: "hotel"; id: string; provider: string; price: number }
  | { a: "pickup"; id: string }
  | { a: "schools"; curriculum: string }
  | { a: "seat"; id: string }
  | { a: "healthPlans"; profile: HealthProfile }
  | { a: "healthPlan"; id: string; profile: HealthProfile }
  | { a: "healthQuote"; id: string; profile: HealthProfile };

export type Option = { label: string; action: Action };

export type Widget =
  | { t: "sarahDocuments" }
  | { t: "sarahQuote" }
  | { t: "menu" }
  | { t: "homes"; ids: string[] }
  | { t: "home"; id: string }
  | { t: "slots"; purpose: Purpose; subject: string; days: string[]; via?: string; price?: number }
  | { t: "lease"; id: string; provider: string; price: number }
  | { t: "pay"; payment: Payment }
  | { t: "receipt"; ref: string }
  | { t: "visaPick" }
  | { t: "family" }
  | { t: "docs"; slug: string }
  | { t: "channels"; slug: string }
  | { t: "centres"; ref: string }
  | { t: "filers" }
  | { t: "tax" }
  | { t: "banks" }
  | { t: "cities" }
  | { t: "flights"; city: string }
  | { t: "hotels" }
  | { t: "pickup" }
  | { t: "schools"; curriculum: string }
  | { t: "healthProfile" }
  | { t: "healthPlans"; profile: HealthProfile }
  | { t: "healthPlan"; id: string; profile: HealthProfile }
  | { t: "file" };

export type ChatMessage = {
  id: string;
  role: "you" | "wusool";
  text: string;
  widget?: Widget;
  options?: Option[];
  model?: string;
  sources?: { title: string; url: string }[];
};

export type ReceiptKind = "viewing" | "lease" | "visa" | "medical" | "tax" | "bank" | "trip" | "school" | "health";

export type Receipt = {
  ref: string;
  kind: ReceiptKind;
  title: string;
  lines: [string, string][];
  total?: number;
  stage?: number;
};

export type Trip = {
  city?: string;
  flightLabel?: string;
  flightPrice?: number;
  hotelLabel?: string;
  hotelTotal?: number;
  transferLabel?: string;
};

export type Quote = {
  id: string;
  name: string;
  price: number;
  role: "PRO" | "Provider";
  turnaround: string;
  review: string;
  note?: string;
};

export type Listing = {
  id: string;
  title: string;
  area: string;
  areaSlug: string;
  cluster: Cluster;
  kind: "rent" | "buy";
  beds: number;
  baths: number;
  sqm: number;
  price: number;
  furnished: boolean;
  pet: boolean;
  schoolKm: number;
  community: string;
  note: string;
  image: string;
};

export type District = {
  slug: string;
  name: string;
  nameAr: string;
  cluster: Cluster;
  character: string;
  climate: string;
  commute: string;
  schools: string;
};

export type VisaType = {
  slug: string;
  title: string;
  titleAr: string;
  who: string;
  documents: string[];
  timeline: string;
  cost: string;
  next: string;
};

export type School = {
  id: string;
  name: string;
  curriculum: string;
  fees: string;
  area: string;
  areaSlug: string;
  turnaround: string;
  review: string;
};

export type Flight = {
  id: string;
  city: string;
  code: string;
  depart: string;
  duration: string;
  stops: string;
  image: string;
  quotes: Quote[];
};

export type Hotel = { id: string; name: string; area: string; note: string; image: string; quotes: Quote[] };

export type RelocationProfile = {
  sarahDemoStage?: "documents" | "assessed";
  name?: string; originCity?: string; moveDate?: string; employment?: string;
  monthlySalary?: number; annualHousingBudget?: number; bedrooms?: number;
  area?: string; housingKind?: "rent" | "buy"; curriculum?: string;
  pet?: boolean; furnished?: boolean; priorities?: string;
};

export type AIContext = {
  lang: Lang; profile: RelocationProfile; family: Family; trip: Trip; receipts: Receipt[];
  healthProfile?: HealthProfile;
};
export type AIReply = {
  text: string; widget?: Widget; options?: Option[]; profile: RelocationProfile;
  model: string; sources: { title: string; url: string }[];
  family?: Family;
};

export type DemoDocument = { group: "identity" | "school" | "french" | "career" | "move"; name: string };
