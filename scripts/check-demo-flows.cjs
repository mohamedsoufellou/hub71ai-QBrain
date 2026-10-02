/* Run with node scripts/check-demo-flows.cjs. No browser storage is touched. */
/* eslint-disable @typescript-eslint/no-require-imports -- This Node runner installs a CommonJS TypeScript loader without additional test dependencies. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return originalResolve.call(this, name.startsWith("@/") ? path.join(root, name.slice(2)) : name, ...args);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
}
const memory = new Map();
global.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};

const data = require("../lib/data.ts");
const { run, total, matchHomes, visaStages } = require("../lib/flow.ts");
const { interpret } = require("../lib/intent.ts");
const { useFile } = require("../lib/store.ts");
const failures = [];
let checks = 0;
let scenarios = 0;

function verify(condition, message) {
  checks++;
  assert.ok(condition, message);
}
function equal(actual, expected, message) {
  checks++;
  assert.deepEqual(actual, expected, message);
}
function scenario(name, fn) {
  scenarios++;
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
function fresh() {
  return { receipts: [], trip: {}, family: { spouse: true, kids: 2, parents: 0 } };
}
function action(ctx, request) {
  const result = run(request, ctx);
  verify(typeof result.text === "string" && result.text.length > 0, `${request.a} must explain its result`);
  if (result.receipt) {
    verify(result.widget?.t === "receipt" && result.widget.ref === result.receipt.ref, "Receipt widget must point to its saved receipt");
    verify(!ctx.receipts.some((item) => item.ref === result.receipt.ref), "Receipt references must be unique");
    verify(result.receipt.lines.every(([label, value]) => label && typeof value === "string" && value && !/undefined|NaN/.test(value)), "Receipt details cannot contain empty or invalid values");
    ctx.receipts.unshift(result.receipt);
  }
  if (result.trip) ctx.trip = result.trip;
  if (result.family) ctx.family = result.family;
  if (result.advance) {
    const receipt = ctx.receipts.find((item) => item.ref === result.advance.ref);
    verify(receipt?.kind === "visa", "Only an existing visa can have its progress advanced");
    if (receipt) receipt.stage = Math.max(receipt.stage ?? 0, result.advance.stage);
  }
  if (result.widget?.t === "pay") validatePayment(result.widget.payment);
  return result;
}
function validatePayment(payment) {
  verify(payment.lines.length > 0, `${payment.for} payment must contain an itemized amount`);
  verify(payment.lines.every(([label, amount]) => label && Number.isFinite(amount) && amount >= 0), "Payment lines must have labels and nonnegative amounts");
  verify(Number.isFinite(total(payment)) && total(payment) >= 0, "A payment total must be finite and nonnegative");
}
function completePayment(ctx, result) {
  verify(result.widget?.t === "pay", "Checkout must provide a payment widget");
  const payment = result.widget.payment;
  const completed = action(ctx, { a: "paid", payment });
  equal(completed.receipt?.total, total(payment), "Receipt amount must match checkout exactly");
  return completed;
}
function uniqueIds(name, collection) {
  verify(collection.length > 0, `${name} needs seed options`);
  equal(new Set(collection.map((item) => item.id ?? item.slug)).size, collection.length, `${name} IDs must be unique`);
}
function localImage(src, description) {
  verify(src?.startsWith("/"), `${description} must use a local image`);
  verify(fs.existsSync(path.join(root, "public", src)), `${description} image is missing: ${src}`);
}

scenario("Inventory, images, district references, and quote integrity", () => {
  for (const name of ["districts", "listings", "visas", "schools", "banks", "hotels", "transfers", "visaChannels", "centres", "filers"]) uniqueIds(name, data[name]);
  for (const listing of data.listings) {
    verify(Boolean(data.districtBySlug(listing.areaSlug)), `${listing.id} district must exist`);
    verify(listing.price > 0 && listing.sqm > 0 && Number.isInteger(listing.beds) && listing.beds >= 0 && listing.baths > 0 && listing.schoolKm >= 0, `${listing.id} needs usable housing facts (zero bedrooms denotes a studio)`);
    localImage(listing.image, listing.id);
    uniqueIds(`quotes for ${listing.id}`, data.homeQuotes(listing));
    verify(data.homeQuotes(listing).every((quote) => Number.isFinite(quote.price) && quote.price > 0), "Housing quotes must be positive");
  }
  for (const school of data.schools) verify(Boolean(data.districtBySlug(school.areaSlug)), `${school.id} district must exist`);
  for (const hotel of data.hotels) {
    localImage(hotel.image, hotel.id);
    uniqueIds(`quotes for ${hotel.id}`, hotel.quotes);
    verify(hotel.quotes.every((quote) => Number.isFinite(quote.price) && quote.price > 0), "Hotel nightly estimates must be positive");
  }
});

scenario("Intent routes preserve a user's requested service", () => {
  const requests = [
    ["I need a villa in Khalifa City under AED 150,000", "homes"],
    ["Find a British school in Al Reem", "school"],
    ["Flights from New York", "city"],
    ["Open a bank account", "bank"],
    ["Do I pay tax on my salary?", "tax"],
    ["I need health insurance in Abu Dhabi", "health"],
  ];
  for (const [request, expected] of requests) {
    const parsed = interpret(request);
    equal(parsed?.a === "topic" ? parsed.topic : parsed?.a, expected, `Wrong service for: ${request}`);
  }
  equal(interpret("Green residency")?.slug, "green", "Green residency must not turn into a freelance permit");
  const rental = interpret("3 bedrooms in Khalifa City below 150k");
  equal(rental?.filter, { kind: "rent", area: "khalifa", beds: 3, max: 150000, school: false }, "Housing filters must preserve bedroom count, district, and budget");
});

scenario("Homes retain filters and produce usable viewing/lease journeys", () => {
  for (const listing of data.listings) {
    const ctx = fresh();
    const matches = matchHomes({ kind: listing.kind, area: listing.areaSlug, max: listing.price, beds: listing.beds });
    verify(matches.exact, `${listing.id} must match its own filters`);
    for (const id of matches.ids) {
      const match = data.listingById(id);
      verify(match.kind === listing.kind && match.areaSlug === listing.areaSlug && match.price <= listing.price && match.beds >= listing.beds, "An exact housing result cannot silently violate filters");
    }
    equal(action(ctx, { a: "home", id: listing.id }).widget?.id, listing.id, "Detail must preserve selected home");
    const quote = data.homeQuotes(listing)[0];
    const viewing = action(ctx, { a: "viewing", id: listing.id, provider: quote.name, price: quote.price });
    verify(viewing.widget?.t === "slots" && new Set(viewing.widget.days).size === viewing.widget.days.length, "Viewing needs distinct appointment days");
    const booked = action(ctx, { a: "slot", purpose: "viewing", subject: listing.id, day: viewing.widget.days[0], time: "10:00", via: quote.name, price: quote.price });
    equal(booked.receipt?.kind, "viewing", "Viewing creates the correct receipt");
    equal(booked.options?.some((option) => option.action.a === "lease") ?? false, listing.kind === "rent", "Purchase viewings must not offer a rental checkout");
    if (listing.kind === "rent") {
      const lease = action(ctx, { a: "lease", id: listing.id, provider: quote.name, price: quote.price });
      equal(lease.widget?.t, "lease", "A rental needs move-in cost selection");
      equal(lease.widget?.price, quote.price, "Lease estimate must preserve selected annual rent");
    }
  }
  const none = matchHomes({ kind: "rent", max: 1 });
  equal(none.exact, false, "Unavailable budgets must be marked as approximate alternatives");
});

scenario("Rendered rental budgets reconcile with checkout and saved receipts", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { Step } = require("../components/Steps.tsx");
  for (const home of data.listings.filter((listing) => listing.kind === "rent")) for (const quote of data.homeQuotes(home)) {
    const ctx = fresh();
    const selection = action(ctx, { a: "lease", id: home.id, provider: quote.name, price: quote.price });
    const html = renderToStaticMarkup(React.createElement(Step, { widget: selection.widget, act: () => {} }));
    const lines = [...html.matchAll(/<li><span class="wu-list__body hal-text">([^<]+)<\/span><span class="wu-amount">AED ([\d,]+)<\/span><\/li>/g)]
      .map(([, label, amount]) => [label, Number(amount.replaceAll(",", ""))]);
    verify(lines.length >= 3, "The actual rental budget must render itemized rent, deposit, and move-in charges");
    const displayed = html.match(/class="wu-sum__value">AED ([\d,]+)</);
    verify(Boolean(displayed), "The rental budget must show its amount due");
    const payment = { for: "lease", title: "Move-in costs", subject: home.id, via: quote.name, lines };
    equal(total(payment), Number(displayed[1].replaceAll(",", "")), "Rendered rental line items must add up to the displayed total");
    const saved = completePayment(ctx, action(ctx, { a: "pay", payment }));
    equal(saved.receipt?.kind, "lease", "Rental checkout must save a lease record");
    verify(saved.receipt.lines.some(([, value]) => value.includes(home.title)), "Rental receipt must retain the home selected in the rendered budget");
    verify(/demo|simulat/i.test(saved.text), "A rental payment preview must not claim actual contract registration");
  }
});

scenario("Every visa category checks out and retains the selected applicant count", () => {
  for (const visa of data.visas) {
    const ctx = fresh();
    const initial = action(ctx, { a: "visaFor", slug: visa.slug });
    if (visa.slug === "family") {
      equal(initial.widget?.t, "family", "Family visa needs dependant selection");
      action(ctx, { a: "family", family: ctx.family });
    } else equal(initial.widget?.t, "docs", `${visa.slug} must request supporting documents`);
    const documents = action(ctx, { a: "docs", slug: visa.slug });
    let submitted;
    if (visa.slug === "employment") submitted = documents;
    else {
      equal(documents.widget?.t, "channels", "Self-funded visa needs a submission channel");
      const checkout = action(ctx, { a: "channel", slug: visa.slug, id: data.visaChannels[0].id });
      equal(checkout.widget?.payment?.subject, visa.slug, "Visa checkout must preserve category");
      verify(!checkout.widget.payment.lines.some(([label, value]) => /medical|health insurance/i.test(label) && value > 0), "Visa preparation must not charge medical or insurance again before a separately paid screening/underwriting step");
      submitted = completePayment(ctx, checkout);
    }
    equal(submitted.receipt?.kind, "visa", "Visa submission must be saved");
    equal(submitted.receipt?.stage, 0, "New visa applications cannot begin approved");
    if (visa.slug === "employment") equal(submitted.receipt?.total, 0, "Employer-sponsored application cannot charge the employee");
    if (visa.slug === "family") verify(submitted.receipt.lines.some(([, value]) => value.includes("3")), "Family receipt must preserve the selected three dependants");
    const medical = action(ctx, { a: "medical", ref: submitted.receipt.ref });
    equal(medical.widget?.t, "centres", "Visa medical needs an approved screening-centre step");
    const centre = action(ctx, { a: "centre", ref: submitted.receipt.ref, id: data.centres[0].id });
    equal(centre.widget?.purpose, "medical", "Screening appointment must not become a general health appointment");
  }
});

scenario("Visa status cannot approve a missing application or skip medical attendance", () => {
  useFile.getState().reset();
  useFile.getState().act({ a: "update", ref: "ICP-missing" }, "Check an unknown file");
  verify(!useFile.getState().messages.at(-1)?.text.includes("under review"), "Unknown visa references cannot pretend to be under official review");
  useFile.getState().reset();
  useFile.getState().act({ a: "docs", slug: "employment" }, "Submit employer papers");
  const receipt = useFile.getState().receipts.find((item) => item.kind === "visa");
  verify(Boolean(receipt), "Employer flow creates a saved application");
  for (let i = 0; i < visaStages.length + 2; i++) useFile.getState().act({ a: "update", ref: receipt.ref }, "Check progress");
  const stage = useFile.getState().receipts.find((item) => item.ref === receipt.ref)?.stage;
  verify(stage <= 2, "Repeated status checks cannot complete a medical test or issue a visa");
  useFile.getState().act({ a: "centre", ref: receipt.ref, id: data.centres[0].id }, "Choose an adult screening centre");
  const slots = useFile.getState().messages.at(-1)?.widget;
  equal(slots?.t, "slots", "The selected medical centre needs an appointment preference");
  useFile.getState().act({ a: "slot", purpose: "medical", subject: receipt.ref, day: slots.days[0], time: "09:00", via: data.centres[0].name, price: data.centres[0].price }, "Save the screening preference");
  verify(useFile.getState().receipts.some((item) => item.kind === "medical" && item.lines.some(([label, value]) => label === "Visa application" && value === receipt.ref)), "Medical booking must point to its exact visa application");
  for (let i = 0; i < visaStages.length; i++) useFile.getState().act({ a: "update", ref: receipt.ref }, "Preview the remaining status steps");
  equal(useFile.getState().receipts.find((item) => item.ref === receipt.ref)?.stage, visaStages.length - 1, "The simulated route should finish after its required medical step");
  verify(/simulat|demo|preview/i.test(useFile.getState().messages.at(-1)?.text), "Final visa status must remain explicitly a simulation");
  verify(!/your residence visa is issued|your visa is approved/i.test(useFile.getState().messages.at(-1)?.text), "The demo cannot claim actual immigration approval");
  useFile.getState().reset();
});

scenario("Every origin, itinerary, hotel, and transfer preserves checkout amounts", () => {
  const flightIds = new Set();
  for (const city of data.cityNames) {
    const itineraries = data.flightsFrom(city);
    verify(itineraries.length > 0, `${city} needs flight estimates`);
    for (const flight of itineraries) {
      verify(!flightIds.has(flight.id), "Flight IDs cannot collide across origin cities");
      flightIds.add(flight.id);
      equal(data.flightById(flight.id)?.city, city, "Flight lookup must retain even multi-word origin cities");
      localImage(flight.image, flight.id);
      uniqueIds(`quotes for ${flight.id}`, flight.quotes);
      for (const quote of flight.quotes) {
        verify(quote.price > 0 && Number.isFinite(quote.price), "A flight estimate must be positive");
        const ctx = fresh();
        action(ctx, { a: "city", city });
        action(ctx, { a: "flight", id: flight.id, provider: quote.id, price: quote.price });
        verify(ctx.trip.flightLabel.includes(city) && ctx.trip.flightLabel.includes(quote.name), "Itinerary must preserve both city and selected provider");
        const hotel = data.hotels[0];
        const stay = hotel.quotes[0];
        action(ctx, { a: "hotel", id: hotel.id, provider: stay.id, price: stay.price });
        equal(ctx.trip.hotelTotal, stay.price * data.NIGHTS, "A nightly rate must be multiplied by the displayed stay length");
        const transfer = data.transfers[0];
        const checkout = action(ctx, { a: "pickup", id: transfer.id });
        equal(total(checkout.widget.payment), quote.price + stay.price * data.NIGHTS + transfer.price, "Travel checkout cannot drop or duplicate costs");
        const booked = completePayment(ctx, checkout);
        equal(booked.receipt?.kind, "trip", "Travel checkout creates a saved trip");
      }
    }
  }
  for (const hotel of data.hotels) for (const stay of hotel.quotes) for (const transfer of [...data.transfers, { id: "none", price: 0 }]) {
    const ctx = fresh();
    const city = data.cityNames[0];
    const flight = data.flightsFrom(city)[0];
    const quote = flight.quotes[0];
    action(ctx, { a: "city", city });
    action(ctx, { a: "flight", id: flight.id, provider: quote.id, price: quote.price });
    action(ctx, { a: "hotel", id: hotel.id, provider: stay.id, price: stay.price });
    const checkout = action(ctx, { a: "pickup", id: transfer.id });
    equal(total(checkout.widget.payment), quote.price + stay.price * data.NIGHTS + transfer.price, "Alternative hotels and transfers must preserve amounts");
    const booked = completePayment(ctx, checkout);
    if (transfer.id === "none") verify(!/pickup (?:is |are )?confirmed|flight, hotel, and pickup are confirmed/i.test(booked.text), "Choosing a taxi cannot confirm an unbooked pickup");
  }
});

scenario("Banks, school enquiries, and tax estimates create appropriate saved records", () => {
  for (const bank of data.banks) {
    const ctx = fresh();
    const next = action(ctx, { a: "bank", bank: bank.id });
    verify(["slots", "receipt"].includes(next.widget?.t), "Bank journey must offer appointment or digital onboarding guidance");
    if (bank.id === "wio") verify(next.widget?.t !== "slots", "A digital-only Wio account cannot book a fabricated branch appointment");
    if (next.widget.t === "slots") {
      const saved = action(ctx, { a: "slot", purpose: "bank", subject: bank.id, day: next.widget.days[0], time: "10:00" });
      equal(saved.receipt?.kind, "bank", "Bank appointment must be saved");
      verify(saved.receipt.lines.some(([, value]) => value.includes(bank.name)), "Bank receipt must name the selected bank");
    }
  }
  for (const school of data.schools) {
    const ctx = fresh();
    const enquiry = action(ctx, { a: "seat", id: school.id });
    equal(enquiry.receipt?.kind, "school", "School journey must save an admissions enquiry");
    verify(enquiry.receipt.lines.some(([, value]) => value.includes(school.name)), "School record must preserve the selected campus");
    verify(!/seat (?:is )?confirmed|place (?:is )?guaranteed/i.test(enquiry.text), "Admissions cannot guarantee an unassessed school place");
  }
  for (const income of ["salary", "business"]) for (const days of [90, 150, 220, 330]) {
    const ctx = fresh();
    const answer = action(ctx, { a: "tax", days, income });
    verify(!/home country probably keeps the right to tax you|certificate proves it to your home country/i.test(answer.text), "Day count cannot settle foreign tax obligations or treaty residence");
    if (answer.widget?.t === "filers") for (const filer of data.filers) {
      const checkout = action(ctx, { a: "filer", id: filer.id });
      const saved = completePayment(ctx, checkout);
      equal(saved.receipt?.kind, "tax", "Tax request must be saved");
    }
  }
});

scenario("Unknown inventory cannot silently become a different booking", () => {
  equal(data.flightsFrom("Not a seeded city"), [], "Unknown origins cannot fall back to London");
  equal(data.flightById("Not-a-flight"), undefined, "Unknown flight lookup must return undefined");
  const ctx = fresh();
  const invalid = [
    { a: "home", id: "missing" },
    { a: "flight", id: "missing", provider: "missing", price: 1 },
    { a: "hotel", id: "missing", provider: "missing", price: 1 },
    { a: "bank", bank: "missing" },
    { a: "seat", id: "missing" },
    { a: "centre", ref: "missing", id: "missing" },
    { a: "filer", id: "missing" },
    { a: "channel", slug: "family", id: "missing" },
  ];
  for (const request of invalid) {
    const result = action(ctx, request);
    verify(!result.receipt && !result.trip && !["pay", "slots", "hotels", "pickup"].includes(result.widget?.t), `${request.a} cannot progress a missing selection`);
  }
  const flight = data.flightsFrom(data.cityNames[0])[0];
  const hotel = data.hotels[0];
  for (const request of [
    { a: "flight", id: flight.id, provider: "missing", price: 1 },
    { a: "flight", id: flight.id, provider: flight.quotes[0].id, price: 1 },
    { a: "hotel", id: hotel.id, provider: "missing", price: 1 },
    { a: "hotel", id: hotel.id, provider: hotel.quotes[0].id, price: 1 },
  ]) {
    const result = action(ctx, request);
    verify(!result.trip && !["hotels", "pickup"].includes(result.widget?.t), "A changed or missing quote cannot progress with a fabricated price");
  }
});

scenario("Health plans produce filtered comparisons and quote enquiries, not coverage", () => {
  const { healthPlans, matchHealthPlans } = require("../lib/health-data.ts");
  uniqueIds("health plans", healthPlans);
  const profiles = [
    { emirate: "abu-dhabi", visa: "resident", age: 32, dependants: 0, income: "upTo5000", employerCover: "no", coverage: "uae", hospital: "none" },
    { emirate: "abu-dhabi", visa: "pending", age: 44, dependants: 3, income: "over5000", employerCover: "unknown", coverage: "international", hospital: "none" },
    { emirate: "dubai", visa: "resident", age: 68, dependants: 1, income: "over5000", employerCover: "yes", coverage: "uae", hospital: "none" },
  ];
  equal(action(fresh(), { a: "topic", topic: "health" }).widget?.t, "healthProfile", "Health starts with eligibility and needs");
  for (const profile of profiles) {
    const ctx = fresh();
    const results = action(ctx, { a: "healthPlans", profile });
    equal(results.widget?.t, "healthPlans", "Health profile must produce plan comparisons");
    const matches = matchHealthPlans(profile);
    const plans = Array.isArray(matches) ? matches : matches.plans;
    verify(Array.isArray(plans), "Health filtering must return plan options");
    if (profile.income === "upTo5000" || profile.emirate !== "abu-dhabi" || profile.employerCover !== "no") verify(!plans.some((plan) => (typeof plan === "string" ? plan : plan.id) === "daman-flexi"), "A restricted Flexi plan must not appear for an ineligible household");
    if (profile.coverage === "international") verify(plans.every((plan) => (typeof plan === "string" ? healthPlans.find((item) => item.id === plan) : plan)?.international), "An international request cannot show UAE-only cover as a match");
    for (const candidate of plans) {
      const plan = typeof candidate === "string" ? healthPlans.find((item) => item.id === candidate) : candidate;
      verify(Boolean(plan), "Every filtered health result must point to an existing plan");
      equal(action(ctx, { a: "healthPlan", id: plan.id, profile }).widget?.t, "healthPlan", "Health selection should show coverage before enquiry");
      const enquiry = action(ctx, { a: "healthQuote", id: plan.id, profile });
      equal(enquiry.receipt?.kind, "health", "Health quote request must be saved");
      verify(!/policy (?:is )?active|coverage (?:is )?confirmed|insured (?:now|today)/i.test(enquiry.text), "A quote enquiry cannot activate health insurance");
      verify(!enquiry.widget?.payment, "Health coverage must not be charged before underwriting and a quote");
    }
  }
  equal(matchHealthPlans({ ...profiles[0], visa: "visitor" }), [], "Visitors must not be presented resident policy options");
  for (const request of [
    { a: "healthPlans", profile: { ...profiles[0], age: -1 } },
    { a: "healthPlan", id: "missing", profile: profiles[0] },
    { a: "healthQuote", id: "missing", profile: profiles[0] },
  ]) {
    const result = action(fresh(), request);
    verify(!result.receipt && !["healthPlans", "healthPlan"].includes(result.widget?.t), "Invalid health selections cannot create a quote enquiry");
  }
});

scenario("Sarah’s prompt preserves the full family brief and gates assessment on documents", () => {
  const { SARAH_PROMPT, isSarahPrompt, runSarahDemo, sarahDemoAction, sarahSampleDocuments, sarahQuote } = require("../lib/sarah-demo.ts");
  const { validateProfile } = require("../lib/ai/validation.ts");
  for (const prompt of [SARAH_PROMPT, SARAH_PROMPT.replace("Sarah", "Sara").toUpperCase(), "Hi , I am Sarah I am moving to Abu Dhabi in December I have 2 children that need to go school year 6 and year 10&#xA0; We use French as a second language , my husband is an engineer and need a job"]) {
    verify(isSarahPrompt(prompt), "Original, Sara spelling, capitalization and HTML whitespace must trigger the family scenario");
    const first = runSarahDemo([{ role: "you", text: prompt }], {});
    equal(first.widget?.t, "sarahDocuments", "Full relocation prompt must open the assessment, not just schools");
    equal(first.family, { spouse: true, kids: 2, parents: 0 }, "Family count must be stored from Sarah’s brief");
    equal(validateProfile(first.profile).sarahDemoStage, "documents", "API validation must preserve scenario state");
    verify(/French as a second language/.test(first.text) && /engineering job search/.test(first.text), "Both language and career priorities must appear in the initial answer");
    const early = sarahDemoAction({ a: "sarahDemo", stage: "quote" }, first.profile);
    equal(early.widget?.t, "sarahDocuments", "A final quotation cannot bypass assessment");
    const partial = sarahDemoAction({ a: "sarahDemo", stage: "assessment", documents: sarahSampleDocuments.filter((doc) => doc.group === "identity") }, first.profile);
    equal(partial.profile.sarahDemoStage, "documents", "An identity-only upload cannot complete all five groups");
    verify(/School records/.test(partial.text), "Incomplete assessment must say what is missing");
    for (const text of ["I have not uploaded documents", "I uploaded only my passport documents", "Have I uploaded all documents?"]) {
      equal(runSarahDemo([{ role: "you", text }], first.profile).profile.sarahDemoStage, "documents", "Negative, partial and question uploads cannot claim a complete assessment");
    }
    const result = sarahDemoAction({ a: "sarahDemo", stage: "assessment", documents: sarahSampleDocuments }, first.profile);
    equal(result.profile.sarahDemoStage, "assessed", "Five complete document groups unlock the assessment");
    equal(result.widget?.t, "sarahQuote", "Assessment ends in the itemized quotation");
    verify(/not facts extracted/.test(result.text), "Selecting files cannot imply actual content analysis");
    verify(/Year 10 transfer/.test(result.text) && /French as a second language/.test(result.text), "Assessment must retain the critical school transition and language needs");
    verify(/No vacancy, interview or offer is reserved/.test(result.text), "Career planning cannot invent a job offer");
    equal(runSarahDemo([{ role: "you", text: "What is the price?" }], result.profile).widget?.t, "sarahQuote", "Follow-up quote requests must retain the assessed context");
    equal(runSarahDemo([{ role: "you", text: "Show the documents" }], result.profile).profile.sarahDemoStage, "assessed", "Reopening the checklist must not lose the completed assessment");
  }
  equal(runSarahDemo([{ role: "you", text: "Find a school for Year 6" }], {}), null, "Other users must retain ordinary school routing");
  equal(sarahQuote.lines.reduce((sum, [, amount]) => sum + amount, 0), sarahQuote.subtotal, "Itemized quotation must reconcile with its subtotal");
  equal(sarahQuote.subtotal + sarahQuote.tax, sarahQuote.total, "Tax and total must reconcile");
  equal(sarahQuote.tax, sarahQuote.subtotal * 0.05, "Illustrative VAT must be calculated correctly");
});

scenario("Sarah’s multi-turn scenario works through the persisted chat store in both modes", () => {
  const { SARAH_PROMPT, sarahSampleDocuments } = require("../lib/sarah-demo.ts");
  for (const mode of ["demo", "ai"]) {
    useFile.getState().reset();
    useFile.getState().setChatMode(mode);
    void useFile.getState().ask(SARAH_PROMPT);
    equal(useFile.getState().messages.at(-1)?.widget?.t, "sarahDocuments", `${mode} chat must recognize Sarah’s full prompt`);
    equal(useFile.getState().family.kids, 2, "The persisted family must have two children");
    useFile.getState().act({ a: "sarahDemo", stage: "assessment", documents: sarahSampleDocuments }, "I uploaded my sample documents");
    equal(useFile.getState().profile.sarahDemoStage, "assessed", "Store must remember the document step");
    void useFile.getState().ask("Can you help my husband find an engineering job?");
    verify(/fictional David Martin/.test(useFile.getState().messages.at(-1)?.text), "Follow-up job request must keep Sarah’s assessed context");
    void useFile.getState().ask("Show the final quotation");
    equal(useFile.getState().messages.at(-1)?.widget?.t, "sarahQuote", "Final quotation must render in either chat mode");
    equal(useFile.getState().receipts.length, 0, "A mock quotation must not create bookings or payments");
    useFile.getState().reset();
    equal(useFile.getState().profile.sarahDemoStage, undefined, "Reset must clear the demo scenario");
  }
  useFile.getState().setChatMode("demo");
});

console.log(`\n${scenarios - failures.length}/${scenarios} scenarios passed; ${checks} checks.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
