import { cityNames, districts } from "./data";
import type { Action } from "./types";

function bedsFrom(q: string) {
  const match = q.match(/(\d)\s*-?\s*(br|bed|bedroom|room|غرف)/);
  return match ? Number(match[1]) : undefined;
}

function budgetCap(q: string) {
  const under = q.match(/(?:under|below|max|less than|budget|أقل من|اقل من|تحت|ميزانية)\s*(?:of\s*)?(?:aed\s*)?([\d,.]+)\s*(k|m|ألف|الف|مليون)?/);
  if (!under) return undefined;
  const raw = Number(under[1].replace(/,/g, ""));
  if (Number.isNaN(raw)) return undefined;
  if (under[2] === "m" || under[2] === "مليون") return raw * 1_000_000;
  if (["k", "ألف", "الف"].includes(under[2]) || raw < 1000) return raw * 1000;
  return raw;
}

function visaSlug(q: string) {
  if (/golden|ذهبية/.test(q)) return "golden";
  if (/green|خضراء/.test(q)) return "green";
  if (/freelance|self.?employ|عمل حر|مستقل/.test(q)) return "freelance";
  if (/investor|founder|company|business visa|partner|مستثمر|شريك/.test(q)) return "investor";
  if (/employ|job|work visa|offer|تأشيرة عمل|تاشيرة عمل|وظيفة/.test(q)) return "employment";
  if (/family|wife|husband|spouse|kids|children|parents|son|daughter|عائلي|عائلتي|زوجتي|زوجي|أطفالي|اطفالي/.test(q)) return "family";
  return undefined;
}

export function interpret(raw: string): Action | null {
  const q = raw.toLowerCase().normalize("NFKC")
    .replace(/[\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/٬/g, ",").replace(/٫/g, ".")
    .replace(/غرفتين/g, "2 bedrooms")
    .replace(/(one|two|three|four|five|six)\s+(?=bed(?:room)?s?)/g, (_, word: string) => `${["one", "two", "three", "four", "five", "six"].indexOf(word) + 1} `);
  const district = districts.find((d) => q.includes(d.slug) || q.includes(d.name.toLowerCase()) || q.includes(d.nameAr));
  const beds = bedsFrom(q);
  const max = budgetCap(q);
  const cityAliases: Record<string, string> = { London: "لندن", Cairo: "القاهرة", Mumbai: "مومباي", Manila: "مانيلا", "New York": "نيويورك", Paris: "باريس", Delhi: "دلهي", Riyadh: "الرياض", Singapore: "سنغافورة", Rome: "روما", Madrid: "مدريد", Sydney: "سيدني" };
  const city = cityNames.find((c) => q.includes(c.toLowerCase()) || (cityAliases[c] && q.includes(cityAliases[c])));

  if (/file|saved|my bookings|status|what have i|ملفي|حجوزاتي/.test(q)) return { a: "topic", topic: "file" };
  if (/health|insurance|hospital|clinic|doctor|medical|daman|adnic|sukoon|صحة|صحي|تأمين|مستشفى/.test(q)) return { a: "topic", topic: "health" };
  if (/tax|vat|income|ضريبة|ضرائب|ضريب/.test(q)) return { a: "topic", topic: "tax" };
  if (/bank|account|بنك|حساب مصرفي|حساب بنكي/.test(q)) return { a: "topic", topic: "bank" };
  if (/travel|trip|flight|hotel|airport|pickup|arrive|arrival|landing|fly|سفر|رحلة|طيران|فندق/.test(q)) {
    return city ? { a: "city", city } : { a: "topic", topic: "arrive" };
  }

  const homeWords = /rent|buy|home|house|villa|apartment|flat|bedroom|place to live|townhouse|شقة|شقه|منزل|بيت|فيلا|سكن|إيجار|ايجار|استئجار/;
  if (/school|nursery|curriculum|مدرسة|مدارس|حضانة|منهج/.test(q) && !homeWords.test(q)) {
    return { a: "topic", topic: "school" };
  }

  if (/visa|sponsor|residen|golden|emirates id|تأشيرة|تاشيرة|إقامة|اقامة/.test(q) && !homeWords.test(q)) {
    const slug = visaSlug(q);
    return slug ? { a: "visaFor", slug } : { a: "topic", topic: "visa" };
  }

  const wantsHome =
    Boolean(district) || Boolean(beds) || Boolean(max) || homeWords.test(q);
  if (wantsHome) {
    return {
      a: "homes",
      filter: {
        kind: /buy|purchase|own|شراء|اشتري/.test(q) ? "buy" : "rent",
        area: district?.slug,
        beds,
        max,
        school: /school|kid|child|family|مدرسة|أطفال|اطفال|عائل/.test(q),
      },
    };
  }

  if (/visa|sponsor|residen|golden|emirates id/.test(q) || visaSlug(q)) {
    const slug = visaSlug(q);
    return slug ? { a: "visaFor", slug } : { a: "topic", topic: "visa" };
  }
  if (/school|nursery|curriculum/.test(q)) return { a: "topic", topic: "school" };
  return null;
}
