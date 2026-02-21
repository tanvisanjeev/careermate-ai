"use client";
import { useState } from "react";
import ScoreRing from "./ui/ScoreRing";
import UploadZone from "./ui/UploadZone";
import OutputCard from "./ui/OutputCard";

const C = {
  surface: "#0f1117", border: "rgba(255,255,255,0.07)", text: "#e2e8f0",
  muted: "#64748b", dim: "#94a3b8", accent: "#6366f1", accentMuted: "rgba(99,102,241,0.12)",
  green: "#10b981", greenMuted: "rgba(16,185,129,0.1)", amber: "#f59e0b",
  amberMuted: "rgba(245,158,11,0.1)", red: "#ef4444", redMuted: "rgba(239,68,68,0.1)",
};
const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 };

function Pill({ children, color = "green" }) {
  const map = { green: [C.green, C.greenMuted], red: [C.red, C.redMuted], amber: [C.amber, C.amberMuted], blue: [C.accent, C.accentMuted] };
  const [col, bg] = map[color];
  return <span style={{ background: bg, color: col, border: `1px solid ${col}25`, borderRadius: 5, padding: "2px 9px", fontSize: 11.5, fontWeight: 500 }}>{children}</span>;
}

function Spinner() {
  return <div style={{ width: 14, height: 14, border: `2px solid rgba(255,255,255,0.2)`, borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />;
}

function FeatureBtn({ label, active, loading, done, onClick }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ background: active ? C.accentMuted : "rgba(255,255,255,0.03)", color: active ? C.accent : done ? C.green : C.dim, border: `1px solid ${active ? C.accent + "40" : done ? C.green + "30" : C.border}`, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: loading ? 0.6 : 1 }}>
      {loading ? "Generating..." : label}
    </button>
  );
}

const toB64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(f); });

async function ai(messages) {
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, messages };
  const r = await fetch("/api/anthropic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content?.map(b => b.text || "").join("\n") || "";
}

const FEATURES = [
  { id: "cover", label: "Cover Letter" },
  { id: "email", label: "Cold Email" },
  { id: "linkedin", label: "LinkedIn Message" },
];

export default function StudentView() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [step, setStep] = useState("idle");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [genLoading, setGenLoading] = useState("");
  const [generated, setGenerated] = useState({});

  const runScore = async () => {
    if (!file || !jd.trim()) { setError("Please upload your resume and paste a job description."); return; }
    setError(""); setStep("scoring"); setAnalysis(null); setGenerated({}); setActiveTab(null);
    try {
      const b64 = await toB64(file);
      const doc = { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };
      const raw = await ai([{ role: "user", content: [doc, { type: "text", text: `Analyze this resume against the job description. Return ONLY raw JSON (no backticks):\n{"score":0-100,"summary":"2-3 sentences","strengths":["s1","s2","s3"],"weaknesses":["w1","w2","w3"],"missingSkills":["sk1","sk2"],"candidateName":"name","targetRole":"role"}\n\nJob Description:\n${jd}` }] }]);
      setAnalysis(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      setStep("scored");
    } catch (e) { setError("Analysis failed: " + e.message); setStep("idle"); }
  };

  const generate = async (type) => {
    if (generated[type]) { setActiveTab(type); return; }
    setGenLoading(type); setActiveTab(type);
    try {
      const b64 = await toB64(file);
      const doc = { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };
      let content = "";
      if (type === "cover") content = await ai([{ role: "user", content: [doc, { type: "text", text: `Write a professional 3-paragraph cover letter. Start with "Dear Hiring Manager," and sign with the candidate's name.\n\nJob Description:\n${jd}` }] }]);
      else if (type === "email") content = await ai([{ role: "user", content: [doc, { type: "text", text: `Write a short professional cold email to the hiring manager. Include a subject line. 5-6 sentences. Reference a specific achievement.\n\nJob Description:\n${jd}` }] }]);
      else if (type === "linkedin") content = await ai([{ role: "user", content: [doc, { type: "text", text: `Write a LinkedIn connection request message to the hiring manager. Max 280 characters. Professional and specific.\n\nJob Description:\n${jd}` }] }]);
      setGenerated(prev => ({ ...prev, [type]: content }));
    } catch (e) { setError("Generation failed: " + e.message); }
    finally { setGenLoading(""); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: step === "scored" ? "380px 1fr" : "1fr", gap: 20, maxWidth: step === "scored" ? "100%" : 520, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Resume</div>
          <UploadZone onFile={setFile} />
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Job Description</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the full job description here..."
            style={{ width: "100%", minHeight: 180, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, padding: 12, resize: "vertical", fontFamily: "inherit", outline: "none", lineHeight: 1.6 }} />
        </div>
        {error && <div style={{ background: C.redMuted, border: `1px solid ${C.red}30`, borderRadius: 9, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>{error}</div>}
        <button onClick={runScore} disabled={step === "scoring"}
          style={{ background: step === "scoring" ? C.accentMuted : C.accent, color: "white", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: step === "scoring" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {step === "scoring" ? <><Spinner /> Analyzing...</> : "Analyze Resume"}
        </button>
      </div>

      {step === "scored" && analysis && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <ScoreRing score={analysis.score} />
              <div style={{ flex: 1 }}>
                {analysis.candidateName && <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>{analysis.candidateName}</div>}
                {analysis.targetRole && <div style={{ fontSize: 13, color: C.accent, marginBottom: 10 }}>{analysis.targetRole}</div>}
                <p style={{ margin: 0, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{analysis.summary}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Strengths</div>
              {analysis.strengths?.map((s, i) => <div key={i} style={{ fontSize: 12.5, color: C.dim, background: C.greenMuted, border: `1px solid ${C.green}20`, borderRadius: 7, padding: "6px 10px", marginBottom: 6 }}>{s}</div>)}
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Gaps</div>
              {analysis.weaknesses?.map((w, i) => <div key={i} style={{ fontSize: 12.5, color: C.dim, background: C.amberMuted, border: `1px solid ${C.amber}20`, borderRadius: 7, padding: "6px 10px", marginBottom: 6 }}>{w}</div>)}
            </div>
          </div>

          {analysis.missingSkills?.length > 0 && (
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Missing Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {analysis.missingSkills.map((s, i) => <Pill key={i} color="red">{s}</Pill>)}
              </div>
            </div>
          )}

          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Generate Outreach</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FEATURES.map(f => (
                <FeatureBtn key={f.id} label={f.label} active={activeTab === f.id} loading={genLoading === f.id} done={!!generated[f.id]} onClick={() => generate(f.id)} />
              ))}
            </div>
            {activeTab && (
              genLoading === activeTab
                ? <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 13, marginTop: 16 }}><div style={{ width: 14, height: 14, border: `2px solid ${C.accent}30`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Generating {FEATURES.find(f => f.id === activeTab)?.label}...</div>
                : generated[activeTab] && <OutputCard content={generated[activeTab]} filename={activeTab === "cover" ? "cover_letter.txt" : activeTab === "email" ? "cold_email.txt" : "linkedin_message.txt"} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
