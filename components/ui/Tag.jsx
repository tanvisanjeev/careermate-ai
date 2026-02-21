export default function Tag({ children, type = "green" }) {
  const bg = { green: "rgba(16,185,129,0.15)", red: "rgba(239,68,68,0.15)", blue: "rgba(99,102,241,0.15)", yellow: "rgba(245,158,11,0.15)" };
  const text = { green: "#10b981", red: "#ef4444", blue: "#818cf8", yellow: "#f59e0b" };
  return (
    <span style={{ background: bg[type], color: text[type], border: `1px solid ${text[type]}30`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500 }}>
      {children}
    </span>
  );
}
