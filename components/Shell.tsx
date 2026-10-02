"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const messageCount = useFile((s) => s.messages.length);
  const started = messageCount > 0;
  const journey = ["/login", "/signup", "/uae-pass", "/profile", "/analysis"].includes(path);
  const viewport = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<"top" | "middle" | "end">("top");

  const syncScrollState = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const maxScroll = Math.max(0, node.scrollHeight - node.clientHeight);
    if (node.scrollTop <= 8) setScrollState("top");
    else if (started && !journey && maxScroll - node.scrollTop <= 96) setScrollState("end");
    else setScrollState("middle");
  }, [journey, started]);

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

  useEffect(() => {
    const frame = window.requestAnimationFrame(syncScrollState);
    return () => window.cancelAnimationFrame(frame);
  }, [path, messageCount, syncScrollState]);

  return (
    <div className="hal-frame">
      <div className="hal-stage">
        {!started && !journey && <HeroBackground />}
        <div
          ref={viewport}
          className="wu-viewport"
          data-view={journey ? "journey" : started ? "conversation" : "landing"}
          data-scroll={scrollState}
          onScroll={syncScrollState}
        >
          {journey ? <JourneyHeader /> : <Bar />}
          <main key={path} className="wu-scroll" style={{ display: "flex", flexDirection: "column" }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
