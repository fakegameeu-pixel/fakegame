"use client";

import { useRef, useState } from "react";
import "./Aftermovie.css";

export function Aftermovie() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <section className="fwSection fwAfter">
      <div className="fwWrap">
        <p className="fwEyebrow">Aftermovie · 13.02.2026</p>
        <div className="fwSplitHead">
          <h2>
            Kā tas <em>izskatījās</em>
          </h2>
          <p className="fwSideText">Vienā minūtē viss vakars: ceremonija, tosti, dejas un noslēpumi.</p>
        </div>
        <div className="fwVideo fwAfterBox">
          <span className="fwRec">● REC · FAKE WEDDING</span>
          <video
            ref={videoRef}
            className="fwAfterVideo"
            src="/landingpage/video/Project_intro.mp4"
            controls
            preload="metadata"
            playsInline
            aria-label="Aftermovie · 13.02.2026"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
          {!playing && (
            <button type="button" className="fwAfterPlay" onClick={() => videoRef.current?.play()} aria-label="Atskaņot video">
              ▶
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
