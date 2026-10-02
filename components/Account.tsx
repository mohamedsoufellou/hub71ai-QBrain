"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Fingerprint, LogOut, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-store";
import { DEMO_EMAIL_CODE, EXAMPLE_PROFILE, type DemoAuthError } from "@/lib/demo-auth";
import { useFile } from "@/lib/store";
import { Mark } from "./Mark";
import styles from "./Account.module.css";

type View = "closed" | "login" | "register" | "uae" | "success" | "account";

export function Account() {
  const ar = useFile((s) => s.lang) === "ar";
  const act = useFile((s) => s.act);
  const responding = useFile((s) => s.pending || s.playback !== null);
  const profile = useAuth((s) => s.profile);
  const signIn = useAuth((s) => s.signIn);
  const register = useAuth((s) => s.register);
  const signInWithUaePass = useAuth((s) => s.signInWithUaePass);
  const signOut = useAuth((s) => s.signOut);
  const [view, setView] = useState<View>("closed");
  const [returnView, setReturnView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<DemoAuthError | null>(null);
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const focusTarget = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const noteId = useId();
  const codeHintId = useId();
  const t = (en: string, arabic: string) => ar ? arabic : en;

  useEffect(() => { void useAuth.persist.rehydrate(); }, []);

  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    if (view === "closed") {
      if (current.open) current.close();
    } else {
      if (!current.open) current.showModal();
      focusTarget.current?.focus();
    }
  }, [view]);

  function changeView(next: View) {
    setError(null);
    setNotice("");
    setCode("");
    setView(next);
  }

  function complete() {
    setCode("");
    setError(null);
    setView("success");
  }

  const errors: Record<DemoAuthError, string> = {
    email: t("Enter a valid demo email address.", "أدخل بريداً إلكترونياً تجريبياً صحيحاً."),
    name: t("Enter a name between 2 and 80 characters.", "أدخل اسماً بين حرفين و٨٠ حرفاً."),
    code: t(`Use ${DEMO_EMAIL_CODE}, the code for this demonstration.`, `استخدم ${DEMO_EMAIL_CODE}، رمز هذا العرض التجريبي.`),
    "unknown-account": t("This demo account hasn’t been created. Register, or use the sample account.", "لم يُنشأ هذا الحساب التجريبي. سجّل أو استخدم الحساب النموذجي."),
    duplicate: t("This demo email already has an account. Sign in with the demo code.", "يوجد حساب لهذا البريد التجريبي. سجّل الدخول بالرمز التجريبي."),
  };
  const initials = profile?.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("");
  const isForm = view === "login" || view === "register";
  const isProfile = view === "success" || view === "account";

  return (
    <>
      <button type="button" className="hal-btn hal-btn--ghost wu-nav-icon" aria-label={profile ? t(`Account, ${profile.name}`, `الحساب، ${profile.name}`) : t("Sign in or register", "تسجيل الدخول أو إنشاء حساب")} title={profile ? t("My account", "حسابي") : t("Sign in / Register", "تسجيل الدخول / إنشاء حساب")} onClick={() => changeView(profile ? "account" : "login")}>
        {profile ? <span className={styles.avatar}>{initials}</span> : <UserRound size={23} strokeWidth={1.6} aria-hidden />}
      </button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={noteId} onCancel={() => setView("closed")} onClose={() => setView("closed")} onClick={(event) => { if (event.target === dialog.current) setView("closed"); }}>
        {view !== "closed" && <div className={styles.layout}>
          <aside className={styles.visual} aria-hidden="true">
            <div className={styles.brand} dir="ltr"><Mark size={34} /><span>wusool</span><i /><span lang="ar" className={styles.arabic}>وصول</span></div>
            <div className={styles.visualCopy}>
              <p>{t("Your move,\nall together", "رحلتك،\nفي مكان واحد")}</p>
              <span>{t("A home, a fresh start, and a little less to think about.", "سكن وبداية جديدة، وخطوات أسهل.")}</span>
            </div>
          </aside>
          <section className={styles.content}>
            <button type="button" className={styles.close} aria-label={t("Close account dialog", "إغلاق نافذة الحساب")} onClick={() => setView("closed")}><X size={21} strokeWidth={1.6} aria-hidden /></button>
            {isForm && <>
              <nav className={styles.tabs} aria-label={t("Account options", "خيارات الحساب")}>
                <button type="button" aria-current={view === "login" ? "page" : undefined} onClick={() => changeView("login")}>{t("Sign in", "تسجيل الدخول")}</button>
                <button type="button" aria-current={view === "register" ? "page" : undefined} onClick={() => changeView("register")}>{t("Register", "إنشاء حساب")}</button>
              </nav>
              <header className={styles.heading}>
                <h2 id={titleId}>{view === "login" ? t("Welcome back", "أهلاً بعودتك") : t("Your next chapter", "بدايتك الجديدة")}</h2>
                <p>{view === "login" ? t("Pick up where your move left off.", "أكمل رحلتك من حيث توقفت.") : t("Create a Wusool demo account to try the journey.", "أنشئ حساباً تجريبياً في وصول لتجربة رحلتك.")}</p>
              </header>
              <button type="button" className={styles.passButton} aria-label={view === "register" ? t("Sign up with UAE PASS", "إنشاء حساب باستخدام الهوية الرقمية") : t("Sign in with UAE PASS", "تسجيل الدخول باستخدام الهوية الرقمية")} onClick={() => { setReturnView(view === "register" ? "register" : "login"); changeView("uae"); }}>
                <Image src={`/branding/uae-pass/${view === "register" ? "sign-up" : "sign-in"}-${ar ? "ar" : "en"}-active.svg`} alt="" width={ar ? view === "register" ? 284 : 304 : view === "register" ? 270 : 264} height={50} unoptimized />
              </button>
              <div className={styles.divider}><span>{t("or use a demo email", "أو استخدم بريداً تجريبياً")}</span></div>
              <form className={styles.form} onSubmit={(event) => {
                event.preventDefault();
                const result = view === "register" ? register(name, email) : signIn(email, code);
                if (result.ok) complete(); else setError(result.error);
              }}>
                {view === "register" && <label>{t("Demo name", "الاسم التجريبي")}<input ref={(node) => { focusTarget.current = node; }} name="demo-name" autoComplete="off" value={name} placeholder={t("e.g. Alex Morgan", "مثال: أحمد حسن")} required minLength={2} maxLength={80} aria-invalid={error === "name" || undefined} onChange={(e) => { setName(e.target.value); setError(null); }} /></label>}
                <label>{t("Demo email", "البريد التجريبي")}<input ref={view === "login" ? (node) => { focusTarget.current = node; } : undefined} name="demo-email" type="email" autoComplete="off" value={email} placeholder="you@example.com" dir="ltr" required maxLength={254} aria-invalid={error === "email" || error === "unknown-account" || error === "duplicate" || undefined} onChange={(e) => { setEmail(e.target.value); setError(null); }} /></label>
                {view === "login" && <label>{t("Demo code", "الرمز التجريبي")}<input name="demo-code" aria-label={t("Demo code", "الرمز التجريبي")} aria-describedby={codeHintId} autoComplete="off" inputMode="numeric" value={code} placeholder={DEMO_EMAIL_CODE} dir="ltr" required maxLength={6} aria-invalid={error === "code" || undefined} onChange={(e) => { setCode(e.target.value); setError(null); }} /><small id={codeHintId}>{t(`Use ${DEMO_EMAIL_CODE}. No email or SMS is sent.`, `استخدم ${DEMO_EMAIL_CODE}. لن تُرسل رسالة أو بريد.`)}</small></label>}
                {error && <p className={styles.error} role="alert">{errors[error]}</p>}
                {notice && <p className={styles.notice} role="status">{notice}</p>}
                <button type="submit" className={`${styles.primary} hal-btn hal-btn--primary`}>{view === "register" ? t("Create demo account", "إنشاء حساب تجريبي") : t("Sign in to the demo", "الدخول إلى العرض التجريبي")}<ArrowRight size={17} strokeWidth={1.6} aria-hidden /></button>
              </form>
              {view === "login" && <button type="button" className={styles.textButton} onClick={() => { setEmail(EXAMPLE_PROFILE.email); setCode(DEMO_EMAIL_CODE); setError(null); setNotice(t("Sample account ready. Choose Sign in to continue.", "الحساب النموذجي جاهز. اختر تسجيل الدخول للمتابعة.")); }}>{t("Fill sample account", "تعبئة الحساب النموذجي")}</button>}
            </>}
            {view === "uae" && <>
              <button type="button" className={styles.back} onClick={() => changeView(returnView)}><ArrowLeft size={17} aria-hidden />{t("Back", "رجوع")}</button>
              <header className={styles.heading}>
                <h2 ref={(node) => { focusTarget.current = node; }} tabIndex={-1} id={titleId}>{t("UAE PASS preview", "تجربة الهوية الرقمية")}</h2>
                <p>{t("Preview an approval request for Wusool using a sample identity.", "جرّب طلب الموافقة لوصول باستخدام هوية نموذجية.")}</p>
              </header>
              <div className={styles.request}>
                <div className={styles.requestTitle}><Fingerprint size={26} strokeWidth={1.7} aria-hidden /><span>{t("Demo sign-in request", "طلب دخول تجريبي")}</span></div>
                <p>{t("Wusool would receive your name and email.", "سيحصل وصول على اسمك وبريدك الإلكتروني.")}</p>
                <dl className={styles.details}><div><dt>{t("Sample name", "الاسم النموذجي")}</dt><dd>{EXAMPLE_PROFILE.name}</dd></div><div><dt>{t("Sample email", "البريد النموذجي")}</dt><dd dir="ltr">{EXAMPLE_PROFILE.email}</dd></div></dl>
              </div>
              <button type="button" className={`${styles.primary} hal-btn hal-btn--primary`} onClick={() => { signInWithUaePass(); complete(); }}>{t("Approve demo sign-in", "الموافقة على الدخول التجريبي")}<Check size={18} aria-hidden /></button>
              <button type="button" className={styles.textButton} onClick={() => { changeView(returnView); setNotice(t("Demo request cancelled. You’re still a guest.", "أُلغي الطلب التجريبي. ما زلت تتصفح كضيف.")); }}>{t("Decline request", "رفض الطلب")}</button>
            </>}
            {isProfile && profile && <>
              <div className={styles.profileAvatar} aria-hidden>{initials}</div>
              <header className={styles.heading}>
                <h2 ref={(node) => { focusTarget.current = node; }} tabIndex={-1} id={titleId}>{view === "success" ? t(`You’re in, ${profile.name.split(" ")[0]}`, `أهلاً بك، ${profile.name.split(" ")[0]}`) : t(`Hello, ${profile.name.split(" ")[0]}`, `مرحباً، ${profile.name.split(" ")[0]}`)}</h2>
                <p>{t("Your Wusool demo account is ready.", "حسابك التجريبي في وصول جاهز.")}</p>
              </header>
              <dl className={styles.details}><div><dt>{t("Name", "الاسم")}</dt><dd>{profile.name}</dd></div><div><dt>{t("Email", "البريد الإلكتروني")}</dt><dd dir="ltr">{profile.email}</dd></div><div><dt>{t("Signed in with", "طريقة الدخول")}</dt><dd>{profile.method === "uae-pass" ? t("UAE PASS simulation", "محاكاة الهوية الرقمية") : t("Demo email", "بريد تجريبي")}</dd></div></dl>
              <button type="button" className={`${styles.primary} hal-btn hal-btn--primary`} onClick={() => setView("closed")}>{t("Continue my move", "أكمل رحلتي")}<ArrowRight size={17} aria-hidden /></button>
              <div className={styles.accountActions}><button type="button" className={styles.textButton} disabled={responding} onClick={() => { setView("closed"); act({ a: "topic", topic: "file" }, t("Show my file", "اعرض ملفي")); }}>{t("My file", "ملفي")}</button><button type="button" className={styles.textButton} onClick={() => { signOut(); changeView("login"); setEmail(""); setNotice(t("Signed out. Your demo plans are still here.", "تم تسجيل الخروج. خططك التجريبية محفوظة.")); }}><LogOut size={15} aria-hidden />{t("Sign out", "تسجيل الخروج")}</button></div>
            </>}
            <p id={noteId} className={styles.demoNote}>{view === "uae" ? t("Simulation only. No UAE PASS app, Emirates ID or real identity verification is used.", "محاكاة فقط. لا تُستخدم تطبيقات الهوية الرقمية أو الهوية الإماراتية أو أي تحقق فعلي.") : t("Demo only. Use sample details. Your demo profile stays in this browser.", "عرض تجريبي فقط. استخدم بيانات نموذجية. يبقى ملفك التجريبي في هذا المتصفح.")}</p>
          </section>
        </div>}
      </dialog>
    </>
  );
}
