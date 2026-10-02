import { BriefcaseBusiness, Building2, CarFront, Hotel, House } from "lucide-react";

const marks: Record<string, { bg: string; fg: string; text: string }> = {
  bayut: { bg: "#00A859", fg: "#ffffff", text: "bayut" },
  finder: { bg: "#E10600", fg: "#ffffff", text: "finder" },
  asteco: { bg: "#0B1F3A", fg: "#ffffff", text: "Asteco" },
  etihad: { bg: "#1A1A1A", fg: "#C4A35A", text: "Etihad" },
  booking: { bg: "#003580", fg: "#ffffff", text: "Booking" },
  skyscanner: { bg: "#0770E3", fg: "#ffffff", text: "sky" },
  kayak: { bg: "#FF690F", fg: "#ffffff", text: "KAYAK" },
  trivago: { bg: "#005C6A", fg: "#F5C518", text: "trivago" },
  expedia: { bg: "#1A1A1A", fg: "#FBCC33", text: "Expedia" },
  careem: { bg: "#111111", fg: "#47D16C", text: "Careem" },
  uber: { bg: "#000000", fg: "#ffffff", text: "Uber" },
  blacklane: { bg: "#161616", fg: "#C6A15B", text: "Blacklane" },
  tamm: { bg: "#0B3A2E", fg: "#ffffff", text: "ICP" },
  icp: { bg: "#0B3A2E", fg: "#ffffff", text: "ICP" },
  seha: { bg: "#0E7C66", fg: "#ffffff", text: "SEHA" },
  capital: { bg: "#123A63", fg: "#ffffff", text: "Capital" },
  burjeel: { bg: "#7A1F3D", fg: "#ffffff", text: "Burjeel" },
  fab: { bg: "#0033A0", fg: "#ffffff", text: "FAB" },
  adcb: { bg: "#E30613", fg: "#ffffff", text: "ADCB" },
  wio: { bg: "#4B2BBF", fg: "#ffffff", text: "Wio" },
  emaratax: { bg: "#0F6B3C", fg: "#ffffff", text: "EmaraTax" },
  cranleigh: { bg: "#1F3A5F", fg: "#F6F0E6", text: "Cranleigh" },
  yasmina: { bg: "#0E6B4F", fg: "#ffffff", text: "Yasmina" },
  brighton: { bg: "#0C2340", fg: "#E8C872", text: "Brighton" },
  repton: { bg: "#6B1D2A", fg: "#ffffff", text: "Repton" },
  acs: { bg: "#1A365D", fg: "#ffffff", text: "ACS" },
  adnoc: { bg: "#007A33", fg: "#ffffff", text: "ADNOC" },
};

export function PartnerLogo({ id }: { id: string }) {
  const canonical = id === "fab-islamic" ? "fab" : id === "etihad-flex" ? "etihad" : id.startsWith("capital-") ? "capital" : id;
  const mark = marks[canonical];
  if (!mark) {
    const Icon = id.startsWith("hotel-") ? Hotel : id === "landlord" ? House : id === "airport-taxi" ? CarFront : id === "licensed-agent" ? Building2 : BriefcaseBusiness;
    return <span className="wu-logo" aria-hidden="true" style={{ background: "#f0ebe2", color: "#2b6a88" }}><Icon size={24} strokeWidth={1.4} /></span>;
  }
  return (
    <span className="wu-logo" style={{ background: mark.bg, color: mark.fg }}>
      {mark.text}
    </span>
  );
}
