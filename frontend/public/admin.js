// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');

  // Redirect to login if no token or not admin role
  if (!token || userRole !== 'admin') {
    window.location.href = '/login';
    return;
  }

  // Display admin email in UI
  const emailDisplay = document.getElementById('adminEmail');
  if (emailDisplay) {
    emailDisplay.textContent = userEmail || 'Admin';
  }

  console.log('✅ Admin authenticated as:', userEmail);
});

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function logout() {
  // Clear all auth data
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("role");
  
  // Disconnect Socket.io if exists
  if (typeof socket !== 'undefined' && socket) {
    socket.disconnect();
  }
  
  // Redirect to login
  window.location.href = "/login";
}
