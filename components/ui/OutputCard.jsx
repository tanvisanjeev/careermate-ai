"use client";
import { useState } from "react";

export default function OutputCard({ content, filename }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const dl = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" })); a.download = filename; a.click(); };
  return (
    <div style={{ marginTop: 16 }}>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, color: "#94a3b8", lineHeight: 1.75, margin: 0, maxHeight: 260, overflowY: "auto", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 16 }}>{content}</pre>
      <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
        <button onClick={copy} style={{ background: copied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: copied ? "#10b981" : "#64748b", border: `1px solid ${copied ? "#10b98140" : "rgba(255,255,255,0.07)"}`, borderRadius: 7, padding: "6px 14px", fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>
          {copied ? "Copied" : "Copy"}
        </button>
        {filename && (
          <button onClick={dl} style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 7, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
            Download
          </button>
        )}
      </div>
    </div>
  );
}
