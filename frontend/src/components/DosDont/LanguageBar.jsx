import "./DosDonts.css";

export default function LanguageBar({ languages, selected, onSelect }) {
  return (
    <div className="language-bar">
      {languages.map((l) => (
        <button
          key={l}
          className={selected === l ? "lang active" : "lang"}
          onClick={() => onSelect(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
