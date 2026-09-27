import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api';
import './RescueDashboard.css';

const missionStatuses = ['ASSIGNED', 'ACCEPTED', 'ON THE WAY', 'AT LOCATION', 'RESCUE IN PROGRESS', 'EVACUATION IN PROGRESS', 'RESOURCES NEEDED', 'COMPLETED'];
const resourceNames = ['Ambulance', 'Medical Team', 'Fire & Rescue', 'Boats', 'Food Supplies', 'Water', 'Emergency Kits', 'Shelter', 'Vehicles'];

const coordinatesFor = (alert) => {
  if (alert?.coordinates?.type === 'Point' && Array.isArray(alert.coordinates.coordinates)) {
    const [longitude, latitude] = alert.coordinates.coordinates.map(Number);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null;
  }
  return null;
};

const priorityFor = (request) => request?.urgency || 'MEDIUM';

export default function RescueDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({ team: {}, incidents: [], requests: [], missions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMission, setSelectedMission] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [sharingLocation, setSharingLocation] = useState(false);
  const [resourceState, setResourceState] = useState('NEEDED');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await API.get('/rescue/dashboard');
      setDashboard(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError?.data?.message || 'Unable to load rescue operations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000');
    socket.on('rescueMissionUpdated', loadDashboard);
    socket.on('live-alert', loadDashboard);
    return () => socket.disconnect();
  }, []);

  const activeMissions = dashboard.missions.filter((mission) => mission.status !== 'COMPLETED');
  const resourcesNeeded = dashboard.missions.filter((mission) => mission.status === 'RESOURCES NEEDED');
  const criticalAlerts = dashboard.incidents.filter((incident) => ['Critical', 'High'].includes(incident.severity));
  const sortedRequests = useMemo(() => [...dashboard.requests].sort((a, b) => {
    const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (rank[priorityFor(a)] ?? 9) - (rank[priorityFor(b)] ?? 9);
  }), [dashboard.requests]);

  const acceptMission = async (payload) => {
    try {
      await API.post('/rescue/missions/accept', payload);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError?.data?.message || 'Unable to accept this mission.');
    }
  };

  const updateMission = async (mission, extra = {}) => {
    try {
      await API.put(`/rescue/missions/${mission._id}`, extra);
      setUpdateText('');
      await loadDashboard();
    } catch (requestError) {
      setError(requestError?.data?.message || 'Unable to update this mission.');
    }
  };

  const toggleLocationSharing = () => {
    if (sharingLocation) {
      API.put('/rescue/profile', { locationSharingEnabled: false }).then(() => setSharingLocation(false));
      return;
    }
    if (!navigator.geolocation) {
      setError('Location sharing is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      await API.put('/rescue/profile', { locationSharingEnabled: true, coordinates: [position.coords.longitude, position.coords.latitude] });
      setSharingLocation(true);
    }, () => setError('Location permission was not granted.'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    navigate('/rescue/login', { replace: true });
  };

  return (
    <main className="rescue-dashboard">
      <header className="rescue-header">
        <div><p className="rescue-kicker">RESPONSE OPERATIONS</p><h1>Rescue Operations Dashboard</h1><p>Official incidents remain read-only. Your team manages the response.</p></div>
        <div className="rescue-header-actions"><button onClick={toggleLocationSharing}>{sharingLocation ? 'Stop location sharing' : 'Share team location'}</button><button onClick={logout}>Logout</button></div>
      </header>

      {error && <div className="rescue-error" role="alert">{error}</div>}
      {loading ? <div className="rescue-loading">Loading operations...</div> : (
        <>
          <section className="rescue-team-banner"><div><span className="eyebrow">TEAM</span><strong>{dashboard.team.name || dashboard.team.teamName || 'Rescue team'}</strong><span>{dashboard.team.contact || 'Demonstration response network'}</span></div><label>Team status<select value={dashboard.team.active === false ? 'OFFLINE' : 'AVAILABLE'} onChange={(event) => API.put('/rescue/profile', { status: event.target.value })}><option>AVAILABLE</option><option>BUSY</option><option>OFFLINE</option></select></label></section>

          <section className="rescue-stats" aria-label="Operations summary">
            <div><span>Active incidents</span><strong>{dashboard.incidents.length}</strong></div><div><span>Critical alerts</span><strong>{criticalAlerts.length}</strong></div><div><span>Pending requests</span><strong>{sortedRequests.length}</strong></div><div><span>Active missions</span><strong>{activeMissions.length}</strong></div><div><span>Resources needed</span><strong>{resourcesNeeded.length}</strong></div><div><span>Last API update</span><strong>{dashboard.lastAlertUpdate ? new Date(dashboard.lastAlertUpdate).toLocaleTimeString() : 'No update'}</strong></div>
          </section>

          <div className="rescue-layout">
            <section className="rescue-panel incidents-panel"><div className="panel-heading"><div><p className="eyebrow">OFFICIAL ALERTS</p><h2>Live incidents</h2></div><span className="source-badge">IMD CAP / SACHET</span></div>{dashboard.incidents.length === 0 ? <Empty text="No active official incidents." /> : dashboard.incidents.map((incident) => { const point = coordinatesFor(incident); return <article className="incident-card" key={incident._id}><div className="incident-card-top"><span className={`severity-badge severity-${String(incident.severity).toLowerCase()}`}>{incident.severity}</span><span>{incident.status}</span></div><h3>{incident.title}</h3><p>{incident.areaDescription || incident.location}</p><small>Issued {new Date(incident.sentAt || incident.createdAt).toLocaleString()}</small><div className="incident-actions"><button onClick={() => acceptMission({ incidentId: incident._id })}>Accept mission</button>{point && <a href={`https://www.openstreetmap.org/?mlat=${point[0]}&mlon=${point[1]}#map=8/${point[0]}/${point[1]}`} target="_blank" rel="noreferrer">View map</a>}</div></article>; })}</section>

            <section className="rescue-panel requests-panel"><div className="panel-heading"><div><p className="eyebrow">PUBLIC ASSISTANCE</p><h2>Urgent requests</h2></div></div>{sortedRequests.length === 0 ? <Empty text="No unresolved rescue requests." /> : sortedRequests.map((request) => <article className="request-card" key={request._id}><span className={`priority-badge priority-${priorityFor(request).toLowerCase()}`}>{priorityFor(request)}</span><h3>{request.disasterType || 'Emergency assistance'}</h3><p>{request.message || 'Request details unavailable'}</p><small>{request.peopleAffected || 0} people affected · {new Date(request.createdAt).toLocaleString()}</small><button onClick={() => acceptMission({ requestId: request._id })}>Accept request</button></article>)}</section>
          </div>

          <section className="rescue-bottom-grid"><section className="rescue-panel missions-panel"><div className="panel-heading"><div><p className="eyebrow">TEAM RESPONSE</p><h2>Active missions</h2></div></div>{activeMissions.length === 0 ? <Empty text="Accept an incident or rescue request to begin a mission." /> : activeMissions.map((mission) => <article className="mission-card" key={mission._id}><div><span className="mission-id">MISSION {mission._id.slice(-6).toUpperCase()}</span><h3>{mission.incident?.title || mission.rescueRequest?.disasterType || 'Response mission'}</h3><p>{mission.incident?.location || mission.rescueRequest?.message || 'Location pending'}</p></div><select value={mission.status} onChange={(event) => updateMission(mission, { status: event.target.value })}>{missionStatuses.map((status) => <option key={status}>{status}</option>)}</select><div className="mission-update"><input value={selectedMission?._id === mission._id ? updateText : ''} onFocus={() => setSelectedMission(mission)} onChange={(event) => setUpdateText(event.target.value)} placeholder="Add operational update" /><button onClick={() => updateMission(mission, { message: updateText })}>Post</button></div><div className="resource-row"><select value={resourceState} onChange={(event) => setResourceState(event.target.value)}>{['AVAILABLE', 'IN USE', 'NEEDED'].map((state) => <option key={state}>{state}</option>)}</select><select defaultValue="Ambulance">{resourceNames.map((resource) => <option key={resource}>{resource}</option>)}</select><button onClick={() => updateMission(mission, { resources: [{ name: 'Ambulance', state: resourceState, quantity: 1 }] })}>Update resources</button></div></article>)}</section>

            <section className="rescue-panel map-panel"><div className="panel-heading"><div><p className="eyebrow">OPERATIONS MAP</p><h2>Incident locations</h2></div></div><MapContainer center={[22.5, 80]} zoom={4} className="rescue-map"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />{dashboard.incidents.map((incident) => { const point = coordinatesFor(incident); return point ? <Marker key={incident._id} position={point}><Popup><strong>{incident.title}</strong><br />{incident.location}</Popup></Marker> : null; })}</MapContainer><small className="map-note">Team location is shown only when sharing is enabled.</small></section></section>
        </>
      )}
    </main>
  );
}

function Empty({ text }) { return <div className="rescue-empty">{text}</div>; }
