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

export default function RecruiterView() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [step, setStep] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const runATS = async () => {
    if (!file || !jd.trim()) { setError("Please upload a resume and paste a job description."); return; }
    setError(""); setStep("scoring"); setResult(null); setEmail(""); setShowEmail(false);
    try {
      const b64 = await toB64(file);
      const doc = { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };
      const raw = await ai([{ role: "user", content: [doc, { type: "text", text: `You are an expert ATS system and recruiter. Evaluate this resume against the job description. Return ONLY raw JSON:\n{"atsScore":0-100,"recommendation":"Strong Fit"|"Potential Fit"|"Not a Fit","fitSummary":"2-3 sentences","topStrengths":["s1","s2","s3"],"concerns":["c1","c2"],"keywordMatches":["kw1","kw2","kw3"],"missingKeywords":["m1","m2"],"experienceLevel":"Junior"|"Mid-Level"|"Senior","levelMatch":"Matches role"|"Overqualified"|"Underqualified","candidateName":"name","candidateEmail":"email or empty"}\n\nJob Description:\n${jd}` }] }]);
      setResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      setStep("scored");
    } catch (e) { setError("Analysis failed: " + e.message); setStep("idle"); }
  };

  const generateEmail = async () => {
    if (email) { setShowEmail(true); return; }
    setEmailLoading(true); setShowEmail(true);
    try {
      const tone = result.recommendation === "Not a Fit" ? "a polite, respectful rejection" : "an enthusiastic interview invitation";
      const content = await ai([{ role: "user", content: `Write ${tone} email to ${result.candidateName || "the candidate"}. Professional and warm. Include a subject line. 3-4 sentences.\n\nRole context: ${jd.substring(0, 400)}` }]);
      setEmail(content);
    } catch (e) { setError("Email generation failed."); }
    finally { setEmailLoading(false); }
  };

  const rec = result;
  const recCol = rec?.recommendation === "Strong Fit" ? C.green : rec?.recommendation === "Potential Fit" ? C.amber : C.red;

  return (
    <div style={{ display: "grid", gridTemplateColumns: step === "scored" ? "380px 1fr" : "1fr", gap: 20, maxWidth: step === "scored" ? "100%" : 520, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Candidate Resume</div>
          <UploadZone onFile={setFile} label="Candidate Resume" />
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Job Description</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description you posted..."
            style={{ width: "100%", minHeight: 180, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, padding: 12, resize: "vertical", fontFamily: "inherit", outline: "none", lineHeight: 1.6 }} />
        </div>
        {error && <div style={{ background: C.redMuted, border: `1px solid ${C.red}30`, borderRadius: 9, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>{error}</div>}
        <button onClick={runATS} disabled={step === "scoring"}
          style={{ background: step === "scoring" ? C.greenMuted : C.green, color: "white", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: step === "scoring" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {step === "scoring" ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Running ATS Analysis...</> : "Run ATS Analysis"}
        </button>
      </div>

      {step === "scored" && rec && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...card, border: `1px solid ${recCol}25` }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <ScoreRing score={rec.atsScore} size={140} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  {rec.candidateName && <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{rec.candidateName}</span>}
                  <span style={{ background: `${recCol}15`, color: recCol, border: `1px solid ${recCol}30`, borderRadius: 20, padding: "2px 11px", fontSize: 11.5, fontWeight: 700 }}>{rec.recommendation}</span>
                </div>
                {rec.candidateEmail && <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{rec.candidateEmail}</div>}
                <p style={{ margin: 0, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{rec.fitSummary}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  <Pill color="blue">{rec.experienceLevel}</Pill>
                  <Pill color={rec.levelMatch === "Matches role" ? "green" : "amber"}>{rec.levelMatch}</Pill>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Top Strengths</div>
              {rec.topStrengths?.map((s, i) => <div key={i} style={{ fontSize: 12.5, color: C.dim, background: C.greenMuted, border: `1px solid ${C.green}20`, borderRadius: 7, padding: "6px 10px", marginBottom: 6 }}>{s}</div>)}
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Concerns</div>
              {rec.concerns?.map((c, i) => <div key={i} style={{ fontSize: 12.5, color: C.dim, background: C.redMuted, border: `1px solid ${C.red}20`, borderRadius: 7, padding: "6px 10px", marginBottom: 6 }}>{c}</div>)}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Keyword Analysis</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 6 }}>Matched</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{rec.keywordMatches?.map((k, i) => <Pill key={i} color="green">{k}</Pill>)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 6 }}>Missing</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{rec.missingKeywords?.map((k, i) => <Pill key={i} color="red">{k}</Pill>)}</div>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Candidate Outreach</div>
            <FeatureBtn label={rec.recommendation === "Not a Fit" ? "Generate Rejection Email" : "Generate Interview Invite"} active={showEmail} loading={emailLoading} done={!!email} onClick={generateEmail} />
            {showEmail && (
              emailLoading
                ? <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 13, marginTop: 16 }}><div style={{ width: 14, height: 14, border: `2px solid ${C.green}30`, borderTopColor: C.green, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Drafting email...</div>
                : email && <OutputCard content={email} filename="outreach_email.txt" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
