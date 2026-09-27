import "./DosDonts.css";

export default function DisasterTabs({ disasters, selected, onSelect }) {
  return (
    <div className="tabs">
      {disasters.map((d) => (
        <button
          key={d}
          className={selected === d ? "tab active" : "tab"}
          onClick={() => onSelect(d)}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
