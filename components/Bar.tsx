"use client";

import { FolderOpen, Languages, RotateCcw } from "lucide-react";
import { useFile } from "@/lib/store";
import { Mark } from "./Mark";
import { Account } from "./Account";
import { ServiceIcon, serviceLinks, type ServiceTopic } from "./ServiceIcon";
import type { Widget } from "@/lib/types";
import { AccountLink } from "./Onboarding";

const topicForWidget: Partial<Record<Widget["t"], ServiceTopic>> = {
  homes: "home", home: "home", lease: "home",
  visaPick: "visa", family: "visa", docs: "visa", channels: "visa", centres: "visa",
  cities: "arrive", flights: "arrive", hotels: "arrive", pickup: "arrive",
  banks: "bank", schools: "school", tax: "tax", filers: "tax",
  healthProfile: "health", healthPlans: "health", healthPlan: "health",
};

export function Bar() {
  const lang = useFile((s) => s.lang);
  const setLang = useFile((s) => s.setLang);
  const count = useFile((s) => s.receipts.length);
  const started = useFile((s) => s.messages.length > 0);
  const act = useFile((s) => s.act);
  const reset = useFile((s) => s.reset);
  const responding = useFile((s) => s.pending || s.playback !== null);
  const widget = useFile((s) => s.messages.at(-1)?.widget);
  const active = widget?.t === "pay" ? ({ lease: "home", visa: "visa", trip: "arrive", tax: "tax" } as const)[widget.payment.for]
    : widget?.t === "slots" ? ({ viewing: "home", bank: "bank", medical: "visa" } as const)[widget.purpose]
    : widget ? topicForWidget[widget.t] : undefined;
  const ar = lang === "ar";

  return (
    <header className="hal-nav">
      <button type="button" className="hal-nav__brand wu-brand" disabled={responding} aria-label={ar ? "وصول، جميع الخدمات" : "Wusool, all services"} title={ar ? "وصول" : "Wusool"} onClick={() => started && act({ a: "topic", topic: "menu" }, ar ? "جميع الخدمات" : "All services")}>
        <Mark />
        <span className="wu-brand__english" lang="en">wusool</span>
        <span className="wu-brand__divider" aria-hidden="true" />
        <span className="wu-brand__arabic" lang="ar" dir="rtl">وصول</span>
      </button>
      <nav className="wu-service-nav" aria-label={ar ? "الخدمات" : "Services"}>
        {serviceLinks.map(({ topic, en, ar: labelAr }) => (
          <button key={topic} type="button" className="wu-nav-icon wu-service-link" disabled={responding} aria-label={ar ? labelAr : en} title={ar ? labelAr : en} aria-current={active === topic ? "true" : undefined} onClick={() => act({ a: "topic", topic }, ar ? labelAr : en)}>
            <ServiceIcon topic={topic} />
          </button>
        ))}
      </nav>
      <AccountLink mobile />
      <div className="hal-nav__end hal-row">
        <AccountLink />
        <Account />
        <button type="button" className="hal-btn hal-btn--ghost wu-nav-icon" aria-label={ar ? "English" : "عربي"} title={ar ? "English" : "عربي"} onClick={() => setLang(ar ? "en" : "ar")}>
          <Languages className="hal-icon" aria-hidden />
        </button>
        {started ? (
          <button
            type="button"
            className="hal-btn hal-btn--ghost wu-nav-icon"
            aria-label={ar ? "من جديد" : "Start over"}
            title={ar ? "من جديد" : "Start over"}
            onClick={() => {
              if (window.confirm(ar ? "البدء من جديد؟" : "Start over and clear everything?")) reset();
            }}
          >
            <RotateCcw className="hal-icon" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          className="hal-btn hal-btn--ghost wu-nav-icon"
          disabled={responding}
          aria-label={ar ? `ملفي${count ? `، ${count}` : ""}` : `My file${count ? `, ${count}` : ""}`}
          title={ar ? "ملفي" : "My file"}
          aria-current={widget?.t === "file" ? "true" : undefined}
          onClick={() => act({ a: "topic", topic: "file" }, ar ? "اعرض ملفي" : "Show my file")}
        >
          <FolderOpen className="hal-icon" aria-hidden />
        </button>
      </div>
    </header>
  );
}
