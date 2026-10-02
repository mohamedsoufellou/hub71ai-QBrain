import { extraHealthPlans } from "./simulation-seeds";
import type { HealthProfile } from "./types";

// Product descriptions and published benefits were checked against these
// official sources on 2 October 2026. A product overview is not a binding quote.
export const healthSources = {
  doh: "https://www.doh.gov.ae/en/faq",
  damanFlexi: "https://www.damaninsurance.ae/wp-content/uploads/2026/01/FAQ_Flexi-Health-Insurance-Plan-1.pdf",
  damanIndividual: "https://www.damaninsurance.ae/products/individuals-and-families/",
  adnic: "https://www.adnic.ae/web/guest/medical-insurance",
  sukoon: "https://www.sukoon.com/health-insurance",
};

export type HealthPlan = {
  id: string;
  insurer: string;
  name: string;
  area: string;
  annualLimit: string;
  premium: string;
  detail: string;
  benefits: string[];
  source: string;
  international: boolean;
};

export const healthPlans: HealthPlan[] = [
  {
    id: "daman-flexi", insurer: "Daman", name: "Flexi Health Insurance",
    area: "Abu Dhabi network; emergency terms apply", annualLimit: "AED 150,000",
    premium: "Published standard-risk premium: AED 750 a year",
    detail: "Restricted eligibility. Insurer approval and medical underwriting are required; a higher premium can apply.",
    benefits: ["Inpatient and outpatient cover", "Outpatient visits at network clinics and primary health centres", "Hospital access for inpatient and emergency treatment"],
    source: healthSources.damanFlexi, international: false,
  },
  {
    id: "daman-individual", insurer: "Daman", name: "Individuals and Families",
    area: "UAE, with optional worldwide cover", annualLimit: "Depends on the selected tier",
    premium: "Personalised quote required",
    detail: "A range of individual and family plans. The insurer confirms the network, limits, exclusions and premium for your chosen tier.",
    benefits: ["Inpatient, outpatient and emergency benefits", "Maternity subject to policy terms", "Optional benefit modules"],
    source: healthSources.damanIndividual, international: true,
  },
  {
    id: "adnic-bronze", insurer: "ADNIC", name: "SHIFA Bronze", area: "UAE only",
    annualLimit: "AED 250,000", premium: "Personalised quote required",
    detail: "Local cover with semi-private accommodation. Deductible choices and network must be confirmed in the quote.",
    benefits: ["Inpatient and outpatient benefits", "Semi-private hospital accommodation"],
    source: healthSources.adnic, international: false,
  },
  {
    id: "adnic-silver", insurer: "ADNIC", name: "SHIFA Silver", area: "Worldwide, excluding USA, Canada and Europe",
    annualLimit: "AED 500,000", premium: "Personalised quote required",
    detail: "International cover with private accommodation. Check the excluded countries against where you expect to travel.",
    benefits: ["Inpatient and outpatient benefits", "Private hospital accommodation"],
    source: healthSources.adnic, international: true,
  },
  {
    id: "adnic-gold", insurer: "ADNIC", name: "SHIFA Gold", area: "Worldwide, excluding USA and Canada",
    annualLimit: "AED 2,000,000", premium: "Personalised quote required",
    detail: "International benefits with optional dental and vision cover. The selected options affect the premium.",
    benefits: ["Inpatient and outpatient benefits", "Private hospital accommodation"],
    source: healthSources.adnic, international: true,
  },
  {
    id: "adnic-platinum", insurer: "ADNIC", name: "SHIFA Platinum", area: "Worldwide",
    annualLimit: "AED 5,000,000", premium: "Personalised quote required",
    detail: "Worldwide benefits with standard-suite accommodation. Confirm the full benefit schedule before accepting cover.",
    benefits: ["Inpatient and outpatient benefits", "Optional dental and vision cover"],
    source: healthSources.adnic, international: true,
  },
  {
    id: "sukoon-healthplus", insurer: "Sukoon", name: "HealthPlus", area: "Depends on the selected plan",
    annualLimit: "AED 150,000 to AED 5,000,000 by tier", premium: "Personalised quote required",
    detail: "Six plan options. Ask Sukoon to confirm Abu Dhabi visa compliance, network and geographical cover for the selected option.",
    benefits: ["Six levels of health cover", "Provider access depends on the selected network"],
    source: healthSources.sukoon, international: true,
  },
];

healthPlans.push(...extraHealthPlans);

// These are actual facilities, not a claim that any listed plan covers them.
export const healthHospitals = [
  { id: "cleveland", name: "Cleveland Clinic Abu Dhabi", area: "Al Maryah Island", source: "https://www.clevelandclinicabudhabi.ae/en/patients-and-visitors/visiting-cleveland-clinic-abu-dhabi/how-to-get-here" },
  { id: "mediclinic-airport", name: "Mediclinic Airport Road Hospital", area: "Next to Zayed Sports City", source: "https://www.mediclinic.ae/en/airport-road-hospital/about-us/location-and-contact.html/1000" },
];

export const healthDocuments = [
  "Passport and visa or residence application details",
  "Emirates ID or application details, as accepted by the insurer",
  "Each family member’s date of birth and relationship",
  "The insurer’s application and health declaration",
];

export function healthPlanById(id: string) { return healthPlans.find((plan) => plan.id === id); }

export function validHealthProfile(profile: HealthProfile) {
  return Boolean(profile)
    && ["abu-dhabi", "dubai", "other"].includes(profile.emirate)
    && ["resident", "pending", "visitor"].includes(profile.visa)
    && Number.isInteger(profile.age) && profile.age >= 18 && profile.age <= 100
    && Number.isInteger(profile.dependants) && profile.dependants >= 0 && profile.dependants <= 6
    && ["over5000", "upTo5000"].includes(profile.income)
    && ["yes", "no", "unknown"].includes(profile.employerCover)
    && ["uae", "international"].includes(profile.coverage)
    && (profile.hospital === "none" || healthHospitals.some((hospital) => hospital.id === profile.hospital));
}

export function matchHealthPlans(profile: HealthProfile) {
  if (!validHealthProfile(profile) || profile.visa === "visitor") return [];
  return healthPlans.filter((plan) => {
    if (profile.coverage === "international" && !plan.international) return false;
    if (plan.id === "daman-flexi") {
      return profile.emirate === "abu-dhabi" && profile.income === "over5000" && profile.employerCover === "no";
    }
    return true;
  });
}
