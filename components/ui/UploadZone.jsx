"use client";
import { useState, useRef } from "react";

export default function UploadZone({ onFile, label = "Resume" }) {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("");
  const ref = useRef();
  const handle = (f) => { if (!f) return; setFileName(f.name); onFile(f); };
  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      style={{ border: `1.5px dashed ${drag ? "#6366f1" : fileName ? "#10b981" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "24px 20px", textAlign: "center", cursor: "pointer", background: drag ? "rgba(99,102,241,0.05)" : fileName ? "rgba(16,185,129,0.05)" : "transparent", transition: "all 0.2s" }}>
      <input ref={ref} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
      <div style={{ fontSize: 13, color: fileName ? "#10b981" : "#64748b", fontWeight: 500, marginBottom: 4 }}>
        {fileName ? fileName : `Upload ${label} (PDF)`}
      </div>
      <div style={{ fontSize: 11, color: "#475569" }}>{fileName ? "Click to replace" : "Drag & drop or click to browse"}</div>
    </div>
  );
}
