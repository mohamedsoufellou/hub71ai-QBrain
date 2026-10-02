"use client";

import { useEffect, useState, useSyncExternalStore, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, FileText, Fingerprint, Globe2, LoaderCircle, MapPin, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { DEMO_EMAIL_CODE, EXAMPLE_PROFILE, UAE_PASS_DEMO_PROFILE, type DemoAuthError } from "@/lib/demo-auth";
import { analyseApplicant, demoPartners, emptyApplicant, goals, sampleApplicant, validateApplicant, type Applicant, type DemoDocument } from "@/lib/onboarding";
import { useOnboarding } from "@/lib/onboarding-store";
import { Mark } from "./Mark";

function subscribeHydration(listener: () => void) {
  const a = useAuth.persist.onFinishHydration(listener);
  const b = useOnboarding.persist.onFinishHydration(listener);
  return () => { a(); b(); };
}
function useReady() {
  return useSyncExternalStore(subscribeHydration, () => useAuth.persist.hasHydrated() && useOnboarding.persist.hasHydrated(), () => false);
}
export function JourneyHeader() {
  const profile = useAuth((state) => state.profile);
  const signOut = useAuth((state) => state.signOut);
  const router = useRouter();
  const path = usePathname();
  const ready = useReady();
  return <header className="journey-header" lang="en" dir="ltr">
    <Link href="/" className="journey-brand"><Mark /><span>wusool</span><i /><span lang="ar">وصول</span></Link>
    <nav aria-label="Account navigation">
      <Link href="/" className="journey-home">Ask Wusool</Link>
      {ready && profile ? <><Link href="/profile" aria-current={path === "/profile" ? "page" : undefined}>My profile</Link><Link href="/analysis" aria-current={path === "/analysis" ? "page" : undefined}>My plan</Link><button onClick={() => { signOut(); router.push("/login"); }}>Sign out</button><span className="journey-avatar" title={profile.name}>{profile.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span></> : <Link href={path === "/login" ? "/signup" : "/login"}>{path === "/login" ? "Create an account" : "Log in"}<ArrowRight size={15} /></Link>}
    </nav>
  </header>;
}
export function AccountLink({ mobile = false }: { mobile?: boolean }) {
  const ready = useReady();
  const profile = useAuth((state) => state.profile);
  return <Link href={ready && profile ? "/profile" : "/login"} className={`journey-account-link journey-account-link-${mobile ? "mobile" : "desktop"}`}>{ready && profile ? "My profile" : "Log in / Sign up"}</Link>;
}
function DemoNote({ children }: { children?: ReactNode }) {
  return <p className="journey-demo-note"><ShieldCheck size={16} /><span>{children ?? "Demo experience. Use sample details; no real identity verification or document submission takes place."}</span></p>;
}
function Loading() { return <div className="journey-loading" role="status"><LoaderCircle size={25} className="journey-spin" />Loading your demo profile…</div>; }
function Protected({ children }: { children: (id: string, name: string) => ReactNode }) {
  const ready = useReady();
  const profile = useAuth((state) => state.profile);
  const router = useRouter();
  useEffect(() => { if (ready && !profile) router.replace("/login"); }, [ready, profile, router]);
  if (!ready || !profile) return <Loading />;
  return <div key={profile.id}>{children(profile.id, profile.name)}</div>;
}
const authErrors: Record<DemoAuthError, string> = { email: "Enter a valid email address.", name: "Enter your full name (2–80 characters).", code: `Use the public demo code ${DEMO_EMAIL_CODE}.`, "unknown-account": "This account is not in this browser yet. Create an account or use the sample login.", duplicate: "This email already has a demo account. Log in instead." };
export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const ready = useReady();
  const router = useRouter();
  const signIn = useAuth((state) => state.signIn);
  const register = useAuth((state) => state.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return <section className="journey-auth journey-page" lang="en" dir="ltr">
    <div className="journey-auth-story"><span className="journey-eyebrow"><span className="journey-flag" /> YOUR NEXT CHAPTER IN THE UAE</span><h1>A new beginning.<br /><em>A clearer path.</em></h1><p>One profile. A plan that understands you. Find the people and services to help you feel at home.</p><div className="journey-auth-steps">{["Tell us a little about yourself", "Build your relocation profile", "Discover your plan & partners"].map((label, index) => <div key={label}><span>0{index + 1}</span>{label}</div>)}</div><div className="journey-location"><MapPin size={16} /> Made for your move to the United Arab Emirates</div></div>
    <div className="journey-auth-card"><span className="journey-eyebrow">LET’S GET YOU STARTED</span><h2>{signup ? "Make yourself at home." : "Welcome back."}</h2><p>{signup ? "Create your demo account to start your UAE journey." : "Log in to build your profile and explore your next steps."}</p>
      <Link href="/uae-pass" className="journey-pass-button" aria-label={signup ? "Sign up with UAE PASS demo" : "Sign in with UAE PASS demo"}>
        {/* Preserve the official button artwork without applying image optimisation. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/branding/uae-pass/sign-${signup ? "up" : "in"}-en-active.svg`} width={signup ? 270 : 264} height={50} alt={signup ? "Sign up with UAE PASS" : "Sign in with UAE PASS"} />
      </Link><small className="journey-pass-caption">Try the simulated UAE PASS experience</small><div className="journey-divider"><span>or continue with email</span></div>
      <form onSubmit={(event) => { event.preventDefault(); setError(""); const result = signup ? register(name, email) : signIn(email, code); if (result.ok) router.push("/profile"); else setError(authErrors[result.error]); }}>
        {signup && <Field label="Full name"><input autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" /></Field>}
        <Field label="Email address"><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></Field>
        {!signup && <Field label="Demo access code" hint={`Public demo code: ${DEMO_EMAIL_CODE}`}><input inputMode="numeric" required autoComplete="off" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter the 6-digit demo code" /></Field>}
        {error && <p className="journey-error" role="alert">{error}</p>}<button className="journey-button journey-button-primary" type="submit" disabled={!ready}>{signup ? "Create demo account" : "Log in"}<ArrowRight size={17} /></button>
      </form>
      {!signup && <button className="journey-text-button journey-sample-login" disabled={!ready} onClick={() => { setEmail(EXAMPLE_PROFILE.email); setCode(DEMO_EMAIL_CODE); setError(""); }}>Use sample login <span>{EXAMPLE_PROFILE.email}</span></button>}
      <p className="journey-auth-switch">{signup ? "Already have an account?" : "New to Wusool?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p><DemoNote />
    </div>
  </section>;
}
export function UaePassPage() {
  const signIn = useAuth((state) => state.signInWithUaePass);
  const ready = useReady();
  const router = useRouter();
  return <section className="journey-pass-page journey-page" lang="en" dir="ltr"><Link href="/login" className="journey-back"><ArrowLeft size={16} />Back to login</Link><div className="journey-pass-card"><div className="journey-pass-emblem"><Fingerprint size={54} strokeWidth={1.1} /></div><span className="journey-eyebrow">UAE PASS · DEMONSTRATION</span><h1>Your identity.<br /><em>Your next chapter.</em></h1><p>Preview the UAE PASS sign-in journey with a fictional identity.</p><div className="journey-identity"><span className="journey-avatar">MH</span><div><strong>{UAE_PASS_DEMO_PROFILE.name}</strong><span>{UAE_PASS_DEMO_PROFILE.email}</span></div><span className="journey-badge">Sample identity</span></div><dl className="journey-pass-details"><div><dt>Sign-in method</dt><dd>Simulated UAE PASS</dd></div><div><dt>Next step</dt><dd>Complete your relocation profile</dd></div></dl><button className="journey-button journey-button-primary" disabled={!ready} onClick={() => { signIn(); router.push("/profile"); }}>Continue as Maya<ArrowRight size={17} /></button><DemoNote>No connection to UAE PASS. This sample identity is fictional and has not been verified.</DemoNote></div></section>;
}
function Field({ label, hint, children, wide = false }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return <label className={`journey-field${wide ? " journey-field-wide" : ""}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
const profileSteps = ["About you", "Documents", "Your background", "Your move", "Review"];
function DocumentUpload({ label, document, onChange }: { label: string; document: DemoDocument | null; onChange: (value: DemoDocument | null) => void }) {
  const [error, setError] = useState("");
  function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    event.target.value = "";
    if (!/\.(pdf|jpe?g|png|docx)$/i.test(file.name)) { setError("Choose a PDF, JPG, PNG or DOCX file."); return; }
    if (file.size > 10 * 1024 * 1024 || file.size === 0) { setError("Choose a non-empty file under 10 MB."); return; }
    setError(""); onChange({ name: file.name, size: file.size, sample: false });
  }
  return <div className="journey-upload-group"><h3>{label}</h3>{document ? <div className="journey-document"><FileText size={28} /><div><strong>{document.name}</strong><span>{Math.max(1, Math.round(document.size / 1024))} KB · {document.sample ? "Sample document" : "Selected locally"}</span></div><button type="button" aria-label={`Remove ${label}`} onClick={() => onChange(null)}><X size={18} /></button></div> : <label className="journey-upload"><Upload size={26} /><strong>Select {label.toLowerCase()}</strong><span>PDF, JPG, PNG or DOCX · up to 10 MB</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={choose} /></label>}<button type="button" className="journey-text-button" onClick={() => { setError(""); onChange({ name: `sample-${label === "Passport" ? "passport" : "cv"}.pdf`, size: 128000, sample: true }); }}>Use a sample {label === "Passport" ? "passport" : "CV"}<ArrowRight size={14} /></button>{error && <p className="journey-error" role="alert">{error}</p>}</div>;
}
export function ProfilePage() { return <Protected>{(id, name) => <ProfileForm id={id} name={name} />}</Protected>; }
function ProfileForm({ id, name }: { id: string; name: string }) {
  const saved = useOnboarding((state) => state.applicants[id]);
  const save = useOnboarding((state) => state.save);
  const finish = useOnboarding((state) => state.finish);
  const [profile, setProfile] = useState<Applicant>(() => saved ?? emptyApplicant(name));
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();
  const sectionComplete = analyseApplicant(profile).checks;
  function update<K extends keyof Applicant>(key: K, value: Applicant[K]) { const next = { ...profile, [key]: value }; setProfile(next); save(id, next); }
  function changeStep(next: number) { setStep(next); setError(""); document.querySelector(".wu-viewport")?.scrollTo({ top: 0, behavior: "instant" }); }
  function submit() {
    save(id, profile);
    if (step < 4) { changeStep(step + 1); return; }
    const invalid = validateApplicant(profile);
    if (invalid) { changeStep(invalid.step); setError(invalid.message); return; }
    finish(id); router.push("/analysis");
  }
  return <section className="journey-page journey-profile" lang="en" dir="ltr"><div className="journey-page-heading"><div><span className="journey-eyebrow">A LITTLE ABOUT YOU. A LOT OF POSSIBILITIES.</span><h1>Make your next move <em>yours.</em></h1><p>Your background, your documents, your ambitions. Let’s bring them together.</p></div><button className="journey-button journey-button-secondary" onClick={() => { const sample = sampleApplicant(name); setProfile(sample); save(id, sample); setError(""); }}> <Sparkles size={17} />Fill with sample data</button></div>
    <div className="journey-profile-layout"><aside className="journey-profile-sidebar"><ol className="journey-stepper">{profileSteps.map((label, index) => <li key={label} data-active={step === index} data-done={sectionComplete[index] && step !== index}><button onClick={() => changeStep(index)} aria-current={step === index ? "step" : undefined}><span>{sectionComplete[index] && step !== index ? <Check size={16} /> : `0${index + 1}`}</span><div>{label}<small>{["Personal & residency details", "Passport & CV", "Experience & ambitions", "Lifestyle & preferences", "Ready for your next chapter"][index]}</small></div></button></li>)}</ol><div className="journey-sidebar-note"><Globe2 size={26} /><h3>A plan built around you.</h3><p>Your information helps us suggest relevant services and explain why they fit.</p><span>Demo drafts stay in this browser tab. Selected files are never uploaded or read.</span></div></aside>
    <div className="journey-profile-content"><form onSubmit={(event) => { event.preventDefault(); submit(); }}><div className="journey-form-heading"><span className="journey-eyebrow">STEP 0{step + 1} / 05</span><h2>{["First, the introductions.", "Bring your story with you.", "More than a job title.", "What does home look like?", "Your story, together."][step]}</h2><p>{["Tell us who you are and where you want to be.", "Choose sample documents or select local files for this demo.", "Help us understand your experience and what comes next.", "Set your timeline, budget and the things that matter to you.", "Review your information before we create your suggestions."][step]}</p></div>
    {step === 0 && <div className="journey-fields"><Field label="Full name *"><input required minLength={2} maxLength={80} value={profile.name} onChange={(e) => update("name", e.target.value)} /></Field><Field label="Nationality *"><input required maxLength={80} value={profile.nationality} placeholder="e.g. Egyptian" onChange={(e) => update("nationality", e.target.value)} /></Field><Field label="Date of birth *"><input required type="date" value={profile.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => update("birthDate", e.target.value)} /></Field><Field label="Phone number" hint="Optional in this demo"><input type="tel" value={profile.phone} placeholder="+971 50 000 0000" onChange={(e) => update("phone", e.target.value)} /></Field><Field label="Current residency"><select value={profile.residence} onChange={(e) => update("residence", e.target.value)}>{["Outside the UAE", "UAE visitor", "UAE resident", "Residency in progress"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Preferred emirate"><select value={profile.emirate} onChange={(e) => update("emirate", e.target.value)}>{["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map((item) => <option key={item}>{item}</option>)}</select></Field></div>}
    {step === 1 && <><div className="journey-upload-grid"><DocumentUpload label="Passport" document={profile.passport} onChange={(value) => update("passport", value)} /><DocumentUpload label="CV / résumé" document={profile.cv} onChange={(value) => update("cv", value)} /></div><div className="journey-fields"><Field label="Passport number" hint="Use a fictional number, e.g. DEMO123456"><input maxLength={30} value={profile.passportNumber} placeholder="DEMO123456" onChange={(e) => update("passportNumber", e.target.value)} /></Field><Field label="Passport expiry date"><input type="date" value={profile.passportExpiry} onChange={(e) => update("passportExpiry", e.target.value)} /></Field></div><DemoNote>Only file names and sizes are retained in this demo. Document contents are not read, uploaded or verified. You can continue without documents and see what is missing.</DemoNote></>}
    {step === 2 && <div className="journey-fields"><Field label="Occupation / role *"><input required maxLength={120} value={profile.occupation} placeholder="e.g. Product designer" onChange={(e) => update("occupation", e.target.value)} /></Field><Field label="Employment status"><select value={profile.employment} onChange={(e) => update("employment", e.target.value)}>{["Employed", "Founder / self-employed", "Looking for a role", "Student"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Years of experience"><input type="number" min={0} max={70} value={profile.experience} onChange={(e) => update("experience", Number(e.target.value))} /></Field><Field label="Highest education"><select value={profile.education} onChange={(e) => update("education", e.target.value)}>{["High school", "Diploma", "Bachelor’s degree", "Master’s degree", "Doctorate", "Other"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field wide label="Skills & expertise"><input maxLength={300} value={profile.skills} placeholder="e.g. Product design, research, leadership" onChange={(e) => update("skills", e.target.value)} /></Field><Field wide label="Tell us about yourself *" hint="At least 20 characters. Share your background, ambitions and what you need help with."><textarea required minLength={20} maxLength={2000} rows={5} value={profile.description} placeholder="I’m moving to the UAE because…" onChange={(e) => update("description", e.target.value)} /></Field></div>}
    {step === 3 && <><div className="journey-fields"><Field label="Planned move date *"><input required type="date" value={profile.moveDate} onChange={(e) => update("moveDate", e.target.value)} /></Field><Field label="Number of dependants"><input type="number" min={0} max={20} value={profile.dependants} onChange={(e) => update("dependants", Number(e.target.value))} /></Field><Field label="Monthly income (AED)"><input type="number" min={0} max={10000000} step={100} value={profile.salary || ""} placeholder="24000" onChange={(e) => update("salary", Number(e.target.value))} /></Field><Field label="Annual housing budget (AED) *"><input required type="number" min={1} max={10000000} value={profile.housingBudget || ""} placeholder="120000" onChange={(e) => update("housingBudget", Number(e.target.value))} /></Field><Field label="Bedrooms"><select value={profile.bedrooms} onChange={(e) => update("bedrooms", Number(e.target.value))}>{[0, 1, 2, 3, 4, 5].map((n) => <option value={n} key={n}>{n === 0 ? "Studio" : `${n} bedroom${n > 1 ? "s" : ""}`}</option>)}</select></Field></div><fieldset className="journey-goals"><legend>What would you like help with? *</legend><div>{goals.map((goal) => <label key={goal} data-selected={profile.goals.includes(goal)}><input type="checkbox" checked={profile.goals.includes(goal)} onChange={() => update("goals", profile.goals.includes(goal) ? profile.goals.filter((item) => item !== goal) : [...profile.goals, goal])} /><span>{goal}</span></label>)}</div></fieldset></>}
    {step === 4 && <ProfileSummary profile={profile} edit={changeStep} />}
    {error && <p className="journey-error" role="alert">{error}</p>}<div className="journey-form-footer">{step > 0 ? <button type="button" className="journey-text-button" onClick={() => changeStep(step - 1)}><ArrowLeft size={16} />Back</button> : <span className="journey-required">* Required fields</span>}<button type="submit" className="journey-button journey-button-primary">{step === 4 ? "Analyse my profile" : "Save & continue"}{step === 4 ? <Sparkles size={17} /> : <ArrowRight size={17} />}</button></div></form></div></div></section>;
}
function ProfileSummary({ profile, edit }: { profile: Applicant; edit?: (step: number) => void }) {
  const sections = [
    { title: "Personal details", step: 0, items: [["Name", profile.name], ["Nationality", profile.nationality], ["Date of birth", profile.birthDate], ["Phone", profile.phone], ["Residency", profile.residence], ["Emirate", profile.emirate]] },
    { title: "Documents", step: 1, items: [["Passport", profile.passport?.name], ["Passport number", profile.passportNumber ? `••••${profile.passportNumber.slice(-4)}` : ""], ["Expires", profile.passportExpiry], ["CV", profile.cv?.name]] },
    { title: "Background", step: 2, items: [["Occupation", profile.occupation], ["Employment", profile.employment], ["Experience", `${profile.experience} years`], ["Education", profile.education], ["Skills", profile.skills], ["Description", profile.description]] },
    { title: "Your move", step: 3, items: [["Move date", profile.moveDate], ["Dependants", String(profile.dependants)], ["Income", `AED ${profile.salary.toLocaleString("en-US")} / month`], ["Housing budget", `AED ${profile.housingBudget.toLocaleString("en-US")} / year`], ["Bedrooms", profile.bedrooms === 0 ? "Studio" : String(profile.bedrooms)], ["Goals", profile.goals.join(", ")]] },
  ];
  return <div className="journey-summary">{sections.map((section) => <section key={section.title}><header><h3>{section.title}</h3>{edit && <button type="button" className="journey-text-button" onClick={() => edit(section.step)}>Edit<ArrowRight size={14} /></button>}</header><dl>{section.items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || <span className="journey-missing">Not provided</span>}</dd></div>)}</dl></section>)}</div>;
}
export function AnalysisPage() { return <Protected>{(id, name) => <Analysis id={id} name={name} />}</Protected>; }
function Analysis({ id, name }: { id: string; name: string }) {
  const profile = useOnboarding((state) => state.applicants[id]);
  const completed = useOnboarding((state) => state.completed[id]);
  const saved = useOnboarding((state) => state.saved[id]) ?? [];
  const togglePartner = useOnboarding((state) => state.togglePartner);
  const [category, setCategory] = useState("All partners");
  const [search, setSearch] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!profile || !completed) return <section className="journey-page journey-empty" lang="en" dir="ltr"><Sparkles size={42} /><h1>Your next chapter starts with you.</h1><p>Complete and review your profile to see your analysis and partner suggestions.</p><Link href="/profile" className="journey-button journey-button-primary">Complete my profile<ArrowRight size={17} /></Link></section>;
  const analysis = analyseApplicant(profile);
  const recommended = analysis.partners.filter((partner) => partner.recommended);
  const visible = analysis.partners.filter((partner) => (category === "All partners" || partner.category === category) && (!onlySaved || saved.includes(partner.id)) && `${partner.name} ${partner.category} ${partner.description}`.toLowerCase().includes(search.toLowerCase()));
  const categories = ["All partners", ...new Set(demoPartners.map((partner) => partner.category))];
  return <section className="journey-page journey-analysis" lang="en" dir="ltr"><div className="journey-page-heading"><div><span className="journey-eyebrow"><Sparkles size={14} /> YOUR PROFILE, CONNECTED</span><h1>A clearer path, <em>{name.split(" ")[0]}.</em></h1><p>Your {profile.emirate} plan, shaped around what matters to you.</p></div><Link href="/profile" className="journey-button journey-button-secondary">Edit my profile<ArrowRight size={16} /></Link></div><div className="journey-analysis-banner"><ShieldCheck size={18} /><p>Demo analysis based on the details you entered. Documents are not read or verified. Every partner below is fictional; fit scores show demo preferences, not eligibility or availability.</p></div>
    <div className="journey-analysis-overview"><div className="journey-readiness"><div className="journey-score-circle" style={{ background: `conic-gradient(#3b685b ${analysis.completeness}%, #e8e1d5 0)` }}><div><strong>{analysis.completeness}<small>%</small></strong><span>profile readiness</span></div></div><div><span className="journey-eyebrow">YOUR PROFILE AT A GLANCE</span><h2>{analysis.completeness === 100 ? "Ready for the next step." : "A few details to bring together."}</h2><p>{recommended.length} relevant demo partners across your selected goals.</p><div className="journey-meta"><span><MapPin size={14} />{profile.emirate}</span><span>{profile.moveDate}</span><span>{profile.dependants + 1} person(s)</span></div></div></div><div className="journey-stat"><span>Annual housing budget</span><strong><small>AED</small> {profile.housingBudget.toLocaleString("en-US")}</strong><p>{profile.bedrooms === 0 ? "Studio" : `${profile.bedrooms} bedroom(s)`} · {profile.emirate}</p></div></div>
    <div className="journey-analysis-columns"><section className="journey-insights"><span className="journey-eyebrow">WHAT YOUR INFORMATION TELLS US</span><h2>Everything, in perspective.</h2>{[
      { title: "Identity & residency", ok: analysis.checks[0], text: `${profile.nationality} · ${profile.residence}. ${analysis.passportFlag}. These dates are self-reported.` },
      { title: "Your documents", ok: analysis.checks[1] && Boolean(profile.cv), text: `Passport: ${profile.passport ? "attached" : "missing"}. CV: ${profile.cv ? "attached" : "missing"}. ${profile.passport && profile.cv ? "Both are ready for a future document review." : "Add missing documents to strengthen your brief."}` },
      { title: "Professional background", ok: analysis.checks[2], text: `${profile.occupation} · ${profile.experience} years of experience · ${profile.education}. ${profile.skills ? `Your listed strengths: ${profile.skills}.` : "Add skills to improve career matching."}` },
      { title: "Lifestyle & budget", ok: analysis.checks[3], text: `${profile.dependants + 1} person(s), ${profile.bedrooms === 0 ? "a studio" : `${profile.bedrooms} bedrooms`}, AED ${Math.round(profile.housingBudget / 12).toLocaleString("en-US")} housing budget per month.${profile.salary > 0 ? ` This is ${Math.round(profile.housingBudget / 12 / profile.salary * 100)}% of your entered monthly income; other living costs are not included.` : " Add income to compare housing costs with your budget."}` },
    ].map((item) => <article className="journey-insight" key={item.title}>{item.ok ? <CheckCircle2 size={21} className="journey-green" /> : <FileText size={21} className="journey-gold" />}<div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}<details className="journey-full-profile"><summary>View all the information you provided</summary><ProfileSummary profile={profile} /></details></section><section className="journey-next-steps"><span className="journey-eyebrow">FROM INFORMATION TO ACTION</span><h2>Your suggested next steps.</h2><ol>{analysis.nextSteps.map((action, index) => <li key={action}><span>0{index + 1}</span><p>{action}</p></li>)}</ol><p className="journey-method">Readiness = four completed profile sections, each worth 25%. Passport readiness uses the expiry date you entered and a six-month demo planning threshold.</p></section></div>
    <section className="journey-partner-section"><div className="journey-partner-heading"><div><span className="journey-eyebrow">GOOD CONNECTIONS. BETTER BEGINNINGS.</span><h2>Meet your suggested partners.</h2><p>Explore all {demoPartners.length} demo partners, ordered by fit to your profile.</p></div><button className="journey-button journey-button-secondary" aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><Bookmark size={16} fill={onlySaved ? "currentColor" : "none"} />{onlySaved ? "Show all partners" : `Saved partners (${saved.length})`}</button></div><div className="journey-partner-toolbar"><div className="journey-filter-tabs" aria-label="Filter partners by service">{categories.map((item) => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="journey-partner-search"><span className="hal-hidden-visually">Search partners</span><input type="search" placeholder="Search partners…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div><div className="journey-partner-grid">{visible.map((partner) => <article className="journey-partner-card" key={partner.id}><header><span className="journey-partner-logo" style={{ color: partner.color, backgroundColor: `${partner.color}12` }}>{partner.initials}</span><span className="journey-fit">{partner.score}% demo fit</span></header><span className="journey-eyebrow">{partner.category} · FICTIONAL PARTNER</span><h3>{partner.name}</h3><p>{partner.description}</p><div className="journey-partner-location"><MapPin size={13} />{partner.emirates.includes("All") ? "Across the UAE" : partner.emirates.join(" & ")}</div>{partner.recommended && <div className="journey-recommended"><Sparkles size={13} /> Suggested for your goals</div>}<footer><button className="journey-text-button" aria-expanded={expanded === partner.id} onClick={() => setExpanded(expanded === partner.id ? null : partner.id)}>Why this match?<ArrowRight size={14} /></button><button className="journey-save-partner" aria-label={`${saved.includes(partner.id) ? "Unsave" : "Save"} ${partner.name}`} aria-pressed={saved.includes(partner.id)} onClick={() => togglePartner(id, partner.id)}><Bookmark size={18} fill={saved.includes(partner.id) ? "currentColor" : "none"} /></button></footer>{expanded === partner.id && <div className="journey-match-reasons"><ul>{partner.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><small>Score: location (30), selected goal (45), plus relevant background and document signals (up to 25). Capped at 100.</small></div>}</article>)}</div>{visible.length === 0 && <div className="journey-no-results"><h3>No partners match these filters.</h3><button className="journey-text-button" onClick={() => { setCategory("All partners"); setSearch(""); setOnlySaved(false); }}>Clear filters<ArrowRight size={15} /></button></div>}</section><DemoNote>Your plan is saved for this browser tab. You can edit your profile and analyse it again whenever your plans change.</DemoNote></section>;
}
