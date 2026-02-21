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
      style={{ border: `2px dashed ${drag ? "#818cf8" : fileName ? "#10b981" : "rgba(255,255,255,0.12)"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: drag ? "rgba(129,140,248,0.05)" : fileName ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)", transition: "all 0.2s" }}
    >
      <input ref={ref} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>{fileName ? "✅" : "📄"}</div>
      {fileName
        ? <><div style={{ color: "#10b981", fontWeight: 600, fontSize: 14 }}>{fileName}</div><div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Click to replace</div></>
        : <><div style={{ color: "#ccc", fontWeight: 500, fontSize: 14 }}>Drop your {label} here</div><div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>PDF only · Click to browse</div></>
      }
    </div>
  );
}
