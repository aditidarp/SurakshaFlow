import React from "react";
import "./StateWiseAlerts.css";

const alerts = [
  {
    issuedBy: "Govt. of Himachal Pradesh",
    state: "Himachal Pradesh",
    event: "Heavy Snow",
    warning: "Moderate",
  },
  {
    issuedBy: "IMD Chandigarh",
    state: "Chandigarh",
    event: "Lightning, Gusty winds, Thunderstorm",
    warning: "Moderate",
  },
  {
    issuedBy: "Govt. of Haryana",
    state: "Haryana",
    event: "Thunderstorm, Gusty Winds",
    warning: "Low",
  },
];

const StateWiseAlerts = () => {
  return (
    <div className="state-alerts">
      <h2>LOCATION SPECIFIC ALERTS</h2>

      <select>
        <option>PAN INDIA</option>
        <option>Haryana</option>
        <option>Punjab</option>
        <option>Rajasthan</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Issued By</th>
            <th>State</th>
            <th>Event</th>
            <th>Warning Type</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {alerts.map((a, i) => (
            <tr key={i}>
              <td>{a.issuedBy}</td>
              <td>{a.state}</td>
              <td>{a.event}</td>
              <td className={a.warning.toLowerCase()}>
                {a.warning}
              </td>
              <td>
                <button>➡</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StateWiseAlerts;
