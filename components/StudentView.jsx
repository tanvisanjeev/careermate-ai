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

const TABS = [{ id: "cover", label: "📝 Cover Letter" }, { id: "email", label: "📧 Cold Email" }, { id: "li", label: "💼 LinkedIn" }];

export default function StudentView() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("cover");

  const run = async () => {
    if (!file || !jd.trim()) { setError("Upload a PDF resume and paste a job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const b64 = await toB64(file);
      const doc = { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };

      setMsg("🔍 Analyzing resume vs. job description...");
      const aRaw = await ai([{ role: "user", content: [doc, { type: "text", text: `Analyze this resume against the job description. Return ONLY raw JSON (no backticks):\n{"score":0-100,"summary":"2-3 sentences","strengths":["s1","s2","s3"],"weaknesses":["w1","w2","w3"],"missingSkills":["sk1","sk2"],"candidateName":"name","targetRole":"role"}\n\nJob Description:\n${jd}` }] }]);
      const analysis = JSON.parse(aRaw.replace(/```json|```/g, "").trim());

      setMsg("✍️ Writing cover letter...");
      const cover = await ai([{ role: "user", content: [doc, { type: "text", text: `Write a professional 3-paragraph cover letter. Start "Dear Hiring Manager," and sign with candidate's name.\n\nJob Description:\n${jd}` }] }]);

      setMsg("📧 Crafting cold email...");
      const email = await ai([{ role: "user", content: [doc, { type: "text", text: `Write a short cold email (subject + 5-6 sentence body) to the hiring manager referencing a specific achievement.\n\nJob Description:\n${jd}` }] }]);

      setMsg("💼 Composing LinkedIn message...");
      const li = await ai([{ role: "user", content: [doc, { type: "text", text: `Write a LinkedIn connection request (max 280 chars) to the hiring manager. Professional and warm.\n\nJob Description:\n${jd}` }] }]);

      setResult({ analysis, cover, email, li });
    } catch (e) { setError("Error: " + e.message); }
    finally { setLoading(false); setMsg(""); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 20, transition: "all 0.3s" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>1. Upload Your Resume</h3>
          <UploadZone onFile={setFile} />
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>2. Paste Job Description</h3>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the full job description here..." style={{ width: "100%", minHeight: 160, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#d1d5db", fontSize: 13, padding: 12, resize: "vertical", fontFamily: "inherit" }} />
        </div>
        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>{error}</div>}
        <button onClick={run} disabled={loading} style={{ background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? msg || "Analyzing..." : "✨ Analyze & Generate"}
        </button>
        {loading && <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#888", fontSize: 13 }}><div style={{ width: 16, height: 16, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{msg}</div>}
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
              <ScoreRing score={result.analysis.score} />
              <div style={{ flex: 1 }}>
                {result.analysis.candidateName && <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{result.analysis.candidateName}</div>}
                {result.analysis.targetRole && <div style={{ fontSize: 13, color: "#818cf8", marginBottom: 8 }}>→ {result.analysis.targetRole}</div>}
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{result.analysis.summary}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", marginBottom: 8 }}>✅ STRENGTHS</div>
                {result.analysis.strengths?.map((s, i) => <div key={i} style={{ fontSize: 12.5, color: "#9ca3af", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 8, padding: "6px 10px", marginBottom: 5 }}>• {s}</div>)}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>⚠️ GAPS</div>
                {result.analysis.weaknesses?.map((w, i) => <div key={i} style={{ fontSize: 12.5, color: "#9ca3af", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: "6px 10px", marginBottom: 5 }}>• {w}</div>)}
              </div>
            </div>
            {result.analysis.missingSkills?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>🎯 MISSING SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{result.analysis.missingSkills.map((s, i) => <Tag key={i} type="red">{s}</Tag>)}</div>
              </div>
            )}
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 4 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: tab === t.id ? "rgba(99,102,241,0.4)" : "transparent", color: tab === t.id ? "#c7d2fe" : "#666", border: tab === t.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent", borderRadius: 8, padding: "7px 4px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.label}</button>
              ))}
            </div>
            {tab === "cover" && <OutputCard content={result.cover} filename="cover_letter.txt" />}
            {tab === "email" && <OutputCard content={result.email} filename="cold_email.txt" />}
            {tab === "li" && <OutputCard content={result.li} />}
          </div>
        </div>
      )}
    </div>
  );
}
