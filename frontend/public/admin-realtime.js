// ============================================
// REAL-TIME ADMIN DASHBOARD
// Socket.io + API Integration
// ============================================

let socket = null;
let allAlerts = [];
const API_BASE = 'http://localhost:5000/api';
const ALERT_TYPES = ['Flood', 'Earthquake', 'Cyclone', 'Fire', 'Landslide'];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const SEVERITY_COLORS = {
  'Low': '#10b981',
  'Medium': '#f59e0b',
  'High': '#ef4444',
  'Critical': '#7c2d12'
};

// Initialize Socket.io connection
function initializeSocket() {
  socket = io('http://localhost:5000', {
    auth: {
      token: localStorage.getItem('token')
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Socket.io connected');
  });

  // Real-time listeners
  socket.on('newAlert', (alert) => {
    console.log('📦 New alert received:', alert);
    if (!allAlerts.some(a => a._id === alert._id)) {
      allAlerts.unshift(alert);
      renderAlertsTable();
      showNotification('New alert created!', 'success');
    }
  });

  socket.on('updateAlert', (alert) => {
    console.log('🔄 Alert updated:', alert);
    const index = allAlerts.findIndex(a => a._id === alert._id);
    if (index !== -1) {
      allAlerts[index] = alert;
      renderAlertsTable();
      showNotification('Alert updated!', 'success');
    }
  });

  socket.on('deleteAlert', (data) => {
    console.log('🗑️ Alert deleted:', data.id);
    allAlerts = allAlerts.filter(a => a._id !== data.id);
    renderAlertsTable();
    showNotification('Alert deleted!', 'success');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.io disconnected');
  });
}

// Fetch alerts from API
async function fetchAlerts() {
  try {
    const response = await fetch(`${API_BASE}/alerts`);
    const data = await response.json();
    allAlerts = data;
    renderAlertsTable();
    updateDashboardStats();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    showNotification('Failed to fetch alerts', 'error');
  }
}

// Create new alert
async function createAlert(formData) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Failed to create alert');
    
    const alert = await response.json();
    showNotification('Alert created successfully!', 'success');
    resetForm();
    return alert;
  } catch (error) {
    console.error('Error creating alert:', error);
    showNotification('Error creating alert', 'error');
  }
}

// Update alert
async function updateAlert(alertId, formData) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Failed to update alert');
    
    const alert = await response.json();
    showNotification('Alert updated successfully!', 'success');
    resetForm();
    return alert;
  } catch (error) {
    console.error('Error updating alert:', error);
    showNotification('Error updating alert', 'error');
  }
}

// Delete alert
async function deleteAlert(alertId) {
  const token = localStorage.getItem('token');
  if (!confirm('Are you sure you want to delete this alert?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to delete alert');
    
    showNotification('Alert deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting alert:', error);
    showNotification('Error deleting alert', 'error');
  }
}

// Render alerts table
function renderAlertsTable() {
  const tbody = document.getElementById('alertsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (allAlerts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No alerts yet</td></tr>';
    return;
  }

  allAlerts.forEach(alert => {
    const row = document.createElement('tr');
    const createdAt = new Date(alert.createdAt).toLocaleString();
    
    row.innerHTML = `
      <td><strong>${alert.title}</strong></td>
      <td>${alert.type}</td>
      <td>${alert.location}</td>
      <td><span style="background: ${SEVERITY_COLORS[alert.severity]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${alert.severity}</span></td>
      <td>${alert.affectedArea || '-'}</td>
      <td>${alert.casualties || 0}</td>
      <td>${createdAt}</td>
      <td>
        <button onclick="editAlertBtn('${alert._id}')" style="margin-right: 5px; padding: 5px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">✏️ Edit</button>
        <button onclick="deleteAlert('${alert._id}')" style="padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️ Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Edit alert button
function editAlertBtn(alertId) {
  const alert = allAlerts.find(a => a._id === alertId);
  if (!alert) return;

  document.getElementById('alertTitle').value = alert.title;
  document.getElementById('alertDescription').value = alert.description;
  document.getElementById('alertType').value = alert.type;
  document.getElementById('alertLocation').value = alert.location;
  document.getElementById('alertSeverity').value = alert.severity;
  document.getElementById('alertAffectedArea').value = alert.affectedArea || '';
  document.getElementById('alertCasualties').value = alert.casualties || 0;
  document.getElementById('alertFormTitle').textContent = '✏️ Edit Alert';
  document.getElementById('alertFormSubmitBtn').textContent = 'Update Alert';
  document.getElementById('currentEditingAlertId').value = alertId;
  
  document.getElementById('alertFormSection').scrollIntoView({ behavior: 'smooth' });
}

// Handle form submission
document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || userRole !== 'admin') {
    window.location.href = '/login';
    return;
  }

  // Initialize Socket.io
  initializeSocket();
  
  // Fetch alerts
  await fetchAlerts();

  // Form submission
  const alertForm = document.getElementById('alertForm');
  if (alertForm) {
    alertForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const editingAlertId = document.getElementById('currentEditingAlertId').value;
      const formData = {
        title: document.getElementById('alertTitle').value,
        description: document.getElementById('alertDescription').value,
        type: document.getElementById('alertType').value,
        location: document.getElementById('alertLocation').value,
        severity: document.getElementById('alertSeverity').value,
        affectedArea: document.getElementById('alertAffectedArea').value,
        casualties: parseInt(document.getElementById('alertCasualties').value) || 0
      };

      if (editingAlertId) {
        await updateAlert(editingAlertId, formData);
      } else {
        await createAlert(formData);
      }
    });
  }

  // Cancel edit button
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
  }
});

// Reset form
function resetForm() {
  document.getElementById('alertForm').reset();
  document.getElementById('currentEditingAlertId').value = '';
  document.getElementById('alertFormTitle').textContent = '➕ Create New Alert';
  document.getElementById('alertFormSubmitBtn').textContent = 'Create Alert';
}

// Show notification
function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
  `;
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Update dashboard stats
function updateDashboardStats() {
  const totalAlerts = allAlerts.length;
  const activeAlerts = allAlerts.filter(a => a.status === 'Active').length;
  const criticalAlerts = allAlerts.filter(a => a.severity === 'Critical').length;
  const totalCasualties = allAlerts.reduce((sum, a) => sum + (a.casualties || 0), 0);

  const elem1 = document.getElementById('totalAlertsCard');
  const elem2 = document.getElementById('activeAlertsCard');
  const elem3 = document.getElementById('criticalAlertsCard');
  const elem4 = document.getElementById('totalCasualtiesCard');

  if (elem1) elem1.textContent = totalAlerts;
  if (elem2) elem2.textContent = activeAlerts;
  if (elem3) elem3.textContent = criticalAlerts;
  if (elem4) elem4.textContent = totalCasualties;
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
