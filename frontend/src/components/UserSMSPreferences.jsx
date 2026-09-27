import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UserSMSPreferences.css';

const UserSMSPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const disasterTypes = [
    { key: 'floodAlerts', label: 'Flood Alerts' },
    { key: 'earthquakeAlerts', label: 'Earthquake Alerts' },
    { key: 'cycloneAlerts', label: 'Cyclone Alerts' },
    { key: 'fireAlerts', label: 'Fire Alerts' },
    { key: 'landslideAlerts', label: 'Landslide Alerts' },
  ];

  // Fetch preferences
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await axios.get('/api/user/sms-preferences', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPreferences(prefs.data.preferences);

      const act = await axios.get('/api/user/sms-preferences/activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setActivity(act.data.activity);

      setError('');
    } catch (err) {
      setError('Failed to load preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        '/api/user/sms-preferences',
        { smsPreferences: preferences },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setSuccess('Preferences saved successfully');
      setUnsavedChanges(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggleDisaster = async (disasterType) => {
    try {
      await axios.post(
        `/api/user/sms-preferences/toggle/${disasterType}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setPreferences({
        ...preferences,
        [disasterType + 'Alerts']: !preferences[disasterType + 'Alerts'],
      });

      setSuccess(`${disasterType} alerts toggled`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle alerts');
    }

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSeverityChange = async (severity) => {
    try {
      await axios.post(
        '/api/user/sms-preferences/severity',
        { severity },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setPreferences({
        ...preferences,
        minimumSeverity: severity,
      });

      setSuccess('Minimum severity updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update severity');
    }

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleQuietHoursChange = (field, value) => {
    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value,
      },
    });
    setUnsavedChanges(true);
  };

  const handleSaveQuietHours = async () => {
    try {
      setLoading(true);
      await axios.post(
        '/api/user/sms-preferences/quiet-hours',
        preferences.quietHours,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setSuccess('Quiet hours updated successfully');
      setUnsavedChanges(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiet hours');
    } finally {
      setLoading(false);
    }

    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading && !preferences) {
    return <div className="loading">Loading your preferences...</div>;
  }

  if (!preferences) {
    return <div className="error">Unable to load preferences</div>;
  }

  return (
    <div className="sms-preferences">
      <div className="preferences-header">
        <h2>SMS Alert Preferences</h2>
        <p>Customize how you receive disaster alerts via SMS</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="preferences-container">
        {/* Overall SMS Opt-in */}
        <section className="preference-section">
          <div className="section-header">
            <h3>SMS Notifications</h3>
          </div>

          <div className="preference-item">
            <div className="preference-content">
              <div className="preference-label">
                <strong>Receive SMS Alerts</strong>
                <p>Enable or disable all SMS notifications</p>
              </div>
            </div>
            <div className="preference-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.optInSMS}
                  onChange={(e) => {
                    setPreferences({
                      ...preferences,
                      optInSMS: e.target.checked,
                    });
                    setUnsavedChanges(true);
                  }}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-content">
              <div className="preference-label">
                <strong>Phone Number</strong>
                <p>SMS alerts are sent to this number</p>
              </div>
              <div className="phone-display">{preferences.phone || 'Not set'}</div>
            </div>
          </div>
        </section>

        {/* Disaster Type Filters */}
        <section className="preference-section">
          <div className="section-header">
            <h3>Alert Types</h3>
            <p>Choose which types of disasters to receive alerts for</p>
          </div>

          <div className="disaster-filters">
            {disasterTypes.map(({ key, label }) => (
              <div key={key} className="disaster-filter-item">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences[key] !== false}
                    onChange={() => handleToggleDisaster(key.replace('Alerts', ''))}
                  />
                  <span className="slider"></span>
                </label>
                <span className="filter-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Severity Filter */}
        <section className="preference-section">
          <div className="section-header">
            <h3>Severity Threshold</h3>
            <p>Only receive alerts of minimum severity level or above</p>
          </div>

          <div className="severity-options">
            {['Low', 'Medium', 'High', 'Critical'].map((severity) => (
              <label key={severity} className="severity-option">
                <input
                  type="radio"
                  name="severity"
                  checked={preferences.minimumSeverity === severity}
                  onChange={() => handleSeverityChange(severity)}
                />
                <span className="severity-label">
                  <strong>{severity}</strong>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="preference-section">
          <div className="section-header">
            <h3>Quiet Hours</h3>
            <p>Set times when you don't want to receive SMS alerts</p>
          </div>

          <div className="quiet-hours-wrapper">
            <div className="preference-item">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.quietHours?.enabled || false}
                  onChange={(e) =>
                    handleQuietHoursChange('enabled', e.target.checked)
                  }
                />
                <span className="slider"></span>
              </label>
              <span>Enable Quiet Hours</span>
            </div>

            {preferences.quietHours?.enabled && (
              <div className="quiet-hours-inputs">
                <div className="time-input-group">
                  <label>From (24-hour format)</label>
                  <input
                    type="time"
                    value={preferences.quietHours?.startTime || '22:00'}
                    onChange={(e) =>
                      handleQuietHoursChange('startTime', e.target.value)
                    }
                  />
                </div>

                <div className="time-input-group">
                  <label>To (24-hour format)</label>
                  <input
                    type="time"
                    value={preferences.quietHours?.endTime || '08:00'}
                    onChange={(e) =>
                      handleQuietHoursChange('endTime', e.target.value)
                    }
                  />
                </div>

                <button
                  onClick={handleSaveQuietHours}
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Quiet Hours'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Activity Stats */}
        {activity && (
          <section className="preference-section">
            <div className="section-header">
              <h3>Your Activity</h3>
            </div>

            <div className="activity-stats">
              <div className="stat-item">
                <div className="stat-label">Total Alerts Received</div>
                <div className="stat-value">{activity.totalAlertsReceived || 0}</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">This Month</div>
                <div className="stat-value">{activity.alertsThisMonth || 0}</div>
              </div>

              {activity.lastAlertReceived && (
                <div className="stat-item">
                  <div className="stat-label">Last Alert</div>
                  <div className="stat-value">
                    {new Date(activity.lastAlertReceived).toLocaleDateString('en-IN')}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Language Selection */}
        <section className="preference-section">
          <div className="section-header">
            <h3>Language</h3>
          </div>

          <div className="language-options">
            {['english', 'hindi', 'marathi'].map((lang) => (
              <label key={lang} className="language-option">
                <input
                  type="radio"
                  name="language"
                  checked={preferences.language === lang}
                  onChange={(e) => {
                    setPreferences({
                      ...preferences,
                      language: e.target.value,
                    });
                    setUnsavedChanges(true);
                  }}
                  value={lang}
                />
                <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {unsavedChanges && (
        <div className="sticky-actions">
          <p>You have unsaved changes</p>
          <div className="action-buttons">
            <button
              onClick={handleSave}
              className="btn-save-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                fetchPreferences();
                setUnsavedChanges(false);
              }}
              className="btn-discard"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSMSPreferences;
