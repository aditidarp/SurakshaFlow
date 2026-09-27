// Alert Service - API calls for alert management
const API_BASE = 'http://localhost:5000/api';

export const alertService = {
  // Fetch all alerts
  getAlerts: async () => {
    try {
      const response = await fetch(`${API_BASE}/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  // Create new alert
  createAlert: async (alertData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      });
      if (!response.ok) throw new Error('Failed to create alert');
      return await response.json();
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  // Update alert
  updateAlert: async (alertId, alertData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      });
      if (!response.ok) throw new Error('Failed to update alert');
      return await response.json();
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  },

  // Delete alert
  deleteAlert: async (alertId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete alert');
      return await response.json();
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }
};
