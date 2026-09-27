import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/alerts");
        setAlerts(res.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch alerts:", err);
      }
    };

    fetchAlerts();                 // first time
    const interval = setInterval(fetchAlerts, 10000); // every 10 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="alerts-list-compact">
      <h3>ALERT LIST</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {alerts.map((a, i) => {
        const type = (a.type || '').toLowerCase();
        const color = type.includes('fire') ? '#ea580c' : type.includes('avalanche') ? '#f59e0b' : (type==='flood'? '#facc15': '#0056b3');
        return (
          <div key={i} className="alert-card compact" style={{ borderLeftColor: color, marginBottom: 8 }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong style={{color:'#003d82'}}>{a.title || a.alert || 'Alert'}</strong>
              <span style={{fontSize:12,color:'#64748b'}}>Severity: {a.severity ?? '-'}</span>
            </div>
            <div style={{fontSize:13,color:'#64748b',marginTop:6}}>
              {a.district ? `${a.district}, ${a.state}` : (a.location?.name || '')}
            </div>
            <div style={{fontSize:12,color:'#94a3b8',marginTop:6}}>{a.description}</div>
          </div>
        )
      })}
    </div>
  );
}
