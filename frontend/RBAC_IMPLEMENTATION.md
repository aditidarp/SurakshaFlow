# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document explains the Role-Based Access Control (RBAC) system implemented in the NDMA disaster management application. The system provides secure, role-based UI rendering and route protection to ensure users only access features appropriate for their role.

## Architecture

### 1. **AuthContext** (`frontend/src/contexts/AuthContext.jsx`)

The authentication context manages the entire state for authentication and authorization.

**Features:**
- Centralizes authentication state management
- Persists auth data to localStorage
- Provides `useAuth()` custom hook for easy access to auth state
- Handles login/logout operations
- Provides convenience properties: `isAuthenticated`, `isAdmin`, `isUser`

**Usage:**
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { role, isAdmin, isUser, login, logout, userEmail } = useAuth();
  
  if (isAdmin) {
    // Show admin controls
  } else {
    // Show user controls
  }
}
```

### 2. **Protected Routes** (`frontend/src/App.js`)

Routes are protected at two levels:

#### ProtectedRoute
Requires authentication (token exists):
```jsx
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  }
/>
```

#### AdminRoute
Requires both authentication AND admin role:
```jsx
<Route
  path="/admin-panel"
  element={
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  }
/>
```

### 3. **User Roles**

The system supports three roles (defined in backend `User.js` model):

| Role | Access Level | Features |
|------|------|----------|
| `user` | Basic | View alerts, user profile, read-only access |
| `admin` | Full | Create/Edit/Delete alerts, manage all features |
| `rescue_team` | Extended | View all alerts, respond to emergencies |

## Implementation Details

### Login Flow

1. **User submits login form** with email, password, and selected role
2. **Backend verifies credentials** and role authorization
3. **Backend returns JWT token** with role embedded in payload
4. **Frontend stores in AuthContext:**
   - `token` → localStorage
   - `role` → localStorage (e.g., "admin" or "user")
   - `userEmail` → localStorage

### Component-Level Access Control

**Example: AdminPanel.jsx**

```jsx
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { role, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Show access denied message if not admin
  if (!isAdmin) {
    return <AccessDeniedMessage />;
  }

  // Admin content is rendered
  return (
    <div>
      <h1>Alert Management</h1>
      <button onClick={() => createNewAlert()}>Create Alert</button>
      <AlertsList />
    </div>
  );
};
```

### Conditional Rendering

Show content only for admin users:
```jsx
{isAdmin && (
  <button onClick={handleEdit} className="edit-button">
    ✏️ Edit
  </button>
)}

{isAdmin && (
  <form onSubmit={handleCreateAlert}>
    {/* Admin form fields */}
  </form>
)}
```

Show different UI based on role:
```jsx
<div>
  {isAdmin ? (
    <AdminDashboard />
  ) : (
    <UserDashboard />
  )}
</div>
```

### Logout Implementation

```jsx
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Clears token, role, email from context and localStorage
  navigate('/login', { replace: true });
};
```

The logout function:
- Removes all auth data from localStorage
- Clears context state (token, role, userEmail)
- Redirects user to login page

## Updated Components

### 1. **AuthContext** (NEW)
- **File**: `frontend/src/contexts/AuthContext.jsx`
- **Purpose**: Central auth state management
- **Exports**: `AuthProvider`, `useAuth()`

### 2. **index.js**
- **Change**: Wrapped App with `<AuthProvider>`
- **Why**: Makes auth context available to entire app

### 3. **App.js**
- **Changes**: 
  - Import `useAuth` hook
  - Update `ProtectedRoute` to use context instead of localStorage
  - Update `AdminRoute` to use context instead of localStorage
  - Root route uses `isAuthenticated` from context
- **Benefit**: Ensures consistent auth state across app

### 4. **LoginPage.js**
- **Changes**:
  - Import `useAuth` hook
  - Use `login()` method from context
  - Fixed localStorage key: `"role"` (was `"userRole"`)
- **Benefit**: Consistent role key throughout app

### 5. **UserProfile.jsx**
- **Changes**:
  - Import `useAuth` hook
  - Use `logout()` method from context
  - Redirect to login page after logout
- **Benefit**: Proper logout with context cleanup

### 6. **AdminPanel.jsx**
- **Changes**:
  - Import `useAuth` hook
  - Add role check to redirect non-admins
  - Show access denied message if not admin
  - Added role label in header: "Logged in as Admin"
  - Added logout button in header
- **Benefit**: Component-level access control + role display

### 7. **UserHeader** (NEW)
- **File**: `frontend/src/components/UserHeader.jsx`
- **Purpose**: Display user role and logout button
- **Can be used**: In navbar/header of pages

## Testing the RBAC System

### Test Case 1: User Login
```
1. Navigate to /login
2. Keep "User Login" tab selected
3. Enter email: user@example.com
4. Enter password: password123
5. Click "Login"

Expected Results:
✓ Redirects to /home
✓ localStorage has role="user"
✓ Can view alerts in UserAlerts
✓ Cannot access /admin-panel (redirects to /home)
✓ Header shows "👤 User" role label
```

### Test Case 2: Admin Login
```
1. Navigate to /login
2. Click "Admin Login" tab
3. Enter email: admin@example.com
4. Enter password: admin123
5. Click "Login"

Expected Results:
✓ Redirects to /admin.html or /admin-panel
✓ localStorage has role="admin"
✓ Can create new alerts
✓ Can edit existing alerts
✓ Can delete alerts
✓ Header shows "👑 Admin" role label
✓ Can access all admin-only routes
```

### Test Case 3: Route Protection
```
1. Login as user
2. Try to access /admin-panel directly (edit URL)

Expected Results:
✓ Route protection redirects to /home
✓ AdminPanel component shows "Access Denied" message
✓ Cannot perform admin actions
```

### Test Case 4: Logout
```
1. Login as user or admin
2. Click "Logout" button (in UserProfile or AdminPanel header)

Expected Results:
✓ localStorage is cleared (token, role, userEmail)
✓ Redirects to /login page
✓ Cannot access protected routes
✓ Must login again to access features
```

### Test Case 5: localStorage Consistency
```
1. Open browser DevTools → Application → localStorage
2. Login as admin
3. Check localStorage values

Expected Results:
✓ role="admin" (not "userRole")
✓ token=<jwt_token>
✓ userEmail=<email>
✓ All keys use consistent naming
```

## Security Considerations

### Frontend Protection
- ✅ Routes redirect non-authenticated users to login
- ✅ Admin routes redirect non-admin users to home
- ✅ Components check role before rendering sensitive controls
- ✅ Logout clears auth state completely

### Backend Validation (Already Implemented)
- ✅ JWT tokens are validated on every request
- ✅ Role is embedded and verified in JWT payload
- ✅ API endpoints check user.role before allowing actions
- ✅ Sensitive operations require admin role at controller level

### Best Practices
- **Never trust frontend role checks alone** - Backend MUST validate
- **Frontend protections are for UX** - Backend protections are for security
- **Keep JWT secret safe** - Should be environment variable
- **Use HTTPS** - Tokens transmitted securely
- **Token expiration** - Currently 1 day (see backend config)

## Common Issues & Solutions

### Issue: "Cannot read property 'isAdmin' of undefined"
**Cause**: Missing `<AuthProvider>` wrapper
**Solution**: Ensure index.js wraps App with `<AuthProvider>`

### Issue: Admin button not showing
**Cause**: Role not stored in localStorage properly
**Solution**: Check that LoginPage uses correct key: `localStorage.setItem('role', ...)`

### Issue: User can access admin route
**Cause**: AdminRoute not checking role correctly
**Solution**: Ensure AdminRoute uses `isAdmin` from useAuth

### Issue: Logout doesn't clear everything
**Cause**: Using localStorage.removeItem instead of AuthContext logout
**Solution**: Always use `logout()` from useAuth context

## File Structure

```
frontend/src/
├── contexts/
│   └── AuthContext.jsx          ← Central auth state
├── components/
│   ├── LoginPage.js             ← Updated with useAuth
│   ├── UserProfile.jsx          ← Updated with logout
│   ├── AdminPanel.jsx           ← Updated with role check
│   ├── UserHeader.jsx           ← NEW: Role label display
│   ├── AdminPanel.css           ← Updated with role styles
│   ├── UserHeader.css           ← NEW: Header styles
│   └── ...other components
├── App.js                        ← Updated routes with useAuth
└── index.js                      ← Updated with AuthProvider
```

## Next Steps

1. **Test the implementation** - Follow testing guide above
2. **Add role to other components** - Apply same pattern to other admin features
3. **Create role-based components** - Separate admin/user UIs into different files
4. **Enhance UI** - Add more visual indicators for user role
5. **Backend improvements** - Add more sophisticated permission system if needed

## API Integration

The backend already supports roles. Here's what's available:

### Login Endpoint
```
POST /auth/login
Body: { email, password, role }
Response: { message, token, role }
```

### Protected Endpoints
- **User endpoints**: Any authenticated user
- **Admin endpoints**: `role === "admin"` required
- See backend API_DOCUMENTATION.md for details

## References

- **Frontend**: `frontend/src/contexts/AuthContext.jsx`
- **Backend Auth**: `backend/controllers/authController.js`
- **Backend Model**: `backend/models/User.js`
- **Backend Routes**: `backend/routes/authRoutes.js`
- **Backend Middleware**: `backend/middleware/authMiddleware.js`, `backend/middleware/roleMiddleware.js`

---

**Last Updated**: 2024
**Status**: Production Ready ✅
