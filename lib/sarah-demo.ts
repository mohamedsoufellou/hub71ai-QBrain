import type { Action, AIReply, ChatMessage, DemoDocument, RelocationProfile } from "./types";

export const SARAH_PROMPT = "Hi, I am Sarah. I am moving to Abu Dhabi in December. I have 2 children who need schools, Year 6 and Year 10. We use French as a second language. My husband is an engineer and needs a job.";

export const sarahDocumentGroups: { id: DemoDocument["group"]; title: string; detail: string; samples: string[] }[] = [
  { id: "identity", title: "Family identity", detail: "Passport copies for all four family members and the children’s birth certificates. Existing UAE residence documents, if any.", samples: ["Martin_Family_Passports_DEMO.pdf", "Children_Birth_Certificates_DEMO.pdf"] },
  { id: "school", title: "School records", detail: "Latest reports for Year 6 and Year 10, dates of birth, current curriculum and the older child’s GCSE subject list and exam boards. Transfer certificates can follow.", samples: ["Amelie_Year6_Report_DEMO.pdf", "Leo_Year10_Report_and_Subjects_DEMO.pdf"] },
  { id: "french", title: "French learning", detail: "Recent French teacher comments, level and coursework for both children; any language certificate is optional.", samples: ["Children_French_Learning_Summary_DEMO.pdf"] },
  { id: "career", title: "Engineering background", detail: "Your husband’s CV, engineering discipline, degree and relevant professional certificates; preferred roles and notice period.", samples: ["David_Martin_Civil_Engineer_CV_DEMO.pdf", "David_Degree_and_Professional_Certificates_DEMO.pdf"] },
  { id: "move", title: "Move and budget brief", detail: "Preferred December arrival, school and housing budgets, home requirements and the family’s proposed residence or employer sponsorship route.", samples: ["Sarah_December_Move_Brief_DEMO.pdf"] },
];
export const sarahSampleDocuments: DemoDocument[] = sarahDocumentGroups.flatMap((group) => group.samples.map((name) => ({ group: group.id, name })));

export const sarahSources = [
  { title: "BSAK: admissions and availability", url: "https://www.britishschool.sch.ae/admissions/admissions-process" },
  { title: "BSAK: published tuition reference (2025/26)", url: "https://www.britishschool.sch.ae/admissions/fees" },
  { title: "BSAK: French within modern foreign languages", url: "https://www.britishschool.sch.ae/bsak-blog" },
  { title: "BIS Abu Dhabi: admissions and 2026/27 calendar", url: "https://www.nordangliaeducation.com/bis-abu-dhabi/admissions" },
  { title: "AECOM: official careers portal", url: "https://aecom.com/careers/" },
];

export const sarahQuote = {
  reference: "DEMO-WS-SM-1206",
  partner: "Harbour Relocation Advisory",
  adviser: "Nadia Bennett",
  lines: [
    ["Family assessment and move plan", 1500],
    ["Two school application packs and coordination", 2200],
    ["French and Year 10 subject continuity review", 800],
    ["Engineering CV review and interview coaching", 600],
    ["Area shortlist and up to three viewing requests", 1400],
    ["Arrival and first-month coordination", 1500],
  ] as [string, number][],
  subtotal: 8000,
  tax: 400,
  total: 8400,
  deposit: 4200,
  schoolReference: 130080,
};

function normalize(raw: string) {
  return raw.normalize("NFKC").toLowerCase().replace(/&#x(?:a0|20|a);|&nbsp;|&#160;/gi, " ").replace(/[’‘]/g, "'").replace(/\s+/g, " ");
}

export function isSarahPrompt(raw: string) {
  const q = normalize(raw);
  return /\bsara(?:h)?\b/.test(q) && /abu[ -]?dhabi/.test(q) && /dec(?:ember)?\b/.test(q)
    && /(?:year|yr)\s*(?:6|six)\b/.test(q) && /(?:(?:year|yr)\s*)?(?:10|ten)\b/.test(q)
    && /french/.test(q) && /engineer/.test(q);
}

function reply(text: string, profile: RelocationProfile, extra: Partial<AIReply> = {}): AIReply {
  return { text, profile, model: "mock-sarah", sources: sarahSources, ...extra };
}
const options: NonNullable<AIReply["options"]> = [
  { label: "Compare the school choices", action: { a: "sarahDemo", stage: "schools" } },
  { label: "Explain the engineering job plan", action: { a: "sarahDemo", stage: "career" } },
  { label: "Show the itemized quotation", action: { a: "sarahDemo", stage: "quote" } },
];

export function sarahDemoAction(action: Extract<Action, { a: "sarahDemo" }>, profile: RelocationProfile): AIReply {
  if (!profile.sarahDemoStage) return reply("Start Sarah’s December relocation scenario first so I can prepare the correct assessment checklist.", profile);
  if (action.stage === "documents") return reply("Sarah, here is the five-part checklist for your family’s December move. Add sample documents below, then submit the pack for a simulated assessment.", profile, { widget: { t: "sarahDocuments" } });
  if (action.stage === "assessment") {
    const documents = action.sample ? sarahSampleDocuments : action.documents ?? [];
    const missing = sarahDocumentGroups.filter((group) => !documents.some((doc) => doc.group === group.id && doc.name.trim()));
    if (missing.length) return reply(`I still need these document groups before completing the simulated assessment: ${missing.map((group) => group.title).join(", ")}. You can also use Sarah’s complete sample pack.`, profile, { widget: { t: "sarahDocuments" } });
    const assessed = { ...profile, sarahDemoStage: "assessed" as const };
    const year = profile.moveDate?.match(/\d{4}/)?.[0] ?? "2026";
    return reply(`Thank you, Sarah. Your ${documents.length} demo attachments cover all five requested groups. Nadia Bennett, your assigned adviser at Harbour Relocation Advisory, has prepared the following simulated assessment. The adviser and partner are fictional; their “verified partner” status is part of this mockup.

For this assessment we use a fictional sample family: Amélie Martin, Year 6; Leo Martin, Year 10; and David Martin, a civil engineer with 12 years in infrastructure and project delivery. The sample brief assumes a 12 December ${year} arrival, British curriculum, French as a second language, and a three-bedroom rental budget of AED 150,000 a year. These are sample assumptions, not facts extracted from your files; attachment contents are not read.

1. School continuity comes first. Start with British School Al Khubairat and British International School Abu Dhabi as enquiry candidates for both year groups. Ask each admissions team about places, assessments and matching Leo’s current subjects and exam boards. A Year 10 transfer needs a subject-by-subject review before choosing a school. Neither child has a confirmed place.

2. Keep French as a second language. BSAK identifies French in its modern foreign languages provision. Ask both schools to confirm French teaching for Year 6 and an appropriate Year 10 class and exam route. Studying French does not automatically mean the children should switch to a French-medium curriculum.

3. Use December to settle, with January entry as the working target. ${year === "2026" ? "BIS Abu Dhabi publishes a winter break from 14 December 2026 to 1 January 2027, with Term 2 starting 4 January 2027." : "Check the chosen school’s calendar for the exact January return date."} The proposed sequence is remote admissions review in October–November, arrival and temporary accommodation in December, then a school start subject to an offer. Follow the chosen school’s calendar.

4. Start David’s job search before arrival. The sample CV supports a search for civil engineer, infrastructure engineer and project engineer roles. Prepare a UAE-focused CV and project portfolio, then use official employer portals, starting with AECOM. His exact discipline, salary expectations and right to work must be confirmed. No vacancy, interview or offer is reserved, and our quote covers optional CV coaching, not recruitment placement.

5. Choose the home after the school. Compare Al Mushrif for the BSAK option and Khalifa City for the BIS Abu Dhabi option. Check actual routes, bus coverage and David’s eventual work location before signing a lease. The sample residence route is still unresolved: an authorised adviser would need to confirm who will sponsor the family and which documents are required.

Next items: the final Year 10 subject/exam-board confirmation, transfer certificates when available, and the family’s sponsorship route. The quotation below shows the mock partner’s service fee separately from school tuition and household costs.`, assessed, { family: { spouse: true, kids: 2, parents: 0 }, widget: { t: "sarahQuote" }, options });
  }
  if (profile.sarahDemoStage !== "assessed") return reply("I can prepare that after the document step. Submit the five document groups, or use Sarah’s sample pack, to complete the simulated assessment first.", profile, { widget: { t: "sarahDocuments" } });
  if (action.stage === "schools") return reply("Sarah, the strongest starting point is a British curriculum school that can accommodate both Year 6 and Year 10 while preserving French. BSAK is an enquiry candidate because it lists French among its modern foreign languages. BIS Abu Dhabi is a second enquiry candidate because it accepts applications throughout the year, subject to assessment and places. French provision for the exact year groups must be checked directly.\n\nFor Leo, request a written comparison of his current GCSE subjects, exam boards and topics already covered; for Amélie, request a Year 6 placement review and language timetable. Ask for offers for both siblings before committing to a nearby home.\n\nFor a dated cost reference, BSAK’s published 2025/26 tuition is AED 55,520 for Year 6 and AED 74,560 for Year 10: AED 130,080 annually for both. This is a historical published reference, not a 2026/27 school quotation. Request current fees and January-entry billing directly from admissions.", profile, { options });
  if (action.stage === "career") return reply("For the fictional David Martin profile, we would build two CV versions: civil/infrastructure design and project delivery. Lead with 12 years of sample experience, project scale, technical tools, qualifications and measurable delivery results. Confirm his actual engineering discipline before targeting roles.\n\nSuggested mock schedule: week 1, CV and portfolio review; weeks 2–3, identify suitable roles on official careers portals and submit tailored applications; weeks 3–4, interview practice if employers respond. AECOM’s official portal is a starting point to check current roles, not evidence of an available job for David. Salary, notice period, work authorisation and any professional registration requirements still need to be checked.\n\nOur AED 600 service line is optional CV review and interview coaching. Employer applications are made directly; it is not a charge for securing a job. No recruiter or employer has been contacted by this demo.", profile, { options });
  return reply("Sarah, here is the itemized quotation for your family’s relocation support. The fictional partner fee is AED 8,000 plus AED 400 of illustrative 5% VAT, totalling AED 8,400. The mock payment schedule is AED 4,200 on engagement and AED 4,200 after delivery.\n\nThe dated school tuition reference and your assumed annual rent are shown separately below. This is a realistic sample commercial quotation; a binding quote requires a real provider’s scope, current prices and written approval.", profile, { widget: { t: "sarahQuote" }, options });
}

export function runSarahDemo(messages: Pick<ChatMessage, "role" | "text">[], profile: RelocationProfile): AIReply | null {
  const raw = messages.at(-1)?.text ?? "";
  const q = normalize(raw);
  if (isSarahPrompt(raw)) {
    const year = q.match(/dec(?:ember)?\s+(20\d{2})\b/)?.[1] ?? "2026";
    const saved: RelocationProfile = { ...profile, name: "Sarah", moveDate: `December ${year}`, sarahDemoStage: "documents", priorities: "Two children: Year 6 and Year 10. French as a second language. Husband is an engineer seeking work." };
    return reply(`Hi Sarah, welcome to Wusool. I’ve noted your December ${year} move to Abu Dhabi, your children’s Year 6 and Year 10 school needs, French as a second language, and your husband’s engineering job search.

Your tailored plan will be coordinated by Nadia Bennett at Harbour Relocation Advisory, our fictional “verified partner” for this demo. Here are your five steps:

1. Complete your family assessment. Add the five document groups below, including school reports and your husband’s CV.
2. Shortlist schools for both children. Review Year 10 subject continuity first, then check Year 6 entry and a suitable French pathway for both.
3. Prepare your husband’s job search. Confirm his engineering discipline, experience, qualifications and preferred roles.
4. Match your home and arrival plan. Compare school routes and housing budgets, then plan December accommodation and the proposed residence route.
5. Receive your assessment and quotation. Once you submit the demo pack, I’ll explain the school options, job-search steps, open questions and itemized relocation costs.

Use fictional or redacted files in this demo, or load Sarah’s sample pack. File names are recorded locally; document contents are not uploaded or analysed.`, saved, { family: { spouse: true, kids: 2, parents: 0 }, widget: { t: "sarahDocuments" } });
  }
  if (!profile.sarahDemoStage) return null;
  if (profile.sarahDemoStage === "assessed" && /\b(?:assessment|assess)\b/.test(q) && !/\b(?:upload|attach|documents?)\b/.test(q)) return sarahDemoAction({ a: "sarahDemo", stage: "assessment", sample: true }, profile);
  if (/\b(?:upload|attach|submit|sent|send|documents?|reports?|cv|assessment|assess|sample pack|sample documents)\b/.test(q)) {
    if (/\b(?:uploaded|attached|submitted|sent)\b/.test(q) && /\b(?:all|documents|document pack|pack)\b/.test(q) && !/\b(?:not|haven't|havent|didn't|didnt|can't|cannot|only|some|one|missing|part)\b/.test(q) && !/\?$/.test(q)) {
      return sarahDemoAction({ a: "sarahDemo", stage: "assessment", sample: true }, profile);
    }
    if (/\b(?:use|load|submit)\b.*\bsample\b/.test(q)) return sarahDemoAction({ a: "sarahDemo", stage: "assessment", sample: true }, profile);
    return sarahDemoAction({ a: "sarahDemo", stage: "documents" }, profile);
  }
  if (/\b(?:quot(?:e|ation)|costs?|pricing|prices?|fees?|budget|how much)\b/.test(q)) return sarahDemoAction({ a: "sarahDemo", stage: "quote" }, profile);
  if (/\b(?:school|schools|french|year 6|year 10|children|kids)\b/.test(q)) return sarahDemoAction({ a: "sarahDemo", stage: "schools" }, profile);
  if (/\b(?:husband|engineer|engineering|job|jobs|career|work|salary)\b/.test(q)) return sarahDemoAction({ a: "sarahDemo", stage: "career" }, profile);
  return null;
}
