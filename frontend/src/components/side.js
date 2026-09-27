export default function SidePanel({ alerts }) {
  return (
    <div>
      <h3>ALERT LIST</h3>

      {alerts.map((a, i) => (
        <div
          key={i}
          style={{
            background:
              a.level === "RED"
                ? "#ff4d4d"
                : a.level === "ORANGE"
                ? "#ffa500"
                : "#ffff66",
            padding: "10px",
            marginBottom: "8px"
          }}
        >
          <b>{a.alert}</b>
          <p>{a.description}</p>
        </div>
      ))}
    </div>
  );
}
