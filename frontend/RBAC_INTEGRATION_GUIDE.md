# RBAC Quick Integration Guide

This guide shows how to add role-based access control to any component in your app.

## Pattern 1: Conditional Rendering Based on Role

### Example 1: Show Button Only to Admins
```jsx
import { useAuth } from '../contexts/AuthContext';

function AlertsPage() {
  const { isAdmin } = useAuth();

  return (
    <div>
      <h1>Alerts</h1>
      
      {/* Only admins see this button */}
      {isAdmin && (
        <button onClick={createAlert} className="btn-primary">
          ➕ Create New Alert
        </button>
      )}

      <AlertsList />
    </div>
  );
}
```

### Example 2: Show Different Content Based on Role
```jsx
function Dashboard() {
  const { role } = useAuth();

  return (
    <div>
      {role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
}
```

### Example 3: Show/Hide Edit & Delete Buttons
```jsx
function AlertCard({ alert }) {
  const { isAdmin } = useAuth();

  return (
    <div className="alert-card">
      <h3>{alert.title}</h3>
      <p>{alert.description}</p>
      
      <div className="actions">
        {/* Read-only for everyone */}
        <button className="btn-view">👁️ View</button>

        {/* Admin-only buttons */}
        {isAdmin && (
          <>
            <button className="btn-edit">✏️ Edit</button>
            <button className="btn-delete">🗑️ Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
```

## Pattern 2: Route-Level Access Control

### Protect Entire Route
```jsx
// In App.js
<Route
  path="/admin-settings"
  element={
    <AdminRoute>
      <AdminSettings />
    </AdminRoute>
  }
/>
```

### Component-Level Route Check
```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function SettingsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return <AccessDeniedMessage />;
  }

  return <SettingsContent />;
}
```

## Pattern 3: Add Role to Existing Components

### Step 1: Import useAuth
```jsx
import { useAuth } from '../contexts/AuthContext';
```

### Step 2: Extract Role in Component
```jsx
function MyComponent() {
  const { role, isAdmin, isUser, userEmail, logout } = useAuth();
  // ... rest of component
}
```

### Step 3: Use Role in JSX
```jsx
<div>
  {isAdmin && <AdminFeatures />}
  {isUser && <UserFeatures />}
</div>
```

## Pattern 4: Show Role Label in Header/Navbar

### Add UserHeader Component
```jsx
import UserHeader from './components/UserHeader';

function App() {
  return (
    <div>
      <UserHeader /> {/* Shows role and logout */}
      <MainContent />
    </div>
  );
}
```

### Or Create Custom Role Label
```jsx
import { useAuth } from '../contexts/AuthContext';

function RoleLabel() {
  const { role } = useAuth();
  
  const roleDisplay = role === 'admin' ? '👑 Admin' : '👤 User';
  const color = role === 'admin' ? 'red' : 'blue';

  return (
    <span style={{ color, fontWeight: 'bold' }}>
      {roleDisplay}
    </span>
  );
}
```

## Pattern 5: Logout Anywhere

### Add Logout to Any Component
```jsx
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserMenu() {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears all auth data
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <p>Logged in as: {userEmail}</p>
      <button onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
}
```

## Pattern 6: Disable Features for Non-Admins

### Disable Button
```jsx
function AlertActions({ alertId }) {
  const { isAdmin } = useAuth();

  return (
    <button 
      onClick={() => editAlert(alertId)}
      disabled={!isAdmin}
      title={isAdmin ? 'Edit alert' : 'Only admins can edit'}
    >
      ✏️ Edit
    </button>
  );
}
```

### Disable Form Section
```jsx
function CreateAlertForm() {
  const { isAdmin } = useAuth();

  return (
    <form disabled={!isAdmin} style={{ opacity: isAdmin ? 1 : 0.5 }}>
      <input placeholder="Alert title" />
      {/* Form fields */}
      <button disabled={!isAdmin}>Create Alert</button>
    </form>
  );
}
```

## Pattern 7: Conditional Style Based on Role

```jsx
function AlertCard({ alert }) {
  const { isAdmin } = useAuth();

  return (
    <div 
      className="alert-card"
      style={{
        borderLeft: isAdmin ? '4px solid #ef4444' : '4px solid #3b82f6',
        background: isAdmin ? '#fef2f2' : '#f0f9ff'
      }}
    >
      {alert.title}
    </div>
  );
}
```

## Pattern 8: Different Component Rendering

### Load Different Component Based on Role
```jsx
function AlertDetail({ alertId }) {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <AdminAlertDetail alertId={alertId} />;
  } else {
    return <UserAlertDetail alertId={alertId} />;
  }
}
```

### Render Additional Admin Sections
```jsx
function Alert({ alert }) {
  const { isAdmin } = useAuth();

  return (
    <div>
      {/* Common to all roles */}
      <AlertHeader alert={alert} />
      <AlertBody alert={alert} />

      {/* Admin-only sections */}
      {isAdmin && (
        <>
          <AdminAuditLog alert={alert} />
          <AdminActionPanel alert={alert} />
          <AdminMetrics alert={alert} />
        </>
      )}
    </div>
  );
}
```

## Pattern 9: Check Multiple Conditions

```jsx
function SpecialFeature() {
  const { isAdmin, isUser, role, isAuthenticated } = useAuth();

  // Only authenticated admins can access
  if (!isAuthenticated || !isAdmin) {
    return <AccessDenied />;
  }

  // Specific role
  if (role === 'rescue_team') {
    return <RescueTeamFeature />;
  }

  return <FeatureContent />;
}
```

## Pattern 10: Track Role Changes

```jsx
function UserProfile() {
  const { role } = useAuth();

  useEffect(() => {
    console.log('User role changed to:', role);
    // Track analytics, update sidebar, etc.
  }, [role]);

  return <ProfileContent />;
}
```

## Complete Example: Converting Existing Component

### Before (No RBAC)
```jsx
function ManageAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <h1>Alert Management</h1>
      <button onClick={() => setShowForm(true)}>
        Create Alert
      </button>
      
      {alerts.map(alert => (
        <div key={alert._id}>
          <h3>{alert.title}</h3>
          <button>Edit</button>
          <button>Delete</button>
        </div>
      ))}

      {showForm && <AlertForm />}
    </div>
  );
}
```

### After (With RBAC)
```jsx
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function ManageAlerts() {
  const navigate = useNavigate();
  const { isAdmin, role, logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Show access denied if not admin
  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div>
      <div className="header">
        <h1>Alert Management</h1>
        <div className="role-info">
          🔐 Logged in as <strong>Admin</strong>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Only admins see this button */}
      <button onClick={() => setShowForm(true)} className="btn-primary">
        ➕ Create Alert
      </button>
      
      {/* Alert list */}
      {alerts.map(alert => (
        <div key={alert._id} className="alert-card">
          <h3>{alert.title}</h3>
          
          {/* Admin-only action buttons */}
          <div className="actions">
            <button onClick={() => editAlert(alert._id)}>✏️ Edit</button>
            <button onClick={() => deleteAlert(alert._id)}>🗑️ Delete</button>
          </div>
        </div>
      ))}

      {/* Form only shown to admins */}
      {showForm && isAdmin && <AlertForm />}
    </div>
  );
}

export default ManageAlerts;
```

## Testing Your RBAC Implementation

```jsx
// In console while app is running
const getAuthState = () => {
  return {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    email: localStorage.getItem('userEmail')
  };
};

getAuthState();
// Output:
// {
//   token: "eyJhbGc...",
//   role: "admin",
//   email: "admin@example.com"
// }
```

## Common useAuth Properties

```jsx
const {
  token,           // JWT token (string or null)
  role,            // 'user', 'admin', 'rescue_team', or null
  userEmail,       // User email (string or null)
  loading,         // Auth context is loading (boolean)
  login,           // Function to login (token, role, email)
  logout,          // Function to logout (clears everything)
  isAuthenticated, // Boolean: !!token
  isAdmin,         // Boolean: role === 'admin'
  isUser,          // Boolean: role === 'user'
} = useAuth();
```

## Checklist for RBAC Integration

- [ ] Import `useAuth` from context
- [ ] Extract needed properties: `isAdmin`, `role`, etc.
- [ ] Add `useEffect` to redirect non-authorized users
- [ ] Wrap sensitive components in `{isAdmin && <Component />}`
- [ ] Add role label to header: "Logged in as Admin"
- [ ] Add logout button using `logout()` function
- [ ] Test with both user and admin accounts
- [ ] Verify localStorage has correct `role` key
- [ ] Test in private/incognito mode for clean session
- [ ] Check that backend validates role on requests

---

**Need more examples?** Check `RBAC_IMPLEMENTATION.md` for detailed architecture and `RBAC_TESTING_CHECKLIST.md` for testing steps.
