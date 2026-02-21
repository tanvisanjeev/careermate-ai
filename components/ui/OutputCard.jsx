"use client";
import { useState } from "react";

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); };
  return (
    <button onClick={copy} style={{ background: done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)", color: done ? "#10b981" : "#aaa", border: `1px solid ${done ? "#10b98140" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>
      {done ? "✓ Copied!" : "Copy"}
    </button>
  );
}

function DlBtn({ text, filename }) {
  const dl = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); a.download = filename; a.click(); };
  return (
    <button onClick={dl} style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
      ↓ Download
    </button>
  );
}

export default function OutputCard({ content, filename, placeholder }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
      {content
        ? <>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13.5, color: "#d1d5db", lineHeight: 1.7, margin: 0, maxHeight: 280, overflowY: "auto" }}>{content}</pre>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <CopyBtn text={content} />
              {filename && <DlBtn text={content} filename={filename} />}
            </div>
          </>
        : <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "20px 0" }}>{placeholder}</div>
      }
    </div>
  );
}
