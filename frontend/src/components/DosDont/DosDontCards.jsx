export default function DosDontsCards({ info }) {
  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ flex: 1, border: "1px solid #ccc", padding: "15px" }}>
        <h3>DOs</h3>
        <ul>
          {info.dos.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, border: "1px solid #ccc", padding: "15px" }}>
        <h3>DON’Ts</h3>
        <ul>
          {info.donts.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
