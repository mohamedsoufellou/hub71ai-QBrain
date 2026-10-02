"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useT } from "./ui";

export function HeroBackground() {
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const t = useT();

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function syncPlayback() {
      if (motion.matches || document.hidden || userPaused.current) player?.pause();
      else void player?.play().catch(() => undefined);
    }
    syncPlayback();
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      player.pause();
    };
  }, []);

  return (
    <>
      <div className="wu-hero-background" aria-hidden="true">
        <video ref={video} muted loop playsInline preload="metadata" poster="/videos/wusool-hero-poster.jpg" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} tabIndex={-1}>
          <source src="/videos/wusool-hero.mp4" type="video/mp4" />
        </video>
      </div>
      <button
        type="button"
        className="wu-background-control"
        aria-label={playing ? t("Pause background video", "أوقف فيديو الخلفية") : t("Play background video", "شغّل فيديو الخلفية")}
        title={playing ? t("Pause background video", "أوقف فيديو الخلفية") : t("Play background video", "شغّل فيديو الخلفية")}
        onClick={() => {
          if (!video.current) return;
          userPaused.current = !video.current.paused;
          if (userPaused.current) video.current.pause();
          else void video.current.play().catch(() => undefined);
        }}
      >
        {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
      </button>
    </>
  );
}
