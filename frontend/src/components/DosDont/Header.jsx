import "./Header.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      {/* Top line */}
      <div className="ndma-top">
        National Disaster Management Authority
      </div>

      {/* Main Header */}
      <header className="ndma-header">
        <div className="logo">
          🌐 Disaster Alert & Rescue System
        </div>

        <nav className="menu">
          <Link to="/">HOME</Link>

          <Link to="/about">ABOUT</Link>
          <Link to="/dos-donts">DOS & DON’TS</Link>
        </nav>
      </header>
    </>
  );
}
