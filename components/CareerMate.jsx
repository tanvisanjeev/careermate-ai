"use client";
import { useState } from "react";
import StudentView from "./StudentView";
import RecruiterView from "./RecruiterView";

export default function CareerMate() {
  const [view, setView] = useState("student");
  return (
    <div style={{ minHeight: "100vh", background: "#080b14", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: "#f1f5f9" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎯</div>
            <span style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CareerMate</span>
            <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 4, padding: "1px 6px" }}>AI</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 4, display: "flex", gap: 4 }}>
            {[["student", "🎓 Student"], ["recruiter", "💼 Recruiter"]].map(([id, label]) => (
              <button key={id} onClick={() => setView(id)} style={{ background: view === id ? (id === "student" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#059669,#10b981)") : "transparent", color: view === id ? "white" : "#888", border: "none", borderRadius: 9, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {view === "student"
            ? <><h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 10px", background: "linear-gradient(135deg,#c7d2fe,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Land Your Dream Job</h1><p style={{ color: "#64748b", fontSize: 15 }}>Upload resume · paste job description · get match score, analysis & tailored outreach</p></>
            : <><h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 10px", background: "linear-gradient(135deg,#6ee7b7,#34d399,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Find the Right Talent</h1><p style={{ color: "#64748b", fontSize: 15 }}>Upload candidate resume · run ATS analysis · instantly know if they're a fit</p></>
          }
        </div>
        {view === "student" ? <StudentView key="student" /> : <RecruiterView key="recruiter" />}
      </div>
      <div style={{ textAlign: "center", padding: "40px 24px 24px", color: "#2d3748", fontSize: 12 }}>
        Powered by Claude AI · CareerMate © 2026
      </div>
    </div>
  );
}
