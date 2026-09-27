import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import AlertsPanel from './alerts/AlertsPanel';
import OperationsPanel from './operations/OperationsPanel';
import MapView from './map/MapView';
import ChatBox from './chat/ChatBox';
import './DisasterDashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const playSound = () => {
  try {
    const audio = new Audio('https://actions.google.com/sounds/v1/emergency/beep_short.ogg');
    audio.play().catch(() => {});
  } catch (err) {
    console.warn('sound play failed', err);
  }
};

const initialDummyOperations = [
  { id: 1, teamName: 'Team Red', location: 'Mumbai', status: 'active', startedAt: new Date().toISOString() },
  { id: 2, teamName: 'Team Blue', location: 'Bangalore', status: 'completed', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const DisasterDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [operations, setOperations] = useState(initialDummyOperations);
  const [locations, setLocations] = useState({});
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchInitialAlerts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/real-alerts/combined`);
        const data = await response.json();
        if (data.alerts) {
          setAlerts(data.alerts);
        }
      } catch (err) {
        console.warn('Could not fetch initial alerts:', err);
      }
    };

    fetchInitialAlerts();

    const socketIo = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    setSocket(socketIo);

    socketIo.on('connect', () => {
      setConnectionStatus('connected');
    });

    socketIo.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socketIo.on('newAlert', (alert) => {
      setAlerts((prev) => {
        const alertId = alert.externalAlertId || alert._id || alert.id;
        return [alert, ...prev.filter((item) => (item.externalAlertId || item._id || item.id) !== alertId)].slice(0, 100);
      });
      if (alert.severity === 'High' || alert.severity === 'Critical' || alert.type === 'Earthquake') {
        playSound();
      }
    });

    socketIo.on('externalAlert', (alert) => {
      setAlerts((prev) => {
        const alertId = alert.externalAlertId || alert._id || alert.id;
        return [alert, ...prev.filter((item) => (item.externalAlertId || item._id || item.id) !== alertId)].slice(0, 100);
      });
      if (alert.severity === 'High' || alert.severity === 'Critical') {
        playSound();
      }
    });

    socketIo.on('updateOperations', (ops) => setOperations(ops));
    socketIo.on('locationUpdate', (team) => setLocations((prev) => ({ ...prev, [team.teamId]: team })));
    socketIo.on('receiveMessage', (message) => setMessages((prev) => [...prev, message]));

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const handleNewAlert = () => {
    if (!socket) return;

    const alert = {
      id: Date.now(),
      title: 'Earthquake Detected',
      type: 'earthquake',
      description: 'Magnitude 5.8 tremor in central region',
      severity: Math.ceil(Math.random() * 5),
      timestamp: new Date().toISOString(),
      location: { coords: [23.5937 + Math.random() * 5, 72.9629 + Math.random() * 5], label: 'Near Central Region' },
    };

    socket.emit('newAlert', alert);
  };

  const handleOperationUpdate = (operationId, status) => {
    const updatedOperations = operations.map((op) => (op.id === operationId ? { ...op, status, updatedAt: new Date().toISOString() } : op));
    setOperations(updatedOperations);
    socket?.emit('updateOperations', updatedOperations.find((op) => op.id === operationId));
  };

  const handleSendMessage = (messagePayload) => {
    if (!socket) return;

    const message = {
      ...messagePayload,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    socket.emit('sendMessage', message);
  };

  const sendLocationUpdate = () => {
    if (!socket) return;
    const teamId = `team-${Math.ceil(Math.random() * 5)}`;
    const payload = {
      teamId,
      teamName: teamId,
      status: 'active',
      coords: [randomRange(8, 37), randomRange(68, 97)],
      timestamp: new Date().toISOString(),
    };

    setLocations((prev) => ({ ...prev, [teamId]: payload }));
    socket.emit('locationUpdate', payload);
  };

  const randomRange = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [alerts]);

  return (
    <div className="disaster-dashboard-container">
      <header className="disaster-header">
        <h1>Natural Disaster Alerts & Rescue Coordination</h1>
        <div className="header-actions">
          <button className="btn" onClick={handleNewAlert}>Simulate New Alert</button>
          <button className="btn" onClick={sendLocationUpdate}>Update Live Location</button>
        </div>
      </header>

      <div className="status-row">
        <div>Status: {connectionStatus}</div>
        <div>Alerts: {alerts.length}</div>
        <div>Operations: {operations.length}</div>
      </div>

      <div className="layout-grid">
        <AlertsPanel alerts={sortedAlerts} />
        <OperationsPanel operations={operations} onUpdateOperation={handleOperationUpdate} />
        <MapView alerts={alerts} operations={operations} locations={locations} />
        <ChatBox messages={messages} onSendMessage={handleSendMessage} connectionStatus={connectionStatus} />
      </div>
    </div>
  );
};

export default DisasterDashboard;
