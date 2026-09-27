import React, { useState } from 'react';
import API from '../api';

export default function AdminAlertForm() {
  const [type, setType] = useState('flood');
  const [title, setTitle] = useState('');
  const [lat, setLat] = useState('22.5726');
  const [lon, setLon] = useState('88.3639');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('High');
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const payload = { type, title, lat, lon, message, severity };
      const res = await API.post('/admin/alert', payload);
      setStatus('sent');
      setMessage('');
      setTitle('');
      // optionally display server response
      console.log('sent', res.data);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} style={{ padding: 12, maxWidth: 480 }}>
      <h3>Admin: Send Alert</h3>
      <div>
        <label>Type</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="flood">Flood</option>
          <option value="earthquake">Earthquake</option>
          <option value="fire">Fire</option>
          <option value="storm">Storm</option>
        </select>
      </div>
      <div>
        <label>Title (optional)</label>
        <input value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Latitude</label>
        <input value={lat} onChange={e => setLat(e.target.value)} />
      </div>
      <div>
        <label>Longitude</label>
        <input value={lon} onChange={e => setLon(e.target.value)} />
      </div>
      <div>
        <label>Severity</label>
        <select value={severity} onChange={e => setSeverity(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>
      <div>
        <label>Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit">Send Alert</button>
        {status === 'sending' && <span style={{ marginLeft: 8 }}>Sending...</span>}
        {status === 'sent' && <span style={{ marginLeft: 8, color: 'green' }}>Sent ✓</span>}
        {status === 'error' && <span style={{ marginLeft: 8, color: 'red' }}>Error</span>}
      </div>
    </form>
  );
}
