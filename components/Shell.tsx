"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bar } from "./Bar";
import { HeroBackground } from "./HeroBackground";
import { useFile } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { useOnboarding } from "@/lib/onboarding-store";
import { JourneyHeader } from "./Onboarding";

export function Shell({ children }: { children: React.ReactNode }) {
  const lang = useFile((s) => s.lang);
  const path = usePathname();
  const started = useFile((s) => s.messages.length > 0);
  const journey = ["/login", "/signup", "/uae-pass", "/profile", "/analysis"].includes(path);

  useEffect(() => {
    void useFile.persist.rehydrate();
    void useAuth.persist.rehydrate();
    void useOnboarding.persist.rehydrate();
    void useFile.getState().checkAI();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div className="hal-frame">
      <div className="hal-stage">
        {!started && !journey && <HeroBackground />}
        <div className="wu-viewport" data-view={journey ? "journey" : started ? "conversation" : "landing"}>
          {journey ? <JourneyHeader /> : <Bar />}
          <main key={path} className="wu-scroll" style={{ display: "flex", flexDirection: "column" }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
