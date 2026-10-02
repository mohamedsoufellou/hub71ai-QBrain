"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { Action } from "@/lib/types";
import { useT } from "./ui";

const cards: { id: string; image: string; title: string; titleAr: string; example: string; exampleAr: string; question: string; questionAr: string; action: Action }[] = [
  { id: "visa", image: "/photos/papers.jpg", title: "Visas", titleAr: "التأشيرات", example: "Bring my family", exampleAr: "إحضار عائلتي", question: "I need a family visa for my wife and kids", questionAr: "أحتاج تأشيرة عائلية لزوجتي وأطفالي", action: { a: "visaFor", slug: "family" } },
  { id: "travel", image: "/photos/flight-day.jpg", title: "Travel", titleAr: "السفر", example: "Flights from London", exampleAr: "رحلات من لندن", question: "Find me a flight from London to Abu Dhabi", questionAr: "ابحث عن رحلة من لندن إلى أبوظبي", action: { a: "city", city: "London" } },
  { id: "home", image: "/photos/khalifa-villa.jpg", title: "Your home", titleAr: "سكنك", example: "A villa under AED 150k", exampleAr: "فيلا بأقل من ١٥٠ ألف درهم", question: "I need a villa in Khalifa City under 150k", questionAr: "أحتاج فيلا في مدينة خليفة بأقل من ١٥٠ ألف درهم", action: { a: "homes", filter: { kind: "rent", area: "khalifa", max: 150000 } } },
  { id: "bank", image: "/photos/office.jpg", title: "Banking", titleAr: "الخدمات المصرفية", example: "Open my account", exampleAr: "افتح حسابي", question: "Help me open a bank account in Abu Dhabi", questionAr: "ساعدني في فتح حساب بنكي في أبوظبي", action: { a: "topic", topic: "bank" } },
  { id: "school", image: "/photos/school-hero.png", title: "Schools", titleAr: "المدارس", example: "Find their next school", exampleAr: "مدرستهم القادمة", question: "Find a British curriculum school for my children", questionAr: "ابحث عن مدرسة بمنهج بريطاني لأطفالي", action: { a: "schools", curriculum: "British" } },
  { id: "health", image: "/photos/health-hero.png", title: "Health", titleAr: "الصحة", example: "Cover for my family", exampleAr: "تغطية لعائلتي", question: "Help me find health insurance for my family in Abu Dhabi", questionAr: "ساعدني في إيجاد تأمين صحي لعائلتي في أبوظبي", action: { a: "topic", topic: "health" } },
];

export function ServiceCards({ onSelect }: { onSelect: (action: Action, question: string) => void }) {
  const t = useT();
  return (
    <div className="wu-service-cards" role="group" aria-label={t("Start with a ready-made request", "ابدأ بطلب جاهز")}>
      {cards.map((card, index) => (
        <button
          key={card.id}
          type="button"
          className="wu-service-card"
          style={{ "--card-order": index } as CSSProperties}
          data-featured={card.id === "home" || undefined}
          aria-label={t(card.question, card.questionAr)}
          onClick={() => onSelect(card.action, t(card.question, card.questionAr))}
        >
          <Image src={card.image} alt="" fill sizes="(max-width: 600px) 144px, (max-width: 1024px) 16vw, 164px" className="wu-service-card__image" />
          <span className="wu-service-card__copy">
            <span className="wu-service-card__title">{t(card.title, card.titleAr)}</span>
            <span className="wu-service-card__example">{t(card.example, card.exampleAr)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
