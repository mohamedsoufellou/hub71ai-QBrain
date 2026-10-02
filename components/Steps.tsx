"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Check as CheckIcon,
  Circle,
  FileText,
  MapPin,
  Minus,
  Plane,
  Plus,
} from "lucide-react";
import { PartnerLogo } from "./PartnerLogo";
import { SarahDocuments, SarahQuote } from "./SarahDemo";
import { Button, Check, Tabs } from "./ui";
import {
  banks,
  centres,
  cityNames,
  filers,
  flightsFrom,
  homeQuotes,
  hotels,
  listingById,
  schools,
  transfers,
  visaBySlug,
  visaChannels,
} from "@/lib/data";
import { total, visaStages } from "@/lib/flow";
import { aed } from "@/lib/format";
import { healthDocuments, healthHospitals, healthPlanById, matchHealthPlans, validHealthProfile } from "@/lib/health-data";
import { useFile } from "@/lib/store";
import { SEED_DATA_NOTE, sourceForSeed } from "@/lib/source-data";
import type { Action, Family, HealthProfile, Income, Listing, Payment, Quote, Topic, Widget } from "@/lib/types";

type Act = (action: Action, label: string) => void;

function DataSources({ ids }: { ids: string[] }) {
  const sources = [...new Map(ids.flatMap((id) => {
    const source = sourceForSeed(id);
    return source ? [[source.url, source] as const] : [];
  })).values()];
  if (!sources.length) return null;
  return (
    <details className="wu-source">
      <summary className="wu-note">Data and sources</summary>
      <ul className="wu-list">
        {sources.map((source) => <li key={source.url}>
          <span className="wu-list__body">
            <a className="hal-text" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
            <span className="wu-note">{source.scope}</span>
          </span>
        </li>)}
      </ul>
    </details>
  );
}

function Ledger({ lines }: { lines: [string, number][] }) {
  return (
    <ul className="wu-list wu-ledger">
      {lines.map(([label, amount]) => (
        <li key={label}>
          <span className="wu-list__body hal-text">{label}</span>
          <span className="wu-amount">{amount === 0 ? "Included" : aed(amount)}</span>
        </li>
      ))}
    </ul>
  );
}

const services: { topic: Topic; title: string; detail: string; image: string }[] = [
  { topic: "home", title: "Find a home", detail: "Compare homes and plan a viewing", image: "/photos/saadiyat-garden.jpg" },
  { topic: "visa", title: "Get a visa", detail: "Check your route, documents and next steps", image: "/photos/papers.jpg" },
  { topic: "arrive", title: "Plan travel", detail: "Flights, a first stay and airport transport", image: "/photos/flight-day.jpg" },
  { topic: "health", title: "Find health cover", detail: "Compare real insurance products and prepare a quote request", image: "/photos/health-hero.png" },
  { topic: "bank", title: "Open a bank account", detail: "Compare requirements and account options", image: "/photos/office.jpg" },
  { topic: "school", title: "Find a school", detail: "Compare curricula, published fees and admissions", image: "/photos/school-hero.png" },
  { topic: "tax", title: "Check tax", detail: "Understand the residency and registration questions", image: "/photos/tax.jpg" },
];

function Menu({ act }: { act: Act }) {
  return (
    <div className="wu-stack">
    <p className="wu-note">{SEED_DATA_NOTE}</p>
    <div className="wu-cards">
      {services.map((s) => (
        <button key={s.topic} type="button" className="hal-card wu-pick" onClick={() => act({ a: "topic", topic: s.topic }, s.title)}>
          <Photo src={s.image} />
          <span className="wu-pick__title">{s.title}</span>
          <span className="hal-text">{s.detail}</span>
        </button>
      ))}
    </div>
    </div>
  );
}

function Photo({ src, label }: { src: string; label?: string }) {
  return (
    <span className="wu-photo-frame">
      <Image src={src} alt="" fill sizes="(max-width: 860px) 92vw, 720px" />
      {label ? <span className="hal-glass">{label}</span> : null}
    </span>
  );
}

function HomePick({ listing, onPick }: { listing: Listing; onPick: () => void }) {
  return (
    <button type="button" className="hal-studio-card wu-pick-card" onClick={onPick}>
      <Photo src={listing.image} label={`${listing.beds} ${listing.beds === 1 ? "room" : "rooms"}`} />
      <span className="hal-studio-card__body">
        <span className="hal-studio-card__name">{listing.title}</span>
        <span className="hal-studio-card__meta">
          <MapPin className="hal-icon hal-icon--sm" aria-hidden />
          {listing.area}, from {aed(Math.min(...homeQuotes(listing).map((quote) => quote.price)))}
          {listing.kind === "rent" ? " a year" : ""}
        </span>
      </span>
    </button>
  );
}

function Homes({ ids, act }: { ids: string[]; act: Act }) {
  return (
    <div className="wu-stack">
    <div className="wu-grid">
      {ids.map((id) => {
        const listing = listingById(id);
        return listing ? (
          <HomePick key={id} listing={listing} onPick={() => act({ a: "home", id }, `${listing.title}, ${listing.area}`)} />
        ) : null;
      })}
    </div>
    <DataSources ids={ids} />
    </div>
  );
}

function PartnerBody({ quote, suggested = false }: { quote: Quote; suggested?: boolean }) {
  const detail = quote.note;
  return (
    <span className="wu-list__body">
      <span className="wu-partner-name">
        <PartnerLogo id={quote.id} />
        <span className="wu-list__title">{quote.name}</span>
      </span>
      <span className="wu-note">
        {suggested ? "Suggested · " : ""}
        {quote.role} · {quote.turnaround}
      </span>
      {detail ? <span className="hal-text">{detail}</span> : null}
      <span className="hal-text">{quote.review}</span>
    </span>
  );
}

function Home({ id, act }: { id: string; act: Act }) {
  const home = listingById(id);
  if (!home) return null;
  return (
    <div className="hal-card wu-panel">
      <Photo src={home.image} label={home.furnished ? "Furnished" : "Unfurnished"} />
      <dl className="wu-facts">
        <div>
          <dt>Rooms</dt>
          <dd>
            {home.beds} and {home.baths} baths
          </dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{home.sqm} m²</dd>
        </div>
        <div>
          <dt>Nearest school</dt>
          <dd>{home.schoolKm} km</dd>
        </div>
      </dl>
      <ul className="wu-list">
        {homeQuotes(home).map((quote, index) => (
          <li key={quote.id}>
            <PartnerBody quote={quote} suggested={index === 0} />
            <span className="wu-amount">
              {aed(quote.price)}
              {home.kind === "rent" ? " a year" : ""}
            </span>
            <Button
              size="xs"
              onClick={() =>
                act(
                  home.kind === "rent"
                    ? { a: "lease", id, provider: quote.name, price: quote.price }
                    : { a: "viewing", id, provider: quote.name, price: quote.price },
                  `${quote.name}, ${aed(quote.price)}`,
                )
              }
            >
              {home.kind === "rent" ? "Rent" : "View"}
            </Button>
            {home.kind === "rent" ? (
              <Button size="xs" onClick={() => act({ a: "viewing", id, provider: quote.name, price: quote.price }, `Viewing via ${quote.name}`)}>
                Viewing
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <DataSources ids={[id]} />
    </div>
  );
}

const times = ["09:00", "11:00", "13:30", "15:00"];

function Slots({ widget, act }: { widget: Extract<Widget, { t: "slots" }>; act: Act }) {
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  return (
    <div className="hal-card wu-panel">
      <p className="wu-note">Example appointment slots. The provider must confirm availability.</p>
      <div className="wu-choices" role="group" aria-label="Day">
        {widget.days.map((d) => (
          <button key={d} type="button" className="hal-chip" aria-pressed={day === d} onClick={() => setDay(d)}>
            {d}
          </button>
        ))}
      </div>
      <div className="wu-choices" role="group" aria-label="Time">
        {times.map((t) => (
          <button key={t} type="button" className="hal-chip" aria-pressed={time === t} onClick={() => setTime(t)}>
            {t}
          </button>
        ))}
      </div>
      <div>
        <Button
          variant="primary"
          disabled={!day || !time}
          onClick={() =>
            act(
              { a: "slot", purpose: widget.purpose, subject: widget.subject, day, time, via: widget.via, price: widget.price },
              `${day} at ${time}`,
            )
          }
        >
          {day && time ? `Confirm ${day}, ${time}` : "Pick a day and a time"}
        </Button>
      </div>
    </div>
  );
}

function Lease({ id, provider, price, act }: { id: string; provider: string; price: number; act: Act }) {
  const home = listingById(id);
  const [cheques, setCheques] = useState<"1" | "2" | "4">("4");
  if (!home) return null;
  const n = Number(cheques);
  const lines: [string, number][] = [
    [n === 1 ? "Rent for the year" : `First of ${n} rent cheques`, Math.round(price / n)],
    ["Security deposit estimate, 5%", Math.round(price * 0.05)],
    ["Broker fee estimate, 5%", Math.round(price * 0.05)],
    ["Tawtheeq registration estimate", 200],
  ];
  const payment: Payment = { for: "lease", title: "Move-in costs", subject: id, via: provider, lines };
  return (
    <div className="hal-card wu-panel">
      <p className="wu-note">Illustrative move-in budget. Deposit, brokerage, VAT and registration charges depend on the signed agreement; confirm the written quote.</p>
      <Tabs
        label="Rent cheques"
        value={cheques}
        onChange={setCheques}
        options={[
          { value: "1", label: "1 cheque" },
          { value: "2", label: "2 cheques" },
          { value: "4", label: "4 cheques" },
        ]}
      />
      <Ledger lines={lines} />
      <p className="wu-sum">
        <span className="hal-text">Due today</span>
        <span className="wu-sum__value">{aed(total(payment))}</span>
      </p>
      <div>
        <Button variant="primary" onClick={() => act({ a: "pay", payment }, `Rent it with ${n} ${n === 1 ? "cheque" : "cheques"}`)}>
          Continue to payment
        </Button>
      </div>
    </div>
  );
}

function Pay({ payment, act }: { payment: Payment; act: Act }) {
  const [busy, setBusy] = useState(false);
  const amount = aed(total(payment));
  return (
    <form
      className="hal-card wu-panel"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        window.setTimeout(() => act({ a: "paid", payment }, `Paid ${amount}`), 1100);
      }}
    >
      <h3 className="wu-panel__title">{payment.title}</h3>
      <p className="wu-note">Demo checkout. No payment is collected and no booking or government application is sent.</p>
      <Ledger lines={payment.lines} />
      <p className="wu-sum">
        <span className="hal-text">Total</span>
        <span className="wu-sum__value">{amount}</span>
      </p>
      <div className="wu-card-fields">
        <label className="wu-field wu-field--wide">
          Card number
          <input className="hal-input" defaultValue="4242 4242 4242 4242" inputMode="numeric" autoComplete="off" />
        </label>
        <label className="wu-field">
          Expiry
          <input className="hal-input" defaultValue="12/29" autoComplete="off" />
        </label>
        <label className="wu-field">
          CVC
          <input className="hal-input" defaultValue="123" inputMode="numeric" autoComplete="off" />
        </label>
      </div>
      <div>
        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? "Paying" : `Pay ${amount}`}
        </Button>
      </div>
    </form>
  );
}

function ReceiptCard({ refId }: { refId: string }) {
  const receipt = useFile((s) => s.receipts.find((r) => r.ref === refId));
  if (!receipt) return null;
  const stage = receipt.stage ?? 0;
  return (
    <div className="hal-card wu-panel wu-receipt">
      <div className="wu-receipt__head">
        <CheckIcon className="hal-icon hal-icon--sm" aria-hidden />
        <span className="hal-text">Reference {receipt.ref}</span>
      </div>
      <h3 className="wu-panel__title">{receipt.title}</h3>
      <dl className="wu-pairs">
        {receipt.lines.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {receipt.kind === "visa" ? (
        <ol className="wu-track">
          {visaStages.map((name, i) => (
            <li key={name} data-state={i < stage || stage === visaStages.length - 1 ? "done" : i === stage ? "now" : "next"}>
              {i < stage || stage === visaStages.length - 1 ? (
                <CheckIcon className="hal-icon hal-icon--sm" aria-hidden />
              ) : (
                <Circle className="hal-icon hal-icon--sm" aria-hidden />
              )}
              {name}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

const visaChoices = [
  { slug: "employment", title: "Me, I have a job offer", detail: "Your employer sponsors you", image: "/photos/office.jpg" },
  { slug: "family", title: "My family", detail: "Spouse, children, or parents", image: "/photos/family.jpg" },
  { slug: "freelance", title: "Me, I work for myself", detail: "A work permit or licence, separate from residence", image: "/photos/freelance.jpg" },
  { slug: "green", title: "Check Green residence", detail: "Five-year route with category-specific eligibility", image: "/photos/office.jpg" },
  { slug: "golden", title: "I am investing or buying property", detail: "Ten-year golden residence", image: "/photos/saadiyat-villa.jpg" },
  { slug: "investor", title: "I own a company here", detail: "Partner or investor visa", image: "/photos/maryah.jpg" },
];

function VisaPick({ act }: { act: Act }) {
  return (
    <div className="wu-cards">
      {visaChoices.map((v) => (
        <button key={v.slug} type="button" className="hal-card wu-pick" onClick={() => act({ a: "visaFor", slug: v.slug }, v.title)}>
          <Photo src={v.image} />
          <span className="wu-pick__title">{v.title}</span>
          <span className="hal-text">{v.detail}</span>
        </button>
      ))}
    </div>
  );
}

function Stepper({ label, value, onChange, max = 6 }: { label: string; value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div className="wu-stepper">
      <span className="hal-text">{label}</span>
      <Button size="xs" label={`Fewer ${label.toLowerCase()}`} disabled={value === 0} onClick={() => onChange(value - 1)}>
        <Minus className="hal-icon hal-icon--xs" aria-hidden />
      </Button>
      <span className="wu-stepper__value">{value}</span>
      <Button size="xs" label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="hal-icon hal-icon--xs" aria-hidden />
      </Button>
    </div>
  );
}

function describe(f: Family) {
  const parts = [
    f.spouse ? "my spouse" : "",
    f.kids ? `${f.kids} ${f.kids === 1 ? "child" : "children"}` : "",
    f.parents ? `${f.parents} ${f.parents === 1 ? "parent" : "parents"}` : "",
  ].filter(Boolean);
  const text = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0] ?? "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function FamilyStep({ act }: { act: Act }) {
  const saved = useFile((s) => s.family);
  const [family, setFamily] = useState<Family>(saved);
  const nobody = !family.spouse && family.kids === 0 && family.parents === 0;
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/family.jpg" />
      <Check checked={family.spouse} onChange={() => setFamily({ ...family, spouse: !family.spouse })}>
        <span className="hal-text">My spouse</span>
      </Check>
      <Stepper label="Children" value={family.kids} onChange={(kids) => setFamily({ ...family, kids })} />
      <Stepper label="Parents" value={family.parents} max={2} onChange={(parents) => setFamily({ ...family, parents })} />
      <div>
        <Button variant="primary" disabled={nobody} onClick={() => act({ a: "family", family }, describe(family))}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function Docs({ slug, act }: { slug: string; act: Act }) {
  const visa = visaBySlug(slug);
  const family = useFile((state) => state.family);
  const [files, setFiles] = useState<Record<number, string>>({});
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  if (!visa) return null;
  const documents = visa.documents
    .filter((document) => slug !== "family" || (!/marriage/i.test(document) || family.spouse) && (!/birth/i.test(document) || family.kids > 0))
    .filter((document) => !/medical|screening|Later, the residence/i.test(document))
    .concat(visa.documents.some((document) => /photographs.*medical/i.test(document)) ? ["Passport-style photograph as requested"] : [])
    .concat(slug === "family" && family.parents > 0 ? ["Parent relationship evidence and the sponsor documents requested by ICP"] : []);
  const done = documents.every((_, i) => files[i]);
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/papers.jpg" />
      <p className="wu-note">Preview a document checklist. Sample files contain no personal data; attached file names stay in this demo and are not sent to an authority. Medical fitness results belong to the later adult screening step.</p>
      <ul className="wu-list">
        {documents.map((doc, i) => (
          <li key={doc}>
            {files[i] ? <CheckIcon className="hal-icon hal-icon--sm" aria-hidden /> : <FileText className="hal-icon hal-icon--sm" aria-hidden />}
            <span className="wu-list__body">
              <span className="hal-text">{doc}</span>
              {files[i] ? <span className="wu-note">{files[i]}</span> : null}
            </span>
            <input
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="file"
              accept="application/pdf,image/*"
              className="hal-hidden-visually"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFiles((f) => ({ ...f, [i]: file.name }));
              }}
            />
            <Button size="xs" onClick={() => inputs.current[i]?.click()}>
              {files[i] ? "Replace" : "Attach"}
            </Button>
          </li>
        ))}
      </ul>
      <div className="wu-actions">
        <Button variant="primary" disabled={!done} onClick={() => act({ a: "docs", slug }, `${documents.length} demo documents ready`)}>
          Continue with checklist
        </Button>
        {!done ? (
          <Button
            variant="ghost"
            onClick={() =>
              setFiles(Object.fromEntries(documents.map((d, i) => [i, `${d.split(/[ ,]/)[0].toLowerCase()}-sample.pdf`])))
            }
          >
            Use sample files
          </Button>
        ) : null}
      </div>
      <DataSources ids={[slug]} />
    </div>
  );
}

const stays = [
  { days: 90, label: "About 3 months" },
  { days: 150, label: "About 5 months" },
  { days: 220, label: "Most of the year" },
  { days: 330, label: "All year" },
];

function Tax({ act }: { act: Act }) {
  const [days, setDays] = useState<number | null>(null);
  const [income, setIncome] = useState<Income | null>(null);
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/tax.jpg" />
      <p className="wu-question">How long will you be in the UAE this year?</p>
      <div className="wu-choices">
        {stays.map((s) => (
          <button key={s.days} type="button" className="hal-chip" aria-pressed={days === s.days} onClick={() => setDays(s.days)}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="wu-question">Where does your money come from?</p>
      <div className="wu-choices">
        <button type="button" className="hal-chip" aria-pressed={income === "salary"} onClick={() => setIncome("salary")}>
          A salary
        </button>
        <button type="button" className="hal-chip" aria-pressed={income === "business"} onClick={() => setIncome("business")}>
          My own business
        </button>
      </div>
      <div>
        <Button
          variant="primary"
          disabled={days === null || !income}
          onClick={() =>
            days !== null &&
            income &&
            act({ a: "tax", days, income }, `${stays.find((s) => s.days === days)?.label}, ${income === "salary" ? "a salary" : "my own business"}`)
          }
        >
          Show my answer
        </Button>
      </div>
    </div>
  );
}

function Banks({ act }: { act: Act }) {
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/office.jpg" />
      <ul className="wu-list">
        {banks.map((bank, index) => (
          <li key={bank.id}>
            <PartnerBody quote={bank} suggested={index === 0} />
            <Button size="xs" onClick={() => act({ a: "bank", bank: bank.id }, bank.name)}>
              {bank.id === "wio" ? "Open digitally" : "Plan visit"}
            </Button>
          </li>
        ))}
      </ul>
      <DataSources ids={banks.map((bank) => bank.id)} />
    </div>
  );
}

function Cities({ act }: { act: Act }) {
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/city.jpg" />
      <div className="wu-choices">
      {cityNames.map((city) => (
        <button key={city} type="button" className="hal-chip" onClick={() => act({ a: "city", city }, `From ${city}`)}>
          {city}
        </button>
      ))}
      </div>
    </div>
  );
}

function Flights({ city, act }: { city: string; act: Act }) {
  return (
    <div className="wu-stack">
      {flightsFrom(city).map((flight) => (
        <div key={flight.id} className="hal-card wu-panel">
          <Photo src={flight.image} label={flight.stops} />
          <p className="wu-offer__title">
            <Plane className="hal-icon hal-icon--sm" aria-hidden />
            {flight.code}, departs {flight.depart}
          </p>
          <p className="wu-note">
            {flight.stops}, {flight.duration}
          </p>
          <ul className="wu-list">
            {flight.quotes.map((quote, index) => (
              <li key={quote.id}>
                <PartnerBody quote={quote} suggested={index === 0} />
                <span className="wu-amount">{aed(quote.price)}</span>
                <Button size="xs" onClick={() => act({ a: "flight", id: flight.id, provider: quote.id, price: quote.price }, `${flight.code} on ${quote.name}`)}>
                  Choose
                </Button>
              </li>
            ))}
          </ul>
          <DataSources ids={[flight.id]} />
        </div>
      ))}
    </div>
  );
}

function Hotels({ act }: { act: Act }) {
  return (
    <div className="wu-stack">
      {hotels.map((hotel) => (
        <div key={hotel.id} className="hal-card wu-panel">
          <Photo src={hotel.image} label={hotel.area} />
          <p className="wu-offer__title">{hotel.name}</p>
          <p className="hal-text">{hotel.note}</p>
          <ul className="wu-list">
            {hotel.quotes.map((quote, index) => (
              <li key={quote.id}>
                <PartnerBody quote={quote} suggested={index === 0} />
                <span className="wu-amount">{aed(quote.price)} a night</span>
                <Button size="xs" onClick={() => act({ a: "hotel", id: hotel.id, provider: quote.id, price: quote.price }, `${hotel.name} on ${quote.name}`)}>
                  Choose
                </Button>
              </li>
            ))}
          </ul>
          <DataSources ids={[hotel.id]} />
        </div>
      ))}
    </div>
  );
}

function Pickup({ act }: { act: Act }) {
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/transfer.jpg" />
      <ul className="wu-list">
        {transfers.map((transfer, index) => (
          <li key={transfer.id}>
            <PartnerBody quote={transfer} suggested={index === 0} />
            <span className="wu-amount">{aed(transfer.price)}</span>
            <Button size="xs" onClick={() => act({ a: "pickup", id: transfer.id }, transfer.name)}>
              Choose
            </Button>
          </li>
        ))}
      </ul>
      <div>
        <Button variant="ghost" onClick={() => act({ a: "pickup", id: "none" }, "No transfer")}>
          I will take a taxi
        </Button>
      </div>
      <DataSources ids={transfers.map((transfer) => transfer.id)} />
    </div>
  );
}

function Channels({ slug, act }: { slug: string; act: Act }) {
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/papers.jpg" />
      <ul className="wu-list">
        {visaChannels.map((channel, index) => (
          <li key={channel.id}>
            <PartnerBody quote={channel} suggested={index === 0} />
            <span className="wu-amount">{channel.price === 0 ? "No fee" : `${aed(channel.price)} each`}</span>
            <Button size="xs" onClick={() => act({ a: "channel", slug, id: channel.id }, channel.name)}>
              File here
            </Button>
          </li>
        ))}
      </ul>
      <DataSources ids={[slug]} />
    </div>
  );
}

function Centres({ refId, act }: { refId: string; act: Act }) {
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/medical.jpg" />
      <ul className="wu-list">
        {centres.map((centre, index) => (
          <li key={centre.id}>
            <PartnerBody quote={centre} suggested={index === 0} />
            <span className="wu-amount">{aed(centre.price)}</span>
            <Button size="xs" onClick={() => act({ a: "centre", ref: refId, id: centre.id }, centre.name)}>
              Book
            </Button>
          </li>
        ))}
      </ul>
      <DataSources ids={[...centres.map((centre) => centre.id), "visa-medical-age"]} />
    </div>
  );
}

function Filers({ act }: { act: Act }) {
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/tax.jpg" />
      <ul className="wu-list">
        {filers.map((filer, index) => (
          <li key={filer.id}>
            <PartnerBody quote={filer} suggested={index === 0} />
            <span className="wu-amount">{aed(filer.price)}</span>
            <Button size="xs" onClick={() => act({ a: "filer", id: filer.id }, filer.name)}>
              File here
            </Button>
          </li>
        ))}
      </ul>
      <DataSources ids={filers.map((filer) => filer.id).concat("tax-residency")} />
    </div>
  );
}

const curricula = ["all", ...new Set(schools.map((school) => school.curriculum))];

function Schools({ initial, act }: { initial: string; act: Act }) {
  const [curriculum, setCurriculum] = useState(curricula.includes(initial) ? initial : "all");
  const list = schools.filter((s) => curriculum === "all" || s.curriculum === curriculum);
  return (
    <div className="hal-card wu-panel">
      <Photo src="/photos/school-hero.png" />
      <Tabs
        label="Curriculum"
        value={curriculum}
        onChange={setCurriculum}
        options={curricula.map((c) => ({ value: c, label: c === "all" ? "All" : c === "International Baccalaureate" ? "IB" : c }))}
      />
      <ul className="wu-list">
        {list.map((s) => (
          <li key={s.id}>
            <span className="wu-list__body">
              <span className="wu-partner-name">
                <PartnerLogo id={s.id} />
                <span className="wu-list__title">{s.name}</span>
              </span>
              <span className="wu-note">
                Provider · {s.turnaround}
              </span>
              <span className="hal-text">
                {s.area}, {s.curriculum}, {s.fees}
              </span>
              <span className="hal-text">{s.review}</span>
            </span>
            <Button size="xs" onClick={() => act({ a: "seat", id: s.id }, `A seat at ${s.name}`)}>
              Prepare enquiry
            </Button>
          </li>
        ))}
      </ul>
      <DataSources ids={list.map((school) => school.id)} />
    </div>
  );
}

function HealthDetails({ act }: { act: Act }) {
  const [profile, setProfile] = useState<HealthProfile>({
    emirate: "abu-dhabi", visa: "pending", age: 32, dependants: 0,
    income: "over5000", employerCover: "unknown", coverage: "uae", hospital: "none",
  });
  function update<K extends keyof HealthProfile>(key: K, value: HealthProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }
  return (
    <form className="hal-card wu-panel" onSubmit={(event) => {
      event.preventDefault();
      if (validHealthProfile(profile)) act({ a: "healthPlans", profile }, "Compare health cover for my move");
    }}>
      <h3 className="wu-panel__title">Cover that fits your move</h3>
      <p className="hal-text">Start with your residence and existing cover. The insurer confirms eligibility, the hospital network and your final premium.</p>
      <div className="wu-card-fields wu-health-fields">
        <label className="wu-field">Visa emirate
          <select className="hal-input" value={profile.emirate} onChange={(event) => update("emirate", event.target.value as HealthProfile["emirate"])}>
            <option value="abu-dhabi">Abu Dhabi</option><option value="dubai">Dubai</option><option value="other">Another emirate</option>
          </select>
        </label>
        <label className="wu-field">Residence status
          <select className="hal-input" value={profile.visa} onChange={(event) => update("visa", event.target.value as HealthProfile["visa"])}>
            <option value="pending">Residence in progress</option><option value="resident">UAE resident</option><option value="visitor">Visitor</option>
          </select>
        </label>
        <label className="wu-field">Your age
          <input className="hal-input" type="number" min="18" max="100" required value={profile.age} onChange={(event) => update("age", Number(event.target.value))} />
        </label>
        <label className="wu-field">Additional family members
          <input className="hal-input" type="number" min="0" max="6" required value={profile.dependants} onChange={(event) => update("dependants", Number(event.target.value))} />
        </label>
        <label className="wu-field">Monthly income
          <select className="hal-input" value={profile.income} onChange={(event) => update("income", event.target.value as HealthProfile["income"])}>
            <option value="over5000">Above AED 5,000</option><option value="upTo5000">AED 5,000 or below</option>
          </select>
        </label>
        <label className="wu-field">Covered by an employer?
          <select className="hal-input" value={profile.employerCover} onChange={(event) => update("employerCover", event.target.value as HealthProfile["employerCover"])}>
            <option value="unknown">I need to check</option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
        <label className="wu-field">Where do you need cover?
          <select className="hal-input" value={profile.coverage} onChange={(event) => update("coverage", event.target.value as HealthProfile["coverage"])}>
            <option value="uae">Within the UAE</option><option value="international">International options</option>
          </select>
        </label>
        <label className="wu-field">Hospital to check
          <select className="hal-input" value={profile.hospital} onChange={(event) => update("hospital", event.target.value)}>
            <option value="none">No preference</option>
            {healthHospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
          </select>
        </label>
      </div>
      <div><Button type="submit" variant="primary" disabled={!validHealthProfile(profile)}>Compare cover</Button></div>
    </form>
  );
}

function HealthPlans({ profile, act }: { profile: HealthProfile; act: Act }) {
  return (
    <div className="wu-stack">
      {matchHealthPlans(profile).map((plan) => (
        <div className="hal-card wu-panel" key={plan.id}>
          <p className="wu-note">{plan.insurer}</p>
          <h3 className="wu-panel__title">{plan.name}</h3>
          <dl className="wu-pairs">
            <div><dt>Area of cover</dt><dd>{plan.area}</dd></div>
            <div><dt>Annual benefit limit</dt><dd>{plan.annualLimit}</dd></div>
            <div><dt>Premium</dt><dd>{plan.premium}</dd></div>
          </dl>
          <p className="hal-text">{plan.detail}</p>
          <div className="wu-choices">
            <Button onClick={() => act({ a: "healthPlan", id: plan.id, profile }, `View ${plan.insurer} ${plan.name}`)}>View cover</Button>
            {plan.source ? <a href={plan.source} target="_blank" rel="noopener noreferrer" className="hal-btn hal-btn--ghost">Official benefits</a> : <span className="hal-note">Fictional simulation benefits</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function HealthPlanDetail({ id, profile, act }: { id: string; profile: HealthProfile; act: Act }) {
  const plan = healthPlanById(id);
  if (!plan) return null;
  const hospital = healthHospitals.find((item) => item.id === profile.hospital);
  return (
    <div className="hal-card wu-panel">
      <h3 className="wu-panel__title">{plan.insurer} {plan.name}</h3>
      <p className="hal-text">{plan.premium}. This comparison contains published product information, not a personalised insurance quote.</p>
      <ul className="wu-list">
        {plan.benefits.map((benefit) => <li key={benefit}><CheckIcon className="hal-icon hal-icon--sm" aria-hidden /><span className="hal-text">{benefit}</span></li>)}
      </ul>
      <h4 className="wu-list__title">Have ready for the insurer</h4>
      <ul className="wu-list">
        {healthDocuments.map((document) => <li key={document}><FileText className="hal-icon hal-icon--sm" aria-hidden /><span className="hal-text">{document}</span></li>)}
      </ul>
      <p className="hal-text">{hospital ? `Ask the insurer to verify ${hospital.name} (${hospital.area}) in the exact plan network. ` : "Check your preferred hospital in the exact plan network. "}Share health declarations directly with the insurer. Cover begins only after approval, payment and policy issuance.</p>
      <div className="wu-choices">
        <Button variant="primary" onClick={() => act({ a: "healthQuote", id, profile }, `Prepare a quote request for ${plan.insurer} ${plan.name}`)}>Save quote request</Button>
        {plan.source ? <a href={plan.source} target="_blank" rel="noopener noreferrer" className="hal-btn hal-btn--ghost">Open insurer</a> : <span className="hal-note">Fictional simulation insurer</span>}
      </div>
    </div>
  );
}

function FileStep() {
  const receipts = useFile((s) => s.receipts);
  return (
    <div className="hal-card wu-panel">
      <ul className="wu-list">
        {receipts.map((r) => (
          <li key={r.ref}>
            <CheckIcon className="hal-icon hal-icon--sm" aria-hidden />
            <span className="wu-list__body">
              <span className="wu-list__title">{r.title}</span>
              <span className="wu-note">
                {r.kind === "visa" ? visaStages[r.stage ?? 0] : r.lines[0]?.[1]}
              </span>
            </span>
            <span className="wu-note">{r.ref}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Step({ widget, act }: { widget: Widget; act: Act }) {
  switch (widget.t) {
    case "sarahDocuments": return <SarahDocuments act={act} />;
    case "sarahQuote": return <SarahQuote />;
    case "menu":
      return <Menu act={act} />;
    case "homes":
      return <Homes ids={widget.ids} act={act} />;
    case "home":
      return <Home id={widget.id} act={act} />;
    case "slots":
      return <Slots widget={widget} act={act} />;
    case "lease":
      return <Lease id={widget.id} provider={widget.provider} price={widget.price} act={act} />;
    case "pay":
      return <Pay payment={widget.payment} act={act} />;
    case "receipt":
      return <ReceiptCard refId={widget.ref} />;
    case "visaPick":
      return <VisaPick act={act} />;
    case "family":
      return <FamilyStep act={act} />;
    case "docs":
      return <Docs slug={widget.slug} act={act} />;
    case "channels":
      return <Channels slug={widget.slug} act={act} />;
    case "centres":
      return <Centres refId={widget.ref} act={act} />;
    case "filers":
      return <Filers act={act} />;
    case "tax":
      return <Tax act={act} />;
    case "banks":
      return <Banks act={act} />;
    case "cities":
      return <Cities act={act} />;
    case "flights":
      return <Flights city={widget.city} act={act} />;
    case "hotels":
      return <Hotels act={act} />;
    case "pickup":
      return <Pickup act={act} />;
    case "schools":
      return <Schools initial={widget.curriculum} act={act} />;
    case "healthProfile":
      return <HealthDetails act={act} />;
    case "healthPlans":
      return <HealthPlans profile={widget.profile} act={act} />;
    case "healthPlan":
      return <HealthPlanDetail id={widget.id} profile={widget.profile} act={act} />;
    case "file":
      return <FileStep />;
  }
}
