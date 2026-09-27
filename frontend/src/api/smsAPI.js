import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * SMS Templates API
 */
export const smsTemplatesAPI = {
  // Create new template
  create: (templateData) =>
    axios.post(`${API_BASE_URL}/sms-templates`, templateData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get all templates with filters
  getAll: (filters = {}) =>
    axios.get(`${API_BASE_URL}/sms-templates`, {
      params: filters,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get templates by disaster type
  getByType: (disasterType) =>
    axios.get(`${API_BASE_URL}/sms-templates/type/${disasterType}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get single template
  getOne: (id) =>
    axios.get(`${API_BASE_URL}/sms-templates/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Update template
  update: (id, templateData) =>
    axios.put(`${API_BASE_URL}/sms-templates/${id}`, templateData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Delete template
  delete: (id) =>
    axios.delete(`${API_BASE_URL}/sms-templates/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Track template usage
  trackUsage: (id) =>
    axios.post(`${API_BASE_URL}/sms-templates/${id}/use`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
};

/**
 * Scheduled Alerts API
 */
export const scheduledAlertsAPI = {
  // Schedule new alert
  create: (alertData) =>
    axios.post(`${API_BASE_URL}/scheduled-alerts`, alertData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get scheduled alerts with filters
  getAll: (filters = {}) =>
    axios.get(`${API_BASE_URL}/scheduled-alerts`, {
      params: filters,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get alert statistics
  getStats: () =>
    axios.get(`${API_BASE_URL}/scheduled-alerts/stats/overview`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get pending alerts
  getPending: () =>
    axios.get(`${API_BASE_URL}/scheduled-alerts/pending`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get single alert
  getOne: (id) =>
    axios.get(`${API_BASE_URL}/scheduled-alerts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Update alert
  update: (id, alertData) =>
    axios.put(`${API_BASE_URL}/scheduled-alerts/${id}`, alertData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Cancel alert
  cancel: (id) =>
    axios.post(`${API_BASE_URL}/scheduled-alerts/${id}/cancel`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
};

/**
 * User SMS Preferences API
 */
export const userPreferencesAPI = {
  // Get user preferences
  get: () =>
    axios.get(`${API_BASE_URL}/user/sms-preferences`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Update preferences
  update: (preferences) =>
    axios.put(`${API_BASE_URL}/user/sms-preferences`, preferences, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Toggle disaster type alert
  toggleDisaster: (disasterType) =>
    axios.post(`${API_BASE_URL}/user/sms-preferences/toggle/${disasterType}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Set quiet hours
  setQuietHours: (quietHours) =>
    axios.post(`${API_BASE_URL}/user/sms-preferences/quiet-hours`, quietHours, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Set minimum severity
  setSeverity: (severity) =>
    axios.post(`${API_BASE_URL}/user/sms-preferences/severity`, { severity }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Check alert eligibility
  checkEligibility: (disasterType, severity) =>
    axios.post(
      `${API_BASE_URL}/user/sms-preferences/check`,
      { disasterType, severity },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    ),

  // Get activity stats
  getActivity: () =>
    axios.get(`${API_BASE_URL}/user/sms-preferences/activity`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
};

/**
 * SMS Alerts (for sending alerts)
 */
export const smsAlertsAPI = {
  // Send immediate SMS alert
  send: (alertData) =>
    axios.post(`${API_BASE_URL}/sms-alerts`, alertData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get alert history
  getHistory: (filters = {}) =>
    axios.get(`${API_BASE_URL}/sms-alerts/history`, {
      params: filters,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get alert details
  getDetails: (alertId) =>
    axios.get(`${API_BASE_URL}/sms-alerts/${alertId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get alert statistics
  getStats: (alertId) =>
    axios.get(`${API_BASE_URL}/sms-alerts/${alertId}/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Retry failed SMS
  retryFailed: (alertId) =>
    axios.post(`${API_BASE_URL}/sms-alerts/${alertId}/retry-failed`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
};

/**
 * Notification API (General notifications)
 */
export const notificationAPI = {
  // Create notification
  create: (notificationData) =>
    axios.post(`${API_BASE_URL}/notify`, notificationData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Get notifications
  getAll: () =>
    axios.get(`${API_BASE_URL}/notify`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Mark as read
  markAsRead: (id) =>
    axios.put(`${API_BASE_URL}/notify/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),

  // Delete notification
  delete: (id) =>
    axios.delete(`${API_BASE_URL}/notify/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
};

export default {
  smsTemplatesAPI,
  scheduledAlertsAPI,
  userPreferencesAPI,
  smsAlertsAPI,
  notificationAPI,
};
