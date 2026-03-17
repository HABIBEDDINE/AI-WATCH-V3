export default function Newsletter() {
  const B = {
    white: "#ffffff",
    gray100: "#f4f4f4",
    gray500: "#666666",
    gray900: "#111111",
  };

  return (
    <div style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: B.gray900, marginBottom: 6 }}>Newsletter</h2>
        <p style={{ fontSize: 12, color: B.gray500 }}>AI Watch weekly brief and curated updates — coming soon</p>
      </div>

      <div style={{
        background: B.white,
        border: `1px solid ${B.gray100}`,
        borderRadius: 4,
        padding: "40px 24px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 14, color: B.gray500 }}>Newsletter page content loading...</p>
      </div>
    </div>
  );
}
