"use client";
import { useState } from "react";
import StudentView from "./StudentView";
import RecruiterView from "./RecruiterView";

const C = {
  bg: "#0a0c12",
  surface: "#0f1117",
  border: "rgba(255,255,255,0.07)",
  text: "#e2e8f0",
  muted: "#64748b",
  accent: "#6366f1",
  accentMuted: "rgba(99,102,241,0.12)",
  green: "#10b981",
};

export default function CareerMate() {
  const [view, setView] = useState("student");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: C.text }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
      <nav style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(10,12,18,0.9)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>CareerMate</span>
            <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, background: C.accentMuted, border: `1px solid ${C.accent}30`, borderRadius: 4, padding: "1px 6px", letterSpacing: "0.06em" }}>AI</span>
          </div>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 9, padding: 3, gap: 3 }}>
            {[["student", "Candidate"], ["recruiter", "Recruiter"]].map(([id, label]) => (
              <button key={id} onClick={() => setView(id)}
                style={{ background: view === id ? (id === "student" ? C.accent : C.green) : "transparent", color: view === id ? "white" : C.muted, border: "none", borderRadius: 7, padding: "6px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 28px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            {view === "student" ? "Resume Match Analysis" : "Candidate Evaluation"}
          </h1>
          <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
            {view === "student"
              ? "Upload your resume and paste a job description to get a match score and generate tailored outreach."
              : "Upload a candidate resume and paste your job description to run an ATS evaluation."}
          </p>
        </div>
        {view === "student" ? <StudentView key="student" /> : <RecruiterView key="recruiter" />}
      </div>
      <div style={{ textAlign: "center", padding: "32px 24px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: 12 }}>
        CareerMate AI — Built by Tanvi Kadam · Powered by Claude
      </div>
    </div>
  );
}
