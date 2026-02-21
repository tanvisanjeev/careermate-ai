"use client";
import { useState, useEffect } from "react";

export default function ScoreRing({ score, size = 150 }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisp(score), 80); return () => clearTimeout(t); }, [score]);
  const r = 52, c = 2 * Math.PI * r;
  const col = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Strong Match" : score >= 50 ? "Moderate Match" : "Weak Match";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="9"
            strokeDasharray={c} strokeDashoffset={c * (1 - disp / 100)}
            strokeLinecap="round" transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${col}88)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: col, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, color: "#64748b", marginTop: 2, letterSpacing: "0.05em" }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: col, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}
