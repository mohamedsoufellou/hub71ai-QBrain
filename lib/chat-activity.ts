import type { Action, Topic } from "./types";

export type ChatPlayback = {
  id: string;
  phase: "thinking" | "working" | "writing";
  activity: [string, string];
  characters: number;
};

const topics: Record<Topic, [string, string]> = {
  menu: ["Preparing your next steps…", "جارٍ إعداد خطواتك التالية…"],
  home: ["Finding homes…", "جارٍ البحث عن مساكن…"],
  visa: ["Checking visa routes…", "جارٍ مراجعة مسارات التأشيرة…"],
  arrive: ["Exploring travel options…", "جارٍ استعراض خيارات السفر…"],
  school: ["Finding schools…", "جارٍ البحث عن مدارس…"],
  health: ["Checking cover options…", "جارٍ مراجعة خيارات التأمين…"],
  bank: ["Comparing bank options…", "جارٍ مقارنة خيارات البنوك…"],
  tax: ["Reviewing your details…", "جارٍ مراجعة تفاصيلك…"],
  file: ["Opening your saved file…", "جارٍ فتح ملفك المحفوظ…"],
};

// Describe local demo work without implying a live provider search.
export function chatActivity(action?: Action): [string, string] {
  if (!action) return topics.menu;
  switch (action.a) {
    case "sarahDemo": return ["Preparing Sarah’s demo relocation plan…", "جارٍ إعداد خطة انتقال سارة التجريبية…"];
    case "topic": return topics[action.topic];
    case "homes": return topics.home;
    case "home": return ["Getting the home details…", "جارٍ عرض تفاصيل المسكن…"];
    case "city": return ["Comparing flight options…", "جارٍ مقارنة خيارات الرحلات…"];
    case "flight": return ["Finding a first stay…", "جارٍ البحث عن إقامة أولى…"];
    case "hotel": return ["Preparing airport transfers…", "جارٍ إعداد خيارات النقل من المطار…"];
    case "schools": return topics.school;
    case "healthPlans": return ["Matching cover to your needs…", "جارٍ مطابقة التأمين مع احتياجاتك…"];
    case "healthPlan": return ["Reviewing the plan details…", "جارٍ مراجعة تفاصيل الخطة…"];
    case "visaFor": case "family": return ["Reviewing the document checklist…", "جارٍ مراجعة قائمة المستندات…"];
    case "medical": case "centre": case "viewing": case "bank": return topics.menu;
    case "update": return ["Checking your demo application…", "جارٍ مراجعة طلبك التجريبي…"];
    case "slot": case "paid": case "seat": case "healthQuote": return ["Saving your demo request…", "جارٍ حفظ طلبك التجريبي…"];
    case "pay": case "lease": case "channel": case "filer": case "pickup": return ["Putting the details together…", "جارٍ تجميع التفاصيل…"];
    case "tax": return topics.tax;
    case "docs": return ["Preparing the demo application…", "جارٍ إعداد الطلب التجريبي…"];
  }
}
