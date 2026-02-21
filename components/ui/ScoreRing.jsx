"use client";
import { useState, useEffect } from "react";

export default function ScoreRing({ score, size = 150 }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisp(score), 100); return () => clearTimeout(t); }, [score]);
  const r = 54, c = 2 * Math.PI * r;
  const col = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Strong Match" : score >= 50 ? "Partial Match" : "Weak Match";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="10"
            strokeDasharray={c} strokeDashoffset={c * (1 - disp / 100)}
            strokeLinecap="round" transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${col})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: col, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, color: "#888", marginTop: 2 }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: col, letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}
