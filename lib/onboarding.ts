export type DemoDocument = { name: string; size: number; sample: boolean };
export type Applicant = {
  name: string; nationality: string; birthDate: string; phone: string;
  passportNumber: string; passportExpiry: string; residence: string; emirate: string;
  occupation: string; employment: string; experience: number; education: string;
  description: string; skills: string; salary: number; housingBudget: number;
  moveDate: string; dependants: number; bedrooms: number; goals: string[];
  passport: DemoDocument | null; cv: DemoDocument | null;
};
export const goals = ["Residency & visa", "Career opportunities", "Find a home", "Banking", "Health insurance", "Family & schools", "Business setup"];
export function emptyApplicant(name = ""): Applicant {
  return { name, nationality: "", birthDate: "", phone: "", passportNumber: "", passportExpiry: "", residence: "Outside the UAE", emirate: "Abu Dhabi", occupation: "", employment: "Employed", experience: 0, education: "Bachelor’s degree", description: "", skills: "", salary: 0, housingBudget: 0, moveDate: "", dependants: 0, bedrooms: 1, goals: ["Residency & visa", "Find a home"], passport: null, cv: null };
}
export function sampleApplicant(name: string): Applicant {
  return { ...emptyApplicant(name), nationality: "Egyptian", birthDate: "1994-06-12", phone: "+971 50 000 0000", passportNumber: "DEMO123456", passportExpiry: "2030-06-12", occupation: "Product designer", experience: 8, skills: "Product design, UX research, Figma, team leadership", description: "I am a product designer moving to Abu Dhabi with my partner. I want to explore roles in the startup ecosystem, find a two-bedroom home and get help organising residency and health cover.", salary: 24000, housingBudget: 120000, moveDate: "2027-01-15", dependants: 1, bedrooms: 2, goals: ["Residency & visa", "Career opportunities", "Find a home", "Banking", "Health insurance"], passport: { name: "sample-passport.pdf", size: 245000, sample: true }, cv: { name: "sample-cv.pdf", size: 128000, sample: true } };
}
export function validateApplicant(profile: Applicant): { step: number; message: string } | null {
  if (profile.name.trim().length < 2 || !profile.nationality.trim() || !profile.birthDate || !Number.isFinite(Date.parse(profile.birthDate)) || Date.parse(profile.birthDate) > Date.now()) {
    return { step: 0, message: "Enter your full name, nationality and a valid date of birth." };
  }
  if (!profile.occupation.trim() || profile.description.trim().length < 20 || !Number.isInteger(profile.experience) || profile.experience < 0 || profile.experience > 70) {
    return { step: 2, message: "Add your role, a description of at least 20 characters and valid years of experience (0–70)." };
  }
  if (!profile.moveDate || !Number.isFinite(Date.parse(profile.moveDate)) || !Number.isFinite(profile.housingBudget) || profile.housingBudget <= 0 || profile.housingBudget > 10000000 || !Number.isFinite(profile.salary) || profile.salary < 0 || profile.salary > 10000000 || !Number.isInteger(profile.dependants) || profile.dependants < 0 || profile.dependants > 20 || !Number.isInteger(profile.bedrooms) || profile.bedrooms < 0 || profile.bedrooms > 5 || !profile.goals.length) {
    return { step: 3, message: "Add a valid move date, positive housing budget, valid household details and at least one goal." };
  }
  return null;
}
export type Partner = { id: string; name: string; initials: string; category: string; emirates: string[]; description: string; goal: string; specialism?: string; color: string };
/** Fictional providers for demonstrating the matching experience. */
export const demoPartners: Partner[] = [
  { id: "arrival", name: "Arrival Residency", initials: "AR", category: "Residency", emirates: ["All"], description: "A document review and guided residency preparation service.", goal: "Residency & visa", color: "#3b685b" },
  { id: "capital", name: "Capital Relocation", initials: "CR", category: "Residency", emirates: ["Abu Dhabi"], description: "A dedicated coordinator for your move to Abu Dhabi.", goal: "Residency & visa", color: "#917449" },
  { id: "studio", name: "Studio Talent", initials: "ST", category: "Career", emirates: ["Abu Dhabi", "Dubai"], description: "Career coaching and introductions for design and technology roles.", goal: "Career opportunities", specialism: "design product technology software engineering", color: "#645c85" },
  { id: "next", name: "Next Chapter Careers", initials: "NC", category: "Career", emirates: ["All"], description: "CV feedback, interview preparation and career planning.", goal: "Career opportunities", color: "#2b6a88" },
  { id: "shore", name: "Shoreline Living", initials: "SL", category: "Housing", emirates: ["Abu Dhabi"], description: "A home search focused on Reem Island, Yas and Al Raha.", goal: "Find a home", color: "#497e89" },
  { id: "city", name: "City Nest", initials: "CN", category: "Housing", emirates: ["All"], description: "Rental shortlists built around your family size and budget.", goal: "Find a home", color: "#b17a53" },
  { id: "bridge", name: "Bridge Banking", initials: "BB", category: "Banking", emirates: ["All"], description: "A checklist and comparison for your first UAE bank account.", goal: "Banking", color: "#4a607e" },
  { id: "well", name: "Wellcover", initials: "WC", category: "Health", emirates: ["All"], description: "Compare cover preferences for you and your dependants.", goal: "Health insurance", color: "#3b786c" },
  { id: "capital-health", name: "Capital Health Connect", initials: "CH", category: "Health", emirates: ["Abu Dhabi"], description: "Support navigating health cover and local provider networks.", goal: "Health insurance", color: "#88714c" },
  { id: "little", name: "Little Horizons", initials: "LH", category: "Family", emirates: ["Abu Dhabi", "Dubai"], description: "School shortlists, family orientation and admissions preparation.", goal: "Family & schools", color: "#8d6c82" },
  { id: "launch", name: "Launchpad Advisory", initials: "LA", category: "Business", emirates: ["Abu Dhabi", "Dubai"], description: "Help comparing business setup options and preparing a founder profile.", goal: "Business setup", color: "#6d7160" },
  { id: "venture", name: "Venture Desk", initials: "VD", category: "Business", emirates: ["All"], description: "An initial business planning and licensing consultation.", goal: "Business setup", color: "#6c6289" },
];
export function rankPartners(profile: Applicant) {
  const career = `${profile.occupation} ${profile.skills} ${profile.description}`.toLowerCase();
  return demoPartners.map((partner) => {
    const location = partner.emirates.includes("All") || partner.emirates.includes(profile.emirate);
    const requested = profile.goals.includes(partner.goal);
    const reasons = [location ? `Serves ${profile.emirate}` : `Outside your preferred emirate (${partner.emirates.join(", ")})`];
    let score = location ? 30 : 0;
    if (requested) { score += 45; reasons.push(`Matches your goal: ${partner.goal.toLowerCase()}`); }
    if (partner.specialism && partner.specialism.split(" ").some((word) => career.includes(word))) { score += 15; reasons.push(`Relevant to your ${profile.occupation || "professional"} background`); }
    if (partner.category === "Housing" && profile.housingBudget > 0) { score += 10; reasons.push(`Search brief: AED ${profile.housingBudget.toLocaleString("en-US")}/year, ${profile.bedrooms} bedrooms`); }
    if (partner.category === "Family" && profile.dependants > 0) { score += 10; reasons.push(`${profile.dependants} dependant(s) in your relocation plan`); }
    if (partner.category === "Career" && profile.cv) { score += 10; reasons.push("A CV is attached for the next review"); }
    if (partner.category === "Residency" && profile.passport) { score += 10; reasons.push("A passport document is attached"); }
    if (partner.category === "Health" && profile.dependants > 0) { score += 10; reasons.push("Your brief includes family cover"); }
    if (partner.category === "Business" && profile.employment === "Founder / self-employed") { score += 10; reasons.push("Matches your founder / self-employed status"); }
    return { ...partner, score: Math.min(score, 100), reasons, recommended: location && requested };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
export function analyseApplicant(profile: Applicant, today = new Date()) {
  const deadline = new Date(today); deadline.setMonth(deadline.getMonth() + 6);
  const expiry = profile.passportExpiry ? new Date(`${profile.passportExpiry}T23:59:59`) : null;
  const passportFlag = !expiry ? "Add your passport expiry date" : expiry < today ? "Passport expiry date has passed" : expiry < deadline ? "Passport expires within six months" : "Passport date has more than six months remaining";
  const checks = [Boolean(profile.name && profile.nationality && profile.birthDate), Boolean(profile.passport && profile.passportNumber && expiry && expiry >= deadline), Boolean(profile.cv && profile.occupation && profile.description.trim().length >= 20), Boolean(profile.moveDate && profile.housingBudget > 0 && profile.goals.length)];
  const nextSteps = [];
  if (!profile.passport) nextSteps.push("Attach a sample passport document to complete your identity checklist.");
  if (!expiry || expiry < deadline) nextSteps.push("Review your passport expiry date before planning a residency application.");
  if (!profile.cv) nextSteps.push("Attach a sample CV before preparing a career introduction.");
  if (profile.goals.includes("Residency & visa")) nextSteps.push(profile.residence === "UAE resident" ? "Ask a residency adviser to review your existing status and planned changes." : "Prepare a residency consultation brief with your employment and relocation details.");
  if (profile.goals.includes("Find a home")) nextSteps.push(`Compare ${profile.bedrooms}-bedroom homes in ${profile.emirate} within AED ${profile.housingBudget.toLocaleString("en-US")} per year.`);
  if (profile.goals.includes("Health insurance")) nextSteps.push(`Compare health cover for ${1 + profile.dependants} person(s), including any employer-provided cover.`);
  if (profile.goals.includes("Career opportunities")) nextSteps.push(`Review your CV and ${profile.occupation || "career"} goals with a career partner.`);
  if (profile.goals.includes("Banking")) nextSteps.push("Prepare a banking document checklist and compare account requirements.");
  if (profile.goals.includes("Family & schools")) nextSteps.push("Prepare dependant ages and school preferences for a family consultation.");
  if (profile.goals.includes("Business setup")) nextSteps.push("Prepare a business activity and ownership brief for a setup consultation.");
  return { checks, completeness: checks.filter(Boolean).length * 25, passportFlag, nextSteps, partners: rankPartners(profile) };
}
