import type { Topic } from "@/lib/types";

export type ServiceTopic = Exclude<Topic, "menu" | "file">;

export const serviceLinks: { topic: ServiceTopic; en: string; ar: string }[] = [
  { topic: "home", en: "Find a home", ar: "ابحث عن سكن" },
  { topic: "visa", en: "Get a visa", ar: "احصل على تأشيرة" },
  { topic: "arrive", en: "Plan my travel", ar: "خطط لسفري" },
  { topic: "health", en: "Find health cover", ar: "اختر تأميناً صحياً" },
  { topic: "bank", en: "Open a bank account", ar: "افتح حساباً بنكياً" },
  { topic: "school", en: "Find a school", ar: "ابحث عن مدرسة" },
  { topic: "tax", en: "Check tax", ar: "تحقق من الضرائب" },
];

/** A shared set of original symbols, using the arch and warm accent of Wusool. */
export function ServiceIcon({ topic, className }: { topic: ServiceTopic; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {topic === "home" && <>
        <path d="m3.5 14 12.5-10L28.5 14M7 12v15h18V12" />
        <path d="M13 27v-8a3 3 0 0 1 6 0v8" stroke="var(--wu-accent)" />
      </>}
      {topic === "visa" && <>
        <rect x="7" y="3.5" width="19" height="25" rx="2.5" />
        <path d="M10.5 4v24M15 23h7" />
        <circle cx="18" cy="13" r="4.5" stroke="var(--wu-accent)" />
        <path d="M13.5 13h9M18 8.5c-2.5 2.5-2.5 6.5 0 9 2.5-2.5 2.5-6.5 0-9Z" stroke="var(--wu-accent)" />
      </>}
      {topic === "arrive" && <>
        <path d="m4 12 8 3 8-8 3 1-5 10 7 3v3l-10-3-5 4-2-1 2-5-7-4Z" />
        <path d="M4 28h24" stroke="var(--wu-accent)" />
      </>}
      {topic === "health" && <>
        <path d="M16 28S4 21 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 9-12 16-12 16Z" />
        <path d="M12 16h8M16 12v8" stroke="var(--wu-accent)" />
      </>}
      {topic === "bank" && <>
        <path d="m4 11 12-7 12 7H4ZM5 27h22M7 23V15M13 23V15M19 23V15M25 23V15" />
        <path d="M16 8h.01" stroke="var(--wu-accent)" strokeWidth="3" />
      </>}
      {topic === "school" && <>
        <path d="M16 8c-4-3-9-3-13-1v19c4-2 9-2 13 1 4-3 9-3 13-1V7c-4-2-9-2-13 1ZM16 8v19" />
        <path d="M7 12c2-.5 3.5-.2 5 1M20 13c1.5-1.2 3-1.5 5-1M7 17c2-.5 3.5-.2 5 1M20 18c1.5-1.2 3-1.5 5-1" stroke="var(--wu-accent)" />
      </>}
      {topic === "tax" && <>
        <path d="M8 4h16v25l-4-2-4 2-4-2-4 2V4ZM12 9h8" />
        <path d="m12 22 8-8" stroke="var(--wu-accent)" />
        <circle cx="13" cy="15" r="1.5" stroke="var(--wu-accent)" />
        <circle cx="19" cy="21" r="1.5" stroke="var(--wu-accent)" />
      </>}
    </svg>
  );
}
