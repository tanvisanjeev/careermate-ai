"use client";
import { useState } from "react";
import ScoreRing from "./ui/ScoreRing";
import Tag from "./ui/Tag";
import UploadZone from "./ui/UploadZone";
import OutputCard from "./ui/OutputCard";

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
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!file || !jd.trim()) { setError("Upload a candidate PDF and paste the job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const b64 = await toB64(file);
      const doc = { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };

      setMsg("🤖 Running ATS & fit analysis...");
      const raw = await ai([{ role: "user", content: [doc, { type: "text", text: `You are an ATS and recruiter expert. Evaluate this resume for the job below. Return ONLY raw JSON:\n{"atsScore":0-100,"recommendation":"Strong Fit"|"Potential Fit"|"Not a Fit","fitSummary":"2-3 sentences","topStrengths":["s1","s2","s3"],"concerns":["c1","c2"],"keywordMatches":["kw1","kw2","kw3","kw4"],"missingKeywords":["m1","m2"],"experienceLevel":"Junior"|"Mid-Level"|"Senior","levelMatch":"Matches role"|"Overqualified"|"Underqualified","candidateName":"name","candidateEmail":"email or empty"}\n\nJob Description:\n${jd}` }] }]);
      const analysis = JSON.parse(raw.replace(/```json|```/g, "").trim());

      setMsg("📬 Drafting outreach email...");
      const tone = analysis.recommendation === "Not a Fit" ? "a polite rejection" : "an enthusiastic interview invitation";
      const email = await ai([{ role: "user", content: `Write ${tone} email to ${analysis.candidateName || "the candidate"}. Professional and warm. Include subject line.\n\nRole context: ${jd.substring(0, 400)}` }]);

      setResult({ analysis, email });
    } catch (e) { setError("Error: " + e.message); }
    finally { setLoading(false); setMsg(""); }
  };

  const rec = result?.analysis;
  const col = rec?.recommendation === "Strong Fit" ? "#10b981" : rec?.recommendation === "Potential Fit" ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.5fr" : "1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>1. Upload Candidate Resume</h3>
          <UploadZone onFile={setFile} label="Candidate Resume" />
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>2. Paste Job Description</h3>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the full job description..." style={{ width: "100%", minHeight: 160, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#d1d5db", fontSize: 13, padding: 12, resize: "vertical", fontFamily: "inherit" }} />
        </div>
        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>{error}</div>}
        <button onClick={run} disabled={loading} style={{ background: loading ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg,#059669,#10b981)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? msg || "Analyzing..." : "🔎 Run ATS Analysis"}
        </button>
        {loading && <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#888", fontSize: 13 }}><div style={{ width: 16, height: 16, border: "2px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{msg}</div>}
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${col}30`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
              <ScoreRing score={rec.atsScore} size={140} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  {rec.candidateName && <span style={{ fontSize: 18, fontWeight: 700 }}>{rec.candidateName}</span>}
                  <span style={{ background: `${col}20`, color: col, border: `1px solid ${col}40`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{rec.recommendation}</span>
                </div>
                {rec.candidateEmail && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{rec.candidateEmail}</div>}
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{rec.fitSummary}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <Tag type="blue">🎯 {rec.experienceLevel}</Tag>
              <Tag type={rec.levelMatch === "Matches role" ? "green" : "yellow"}>{rec.levelMatch}</Tag>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 8 }}>✅ TOP STRENGTHS</div>
                {rec.topStrengths?.map((s, i) => <div key={i} style={{ fontSize: 12, color: "#9ca3af", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 7, padding: "5px 9px", marginBottom: 5 }}>• {s}</div>)}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>⚠️ CONCERNS</div>
                {rec.concerns?.map((c, i) => <div key={i} style={{ fontSize: 12, color: "#9ca3af", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 7, padding: "5px 9px", marginBottom: 5 }}>• {c}</div>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", marginBottom: 7 }}>🔑 KEYWORD MATCHES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {rec.keywordMatches?.map((k, i) => <Tag key={i} type="blue">{k}</Tag>)}
                {rec.missingKeywords?.map((k, i) => <Tag key={i} type="red">✗ {k}</Tag>)}
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              {rec.recommendation === "Not a Fit" ? "📨 Rejection Email" : "📨 Interview Invitation"}
            </div>
            <OutputCard content={result.email} filename="outreach_email.txt" />
          </div>
        </div>
      )}
    </div>
  );
}
