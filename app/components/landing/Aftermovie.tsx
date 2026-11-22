"use client";

import { useRef, useState } from "react";
import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import "./Aftermovie.css";

export function Aftermovie() {
  const { locale } = useI18n();
  const c = landingCopy[locale].after;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <section className="fwSection fwAfter">
      <div className="fwWrap">
        <p className="fwEyebrow">{c.eyebrow}</p>
        <div className="fwSplitHead">
          <h2>
            {c.title} <em>{c.titleAccent}</em>
          </h2>
          <p className="fwSideText">{c.side}</p>
        </div>
        <div className="fwVideo fwAfterBox">
          <span className="fwRec">{c.rec}</span>
          <video
            ref={videoRef}
            className="fwAfterVideo"
            src="/landingpage/video/Project_intro.mp4"
            controls
            preload="metadata"
            playsInline
            aria-label={c.videoLabel}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
          {!playing && (
            <button type="button" className="fwAfterPlay" onClick={() => videoRef.current?.play()} aria-label={c.play}>
              ▶
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
