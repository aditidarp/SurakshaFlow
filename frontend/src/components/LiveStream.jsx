import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Use environment variable if set, otherwise default to backend localhost
const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function LiveStream() {
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('socket disconnected');
    });

    socket.on('live-alert', (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 50));
    });

    // compatibility: listen for admin-triggered liveAlert
    socket.on('liveAlert', (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 50));
    });

    socket.on('live-weather', (data) => {
      setWeather(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <h3>Live Stream {connected ? '🟢' : '⚪️'}</h3>

      <div style={{ marginBottom: 12 }}>
        <strong>Latest Weather:</strong>
        {weather ? (
          <div>
            Temp: {weather.temperature} °C, Humidity: {weather.humidity}% , Wind: {weather.windSpeed} km/h
            <div style={{ fontSize: 12, color: '#666' }}>{weather.timestamp}</div>
          </div>
        ) : (
          <div>No weather data yet</div>
        )}
      </div>

      <div>
        <strong>Recent Alerts:</strong>
        <ul style={{ maxHeight: 300, overflow: 'auto', paddingLeft: 16 }}>
          {alerts.map((a) => (
            <li key={a.id}>
              <div><strong>{a.title}</strong> ({a.type})</div>
              <div style={{ fontSize: 12, color: '#666' }}>{a.description}</div>
              <div style={{ fontSize: 11, color: '#444' }}>{a.createdAt}</div>
            </li>
          ))}
          {alerts.length === 0 && <li>No alerts yet</li>}
        </ul>
      </div>
    </div>
  );
}
