import {
  NIGHTS,
  banks,
  centres,
  cityNames,
  filers,
  flightById,
  hotelById,
  homeQuotes,
  listingById,
  listings,
  schoolById,
  transfers,
  visaBySlug,
  visaChannels,
  visaFees,
} from "./data";
import { aed } from "./format";
import { healthHospitals, healthPlanById, matchHealthPlans, validHealthProfile } from "./health-data";
import type { Action, Family, HomeFilter, Option, Payment, Receipt, Trip, Widget } from "./types";

export type Ctx = { receipts: Receipt[]; trip: Trip; family: Family };

export type Result = {
  text: string;
  widget?: Widget;
  options?: Option[];
  receipt?: Receipt;
  trip?: Trip;
  family?: Family;
  advance?: { ref: string; stage: number };
};

export const visaStages = [
  "Application submitted",
  "Under review at ICP",
  "Medical test",
  "Biometrics and Emirates ID",
  "Residence visa issued",
];

const go = {
  file: { label: "Show my file", action: { a: "topic", topic: "file" } },
  bank: { label: "Open a bank account", action: { a: "topic", topic: "bank" } },
  school: { label: "Find a school", action: { a: "topic", topic: "school" } },
  arrive: { label: "Plan my travel", action: { a: "topic", topic: "arrive" } },
  health: { label: "Find health cover", action: { a: "topic", topic: "health" } },
  homes: { label: "Find a home", action: { a: "topic", topic: "home" } },
  family: { label: "Bring my family", action: { a: "visaFor", slug: "family" } },
  visa: { label: "Start my visa", action: { a: "topic", topic: "visa" } },
} satisfies Record<string, Option>;

function ref(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function nextDays(count = 5) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() + i + 1);
    return day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  });
}

function firstOfNextMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function total(payment: Payment) {
  return payment.lines.reduce((sum, [, amount]) => sum + amount, 0);
}

export function matchHomes(filter: HomeFilter) {
  const pool = listings.filter((l) => (filter.kind ? l.kind === filter.kind : true));
  let found = pool.filter(
    (l) =>
      (filter.area ? l.areaSlug === filter.area : true) &&
      (filter.beds !== undefined ? l.beds >= filter.beds : true) &&
      (filter.max !== undefined ? l.price <= filter.max : true) &&
      (filter.furnished !== undefined ? l.furnished === filter.furnished : true) &&
      (filter.pet ? l.pet : true),
  );
  const exact = found.length > 0;
  if (!exact) found = [...pool].sort((a, b) => Math.abs(a.price - (filter.max ?? a.price)) - Math.abs(b.price - (filter.max ?? b.price)));
  if (filter.school) found = [...found].sort((a, b) => a.schoolKm - b.schoolKm);
  return { ids: found.slice(0, 4).map((l) => l.id), exact };
}

function people(family: Family) {
  return Math.max(1, (family.spouse ? 1 : 0) + family.kids + family.parents);
}

function paid(payment: Payment, ctx: Ctx): Result {
  if (!validPayment(payment, ctx)) return unavailable("This quote is incomplete or no longer matches the selected provider. Choose the service again.");
  const amount = aed(total(payment));
  if (payment.for === "lease") {
    const home = listingById(payment.subject);
    const receipt: Receipt = {
      ref: ref("TW"),
      kind: "lease",
      title: "Demo tenancy payment",
      lines: [
        ["Home", home ? `${home.title}, ${home.community}` : payment.subject],
        ["Listed on", payment.via ?? "The portal"],
        ["Starts", firstOfNextMonth()],
        ["Paid today", amount],
      ],
      total: total(payment),
    };
    return {
      text: "Demo payment saved. In a real move, the landlord and agent confirm the lease, payment schedule and Tawtheeq registration before handover.",
      widget: { t: "receipt", ref: receipt.ref },
      receipt,
      options: [go.family, go.bank, go.file],
    };
  }
  if (payment.for === "visa") {
    const visa = visaBySlug(payment.subject);
    const receipt: Receipt = {
      ref: ref("ICP"),
      kind: "visa",
      title: visa?.title ?? "Residence visa",
      lines: [
        ["Applicants", payment.subject === "family" ? `${people(ctx.family)} people` : "You"],
        ["Filed with", payment.via ?? "Your employer"],
        ["Fees", amount],
      ],
      total: total(payment),
      stage: 0,
    };
    return {
      text: "Demo application saved. Nothing has been submitted to ICP. Continue to preview the application stages and required appointments.",
      widget: { t: "receipt", ref: receipt.ref },
      receipt,
      options: [{ label: "Check for an update", action: { a: "update", ref: receipt.ref } }, go.bank, go.school],
    };
  }
  if (payment.for === "tax") {
    const receipt: Receipt = {
      ref: ref("TRC"),
      kind: "tax",
      title: "Tax residency certificate",
      lines: [
        ["Filed with", payment.via ?? "EmaraTax"],
        ["Issued by", "Federal Tax Authority"],
        ["Status", "Demo request, not submitted to FTA"],
        ["Paid", amount],
      ],
      total: total(payment),
    };
    return {
      text: "Demo request saved. In a real application, the FTA reviews your evidence before issuing a certificate. Treaty requirements and any obligations in another country must be checked separately.",
      widget: { t: "receipt", ref: receipt.ref },
      receipt,
      options: [go.bank, go.file],
    };
  }
  const receipt: Receipt = {
    ref: ref("TRIP"),
    kind: "trip",
    title: "Your travel plan",
    lines: [
      ["Flight", ctx.trip.flightLabel ?? "Not selected"],
      ["Hotel", ctx.trip.hotelLabel ?? "Not selected"],
      ["Transfer", ctx.trip.transferLabel ?? "Not booked"],
      ["Paid", amount],
    ],
    total: total(payment),
  };
  return {
    text: `Demo travel plan saved with your flight and stay${ctx.trip.transferLabel && ctx.trip.transferLabel !== "Not booked" ? ", plus your selected airport transport" : ". Airport transport is not booked"}. Real fares, availability and reservations must be confirmed with each provider.`,
    widget: { t: "receipt", ref: receipt.ref },
    receipt,
    options: [go.homes, go.visa, go.health],
  };
}

function unavailable(text = "That option is no longer available in this demo. Choose a service to continue."): Result {
  return { text, widget: { t: "menu" } };
}

function validPayment(payment: Payment, ctx: Ctx) {
  if (!payment?.lines?.length || payment.lines.some(([, amount]) => !Number.isFinite(amount) || amount < 0)) return false;
  if (payment.for === "lease") return Boolean(listingById(payment.subject));
  if (payment.for === "visa") return Boolean(visaBySlug(payment.subject));
  if (payment.for === "tax") return filers.some((filer) => filer.id === payment.subject);
  if (payment.for === "trip") return Boolean(ctx.trip.flightLabel && ctx.trip.hotelLabel && ctx.trip.flightPrice && ctx.trip.hotelTotal);
  return false;
}

export function run(action: Action, ctx: Ctx): Result {
  switch (action.a) {
    case "sarahDemo": return unavailable("Open Sarah’s family assessment in the chat to continue this demo.");
    case "topic": {
      switch (action.topic) {
        case "menu":
          return { text: "What would you like to sort out first?", widget: { t: "menu" } };
        case "home":
          return {
            text: "Explore sample homes in real Abu Dhabi communities. Prices and availability are illustrative. Tell me a budget or an area to narrow the list.",
            widget: { t: "homes", ids: matchHomes({ kind: "rent" }).ids },
            options: [
              { label: "Under AED 120,000", action: { a: "homes", filter: { kind: "rent", max: 120000 } } },
              { label: "Close to a school", action: { a: "homes", filter: { kind: "rent", school: true } } },
              { label: "Homes to buy", action: { a: "homes", filter: { kind: "buy" } } },
            ],
          };
        case "visa":
          return { text: "Who is the visa for?", widget: { t: "visaPick" } };
        case "tax":
          return { text: "Start with your time in the UAE and income type. This is a general guide; days alone do not determine your full tax position.", widget: { t: "tax" } };
        case "bank":
          return {
            text: "Compare banks and their account requirements. Products, approval and fees depend on the selected account and the bank’s checks.",
            widget: { t: "banks" },
          };
        case "arrive":
          return { text: "Where are you flying from?", widget: { t: "cities" } };
        case "school":
          return {
            text: "Explore real Abu Dhabi schools. Tuition depends on year group and the academic year; admissions and any available places must be confirmed with the school.",
            widget: { t: "schools", curriculum: "all" },
          };
        case "health":
          return { text: "Let’s compare health cover for your move. First check what your employer or sponsor provides, then choose the network and benefits you need.", widget: { t: "healthProfile" } };
        case "file":
          return {
            text: ctx.receipts.length
              ? "Your saved demo plans, payments and requests."
              : "Nothing booked yet. Start with any of these.",
            widget: ctx.receipts.length ? { t: "file" } : { t: "menu" },
          };
      }
      break;
    }
    case "homes": {
      const { ids, exact } = matchHomes(action.filter);
      const what = action.filter.kind === "buy" ? "to buy" : "to rent";
      return {
        text: exact
          ? `${ids.length === 1 ? "One home" : `${ids.length} homes`} ${what}${action.filter.max ? ` under ${aed(action.filter.max)}` : ""}${action.filter.school ? ", closest to a school first" : ""}. Pick one to see it.`
          : "Nothing matched exactly. These are the closest.",
        widget: { t: "homes", ids },
      };
    }
    case "home": {
      const home = listingById(action.id);
      if (!home) return { text: "That home is no longer listed.", widget: { t: "menu" } };
      return {
        text: `${home.title} in ${home.community}. ${home.note} This is a sample property, with illustrative portal quotes. Confirm the actual listing and licensed agent before booking.`,
        widget: { t: "home", id: home.id },
        options: [{ label: "Show other homes", action: { a: "topic", topic: "home" } }],
      };
    }
    case "viewing": {
      const home = listingById(action.id);
      if (!home || !homeQuotes(home).some((quote) => quote.name === action.provider && quote.price === action.price)) return unavailable();
      return {
        text: `Choose a preferred viewing time for this demo request via ${action.provider}. A real viewing is confirmed by the listing agent.`,
        widget: { t: "slots", purpose: "viewing", subject: action.id, days: nextDays(), via: action.provider, price: action.price },
      };
    }
    case "slot": {
      if (!action.day?.trim() || !/^\d{2}:\d{2}$/.test(action.time)) return unavailable("Choose a valid day and time to continue.");
      const when = `${action.day}, ${action.time}`;
      if (action.purpose === "viewing") {
        const home = listingById(action.subject);
        if (!home) return unavailable();
        const receipt: Receipt = {
          ref: ref("VW"),
          kind: "viewing",
          title: "Demo viewing request",
          lines: [
            ["Home", home ? `${home.title}, ${home.community}` : action.subject],
            ["Listed on", action.via ?? "The portal"],
            ["When", when],
            ["Agent", `${action.via ?? "The portal"} meets you in the lobby`],
          ],
        };
        return {
          text: "Your preferred viewing time is saved in this demo. No agent has been contacted.",
          widget: { t: "receipt", ref: receipt.ref },
          receipt,
          options: [
            ...(home?.kind === "rent" && action.price
              ? [{ label: "Rent this home", action: { a: "lease", id: home.id, provider: action.via ?? "The portal", price: action.price } } as Option]
              : []),
            go.arrive,
            { label: "Show other homes", action: { a: "topic", topic: "home" } },
          ],
        };
      }
      if (action.purpose === "bank") {
        const bank = banks.find((b) => b.id === action.subject);
        if (!bank) return unavailable();
        const receipt: Receipt = {
          ref: ref("BK"),
          kind: "bank",
          title: "Demo bank appointment request",
          lines: [
            ["Bank", bank?.name ?? action.subject],
            ["When", when],
            ["Bring", "Passport, Emirates ID application, tenancy contract, salary letter"],
          ],
        };
        return {
          text: "Your bank appointment preference is saved. The bank confirms availability, identity documents and account approval; no appointment has been made by this demo.",
          widget: { t: "receipt", ref: receipt.ref },
          receipt,
          options: [go.school, go.file],
        };
      }
      if (action.purpose !== "medical" || !ctx.receipts.some((item) => item.ref === action.subject && item.kind === "visa") || !centres.some((centre) => centre.name === action.via && centre.price === action.price)) return unavailable();
      const receipt: Receipt = {
        ref: ref("MED"),
        kind: "medical",
        title: "Demo visa medical appointment",
        lines: [
          ["Visa application", action.subject],
          ["Centre", action.via ?? "The screening centre"],
          ["When", when],
          ["Fee at the centre", action.price ? aed(action.price) : "Paid there"],
          ["Bring", "Passport and the application number"],
        ],
      };
      return {
        text: "The adult applicant’s visa medical appointment preference is saved. Attendance and screening results are required before the next visa stage. Applicants under 18 do not take the residence medical fitness test.",
        widget: { t: "receipt", ref: receipt.ref },
        receipt,
        options: [{ label: "Check for an update", action: { a: "update", ref: action.subject } }, go.file],
      };
    }
    case "lease": {
      const home = listingById(action.id);
      if (!home || home.kind !== "rent" || !homeQuotes(home).some((quote) => quote.name === action.provider && quote.price === action.price)) return unavailable();
      return {
        text: `Here is what moving in costs on ${action.provider}. Choose how many cheques you want to pay the rent in.`,
        widget: { t: "lease", id: action.id, provider: action.provider, price: action.price },
      };
    }
    case "pay":
      return validPayment(action.payment, ctx) ? { text: "Review the illustrative amounts, then preview the demo payment.", widget: { t: "pay", payment: action.payment } } : unavailable();
    case "paid":
      return paid(action.payment, ctx);
    case "visaFor": {
      if (action.slug === "family") return { text: "Who is coming with you?", widget: { t: "family" } };
      const visa = visaBySlug(action.slug);
      if (!visa) return unavailable();
      return {
        text:
          action.slug === "employment"
            ? "Your employer handles this route. Preview the documents their PRO will need; this demo does not send your papers."
            : `${visa?.title ?? "Residence"}. Attach these papers. Clear photos or PDFs are fine.`,
        widget: { t: "docs", slug: action.slug },
      };
    }
    case "family": {
      if (typeof action.family?.spouse !== "boolean" || !Number.isInteger(action.family.kids) || action.family.kids < 0 || action.family.kids > 6 || !Number.isInteger(action.family.parents) || action.family.parents < 0 || action.family.parents > 2 || !(action.family.spouse || action.family.kids || action.family.parents)) return unavailable("Choose at least one family member and check the counts before continuing.");
      const n = people(action.family);
      return {
        text: `Now the papers for ${n === 1 ? "one person" : `${n} people`}. Clear photos or PDFs are fine.`,
        widget: { t: "docs", slug: "family" },
        family: action.family,
      };
    }
    case "docs": {
      const visa = visaBySlug(action.slug);
      if (!visa) return unavailable();
      if (action.slug === "employment") {
        return paid(
          { for: "visa", title: visa?.title ?? "Residence visa", subject: action.slug, lines: visaFees(action.slug, 1) },
          ctx,
        );
      }
      return {
        text: "The document checklist is ready. Compare the filing routes. Service fees below are illustrative; the official portal or authorised provider confirms the payable amount.",
        widget: { t: "channels", slug: action.slug },
      };
    }
    case "channel": {
      const channel = visaChannels.find((item) => item.id === action.id);
      const visa = visaBySlug(action.slug);
      if (!channel || !visa) return unavailable();
      const count = action.slug === "family" ? people(ctx.family) : 1;
      const lines = visaFees(action.slug, count);
      if (channel.price > 0) lines.push([`${channel.name}, ${count === 1 ? "service fee" : `service fee, ${count} people`}`, channel.price * count]);
      return {
        text: channel.price
          ? `${channel.name} files it. Government fees, plus their service fee.`
          : `${channel.name}. You file it yourself, so there is no service fee.`,
        widget: {
          t: "pay",
          payment: { for: "visa", title: visa?.title ?? "Residence visa", subject: action.slug, via: channel.name, lines },
        },
      };
    }
    case "medical": {
      if (!ctx.receipts.some((item) => item.ref === action.ref && item.kind === "visa")) return unavailable("Start a visa application before planning its medical appointment. Health insurance is a separate service.");
      return {
        text: "Residence medical fitness screening applies to adults aged 18 and over. Compare the available screening providers and verify the centre and fee before booking.",
        widget: { t: "centres", ref: action.ref },
      };
    }
    case "centre": {
      const centre = centres.find((item) => item.id === action.id);
      if (!centre || !ctx.receipts.some((item) => item.ref === action.ref && item.kind === "visa")) return unavailable();
      return {
        text: `Pick a time at ${centre.name}.`,
        widget: { t: "slots", purpose: "medical", subject: action.ref, days: nextDays(), via: centre.name, price: centre.price },
      };
    }
    case "tax": {
      if (!Number.isInteger(action.days) || action.days < 0 || action.days > 366 || !["salary", "business"].includes(action.income)) return unavailable();
      const resident = action.days >= 90;
      const salary = "Employment wages are outside UAE Corporate Tax for natural persons.";
      const business = "For a natural person running a UAE business, Corporate Tax generally comes into scope when annual business turnover exceeds AED 1 million. Companies follow separate rules.";
      const residency = action.days >= 183
        ? `At ${action.days} days in a consecutive 12-month period, you may meet the physical-presence test for UAE domestic tax residence.`
        : action.days >= 90
          ? `At ${action.days} days, a valid UAE residence right plus a permanent home, employment or business in the UAE may satisfy the 90-day domestic test.`
          : `At ${action.days} days, the day-count tests alone are not met. Your usual residence and centre of personal and financial interests may also matter.`;
      return {
        text: `${action.income === "salary" ? salary : business} ${residency} A certificate requires supporting evidence; treaty eligibility and tax in another country must be assessed separately.`,
        widget: resident ? { t: "filers" } : undefined,
        options: resident ? undefined : [go.bank],
      };
    }
    case "filer": {
      const filer = filers.find((item) => item.id === action.id);
      if (!filer) return unavailable();
      const lines: [string, number][] =
        filer.id === "emaratax"
          ? [
              ["Certificate", 1000],
              ["Portal fee", 50],
            ]
          : [
              ["Certificate", 1050],
              [`${filer.name} service`, filer.price - 1050],
            ];
      return {
        text: `${filer.name}: preview fees for a natural person without a Corporate Tax TRN. The AED 50 submission fee and AED 1,000 electronic-certificate review fee have different payment stages. Confirm fees and eligibility on the FTA portal. Any adviser fee shown is illustrative.`,
        widget: { t: "pay", payment: { for: "tax", title: "Tax residency certificate", subject: filer.id, via: filer.name, lines } },
      };
    }
    case "bank": {
      const bank = banks.find((b) => b.id === action.bank);
      if (!bank) return unavailable();
      if (bank.id === "wio") {
        const receipt: Receipt = {
          ref: ref("BK"), kind: "bank", title: "Wio onboarding checklist",
          lines: [["Bank", bank.name], ["Route", "Apply in the Wio Personal app"], ["Have ready", "Valid Emirates ID and the bank’s requested identity details"], ["Status", "Demo guide saved; no account application submitted"]],
        };
        return { text: "Wio Personal uses an app onboarding route. Your checklist is saved. The bank completes identity verification and confirms the selected plan’s fees and eligibility.", widget: { t: "receipt", ref: receipt.ref }, receipt, options: [go.health, go.file] };
      }
      return {
        text: `Choose a preferred consultation time with ${bank.name}. These are example slots, not live branch availability.`,
        widget: { t: "slots", purpose: "bank", subject: action.bank, days: nextDays() },
      };
    }
    case "city": {
      if (!cityNames.includes(action.city)) return unavailable("Choose one of the available departure cities to see example routes.");
      return {
        text: `Example routes from ${action.city} to Abu Dhabi. Flight times, schedules and fares vary by travel date. Airline and comparison-site quotes are illustrative.`,
        widget: { t: "flights", city: action.city },
        trip: { city: action.city },
      };
    }
    case "flight": {
      const flight = flightById(action.id);
      const provider = flight?.quotes.find((quote) => quote.id === action.provider);
      if (!flight || !provider || provider.price !== action.price) return unavailable("That flight or provider quote does not match the available demo options.");
      return {
        text: `Choose a first stay for ${NIGHTS} nights. Rates below are illustrative and availability must be checked for your travel dates.`,
        widget: { t: "hotels" },
        trip: {
          ...ctx.trip,
          flightLabel: flight ? `${flight.code} from ${flight.city}, ${provider?.name ?? action.provider}, departs ${flight.depart}` : action.id,
          flightPrice: action.price,
        },
      };
    }
    case "hotel": {
      const hotel = hotelById(action.id);
      const provider = hotel?.quotes.find((quote) => quote.id === action.provider);
      if (!hotel || !provider || provider.price !== action.price || !ctx.trip.flightLabel) return unavailable("Choose a flight and a matching hotel quote before adding your stay.");
      return {
        text: "Choose an example airport transport option, or arrange a taxi yourself. Vehicle availability, pickup rules and actual fares depend on the provider and travel date.",
        widget: { t: "pickup" },
        trip: {
          ...ctx.trip,
          hotelLabel: hotel ? `${hotel.name}, ${NIGHTS} nights, ${provider?.name ?? action.provider}` : action.id,
          hotelTotal: action.price * NIGHTS,
        },
      };
    }
    case "pickup": {
      const transfer = transfers.find((item) => item.id === action.id);
      if ((!transfer && action.id !== "none") || !ctx.trip.flightLabel || !ctx.trip.hotelLabel) return unavailable("Choose your flight and first stay before completing the travel plan.");
      const lines: [string, number][] = [];
      if (ctx.trip.flightPrice) lines.push([ctx.trip.flightLabel ?? "Flight", ctx.trip.flightPrice]);
      if (ctx.trip.hotelTotal) lines.push([ctx.trip.hotelLabel ?? "Hotel", ctx.trip.hotelTotal]);
      if (transfer) lines.push([transfer.name, transfer.price]);
      return {
        text: "Review the illustrative travel total, then preview checkout. This demo does not issue tickets or reserve accommodation.",
        widget: { t: "pay", payment: { for: "trip", title: "Your travel plan", subject: "trip", lines } },
        trip: { ...ctx.trip, transferLabel: transfer?.name ?? "Not booked" },
      };
    }
    case "schools":
      return { text: "Choose a school to prepare an admissions enquiry. Year group, assessments and available places must be confirmed with admissions.", widget: { t: "schools", curriculum: action.curriculum } };
    case "seat": {
      const school = schoolById(action.id);
      if (!school) return unavailable();
      const receipt: Receipt = {
        ref: ref("SC"),
        kind: "school",
        title: "School admissions enquiry draft",
        lines: [
          ["School", school ? `${school.name}, ${school.fees}` : action.id],
          ["Next", "Contact admissions with your child’s date of birth, year group and intended start date"],
          ["Have ready", "Recent school reports, passport and transfer documentation as requested"],
          ["Status", "Demo draft saved; no enquiry sent and no place reserved"],
        ],
      };
      return {
        text: `An enquiry checklist for ${school.name} is saved. Admissions will need your child’s details and will confirm assessment requirements and availability. No request has been sent by this demo.`,
        widget: { t: "receipt", ref: receipt.ref },
        receipt,
        options: [
          { label: "Homes near a school", action: { a: "homes", filter: { kind: "rent", school: true } } },
          go.file,
        ],
      };
    }
    case "healthPlans": {
      if (!validHealthProfile(action.profile)) return { text: "Check your age, family count and residence details, then compare again.", widget: { t: "healthProfile" } };
      if (action.profile.visa === "visitor") return {
        text: "These are resident health products. For a visit, compare a visitor or travel medical policy and check visa requirements directly with the insurer. Once residence is in progress, return here for resident cover.",
        options: [{ label: "Update residence details", action: { a: "topic", topic: "health" } }, go.arrive],
      };
      return {
        text: `Compare published products, with annual benefit limits shown separately from premiums. ${action.profile.employerCover !== "no" ? "Confirm your existing employer cover before buying another policy. " : ""}${action.profile.visa === "pending" ? "The insurer must confirm whether your residence application documents are accepted. " : ""}Network access, eligibility and price are confirmed only in a personalised quote.`,
        widget: { t: "healthPlans", profile: action.profile },
        options: [{ label: "Change my details", action: { a: "topic", topic: "health" } }],
      };
    }
    case "healthPlan": {
      const plan = healthPlanById(action.id);
      if (!plan || !matchHealthPlans(action.profile).some((item) => item.id === action.id)) return unavailable("That health product does not match your current comparison details.");
      return { text: `${plan.insurer} ${plan.name}. Check the benefits, exact network and exclusions before requesting a quote. ${plan.id === "daman-flexi" ? "Flexi has restricted eligibility and medical underwriting; AED 750 is a published standard-risk premium, not a guaranteed offer." : "The insurer must quote for each family member; no personalised premium has been calculated."}`, widget: { t: "healthPlan", id: plan.id, profile: action.profile } };
    }
    case "healthQuote": {
      const plan = healthPlanById(action.id);
      if (!plan || !matchHealthPlans(action.profile).some((item) => item.id === action.id)) return unavailable("Update your residence details before preparing this quote request.");
      const hospital = healthHospitals.find((item) => item.id === action.profile.hospital);
      const receipt: Receipt = {
        ref: ref("HC"), kind: "health", title: "Health insurance quote request draft",
        lines: [
          ["Product", `${plan.insurer} ${plan.name}`],
          ["People", `${1 + action.profile.dependants} (adult applicant age ${action.profile.age}; dependant details still required)`],
          ["Visa", `${action.profile.emirate === "abu-dhabi" ? "Abu Dhabi" : action.profile.emirate === "dubai" ? "Dubai" : "Another emirate"}; ${action.profile.visa === "resident" ? "resident" : "residence in progress"}`],
          ["Area of cover", plan.area],
          ["Premium", "Personalised quote pending insurer review"],
          ["Hospital check", hospital ? `${hospital.name}; network access unverified` : "Confirm preferred facilities with insurer"],
          ["Status", "Demo draft saved; not sent to insurer and no policy activated"],
        ],
      };
      return { text: `Your ${plan.insurer} quote-request draft is saved. Complete the insurer’s application and health declaration directly with them, then review the quote. No request was sent and no cover is active.`, widget: { t: "receipt", ref: receipt.ref }, receipt, options: [go.file, go.visa, go.bank] };
    }
  }
  return { text: "What would you like to sort out first?", widget: { t: "menu" } };
}
