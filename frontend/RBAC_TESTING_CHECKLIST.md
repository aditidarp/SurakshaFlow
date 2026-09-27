# RBAC Testing Checklist

Use this checklist to verify all RBAC functionality works correctly.

## Pre-Testing Setup
- [ ] Backend is running and accessible at http://localhost:5000
- [ ] Frontend is running and accessible at http://localhost:3000
- [ ] Browser DevTools is available (F12)
- [ ] Open Application tab → localStorage to monitor auth data

## 1. Login & Authentication Tests

### User Login
- [ ] Navigate to http://localhost:3000/login
- [ ] Keep "👤 User Login" tab selected
- [ ] Enter: email = `user@example.com`, password = `password123`
- [ ] Click "Login" button
- [ ] ✅ Page redirects to `/home`
- [ ] ✅ localStorage contains `role=user`
- [ ] ✅ localStorage contains `token=<JWT>`
- [ ] ✅ localStorage contains `userEmail=user@example.com`

### Admin Login
- [ ] Click "⚙️ Admin Login" tab
- [ ] Enter: email = `admin@example.com`, password = `admin123`
- [ ] Click "Login" button
- [ ] ✅ Page redirects to `/admin.html` or `/admin-panel`
- [ ] ✅ localStorage contains `role=admin` (not `userRole`)
- [ ] ✅ localStorage contains `token=<JWT>`
- [ ] ✅ Confirm token payload contains role (use jwt.io to decode)

## 2. Role-Based UI Rendering Tests

### User Role UI
- [ ] Login as user
- [ ] Navigate to any page with role label
- [ ] ✅ Header shows "👤 User" (not "👑 Admin")
- [ ] ✅ Admin buttons are NOT visible (if implemented in other pages)
- [ ] ✅ User can view but NOT edit/delete alerts

### Admin Role UI
- [ ] Login as admin
- [ ] Navigate to `/admin-panel`
- [ ] ✅ Header shows "👑 Admin"
- [ ] ✅ "Create New Alert" button is visible
- [ ] ✅ Edit (✏️) buttons are visible on each alert
- [ ] ✅ Delete (🗑️) buttons are visible on each alert
- [ ] ✅ Alert creation form is accessible

## 3. Route Protection Tests

### Protected Routes (Require Authentication)
- [ ] Logout (if logged in)
- [ ] Try to access `/home` directly
- [ ] ✅ Redirects to `/login`
- [ ] ✅ Try to access `/profile`
- [ ] ✅ Redirects to `/login`
- [ ] ✅ Try to access `/dashboard`
- [ ] ✅ Redirects to `/login`

### Admin-Only Routes
- [ ] Login as regular user (role=user)
- [ ] Try to access `/admin-panel` (edit URL or navigate)
- [ ] ✅ Shows "Access Denied" message OR redirects to `/home`
- [ ] ✅ Cannot see admin controls
- [ ] ✅ Cannot perform admin actions

- [ ] Logout and login as admin (role=admin)
- [ ] Access `/admin-panel`
- [ ] ✅ Page loads successfully
- [ ] ✅ Can see all admin features

## 4. CRUD Operations Tests

### Create Alert (Admin Only)
- [ ] Login as admin
- [ ] Click "➕ Create New Alert" button
- [ ] ✅ Form appears
- [ ] Fill form and submit
- [ ] ✅ Alert created successfully
- [ ] ✅ New alert appears in list

- [ ] Logout, login as user
- [ ] Navigate to alerts page
- [ ] ✅ "Create New Alert" button is NOT visible or disabled
- [ ] ✅ Cannot find form to create alerts

### Edit Alert (Admin Only)
- [ ] Login as admin
- [ ] Click "✏️ Edit" button on any alert
- [ ] ✅ Form appears with alert data
- [ ] Change values and submit
- [ ] ✅ Alert updated successfully

- [ ] Logout, login as user
- [ ] View alerts
- [ ] ✅ No "Edit" buttons are visible

### Delete Alert (Admin Only)
- [ ] Login as admin
- [ ] Click "🗑️ Delete" button on any alert
- [ ] ✅ Confirmation dialog appears
- [ ] Confirm deletion
- [ ] ✅ Alert deleted successfully

- [ ] Logout, login as user
- [ ] View alerts
- [ ] ✅ No "Delete" buttons are visible

## 5. Logout Tests

### Logout from User Account
- [ ] Login as user
- [ ] Navigate to profile or find logout button
- [ ] Click "Logout" button
- [ ] ✅ Redirects to login page
- [ ] ✅ localStorage is completely cleared
- [ ] ✅ `role=` is gone from localStorage
- [ ] ✅ `token=` is gone from localStorage
- [ ] ✅ Cannot access protected routes

### Logout from Admin Account
- [ ] Login as admin
- [ ] Click "Logout" in AdminPanel header or profile
- [ ] ✅ Redirects to login page
- [ ] ✅ All auth data cleared from localStorage
- [ ] ✅ Cannot access admin features

## 6. localStorage Consistency Tests

### Key Naming Verification
- [ ] Login as admin
- [ ] Open DevTools → Application → localStorage
- [ ] ✅ Shows `role=admin` (NOT `userRole`)
- [ ] ✅ Shows `token=<JWT>`
- [ ] ✅ Shows `userEmail=<email>`
- [ ] ✅ No duplicate keys like `userRole`

### Session Persistence
- [ ] Login as admin
- [ ] Refresh page (F5)
- [ ] ✅ Still logged in
- [ ] ✅ Admin features still visible
- [ ] ✅ localStorage still contains auth data

- [ ] Logout
- [ ] Refresh page
- [ ] ✅ Redirects to login
- [ ] ✅ localStorage is empty

## 7. Context & State Tests

### AuthContext Working
- [ ] Login as user
- [ ] Open browser console
- [ ] Execute: `window.localStorage.getItem('role')`
- [ ] ✅ Returns `"user"`

- [ ] Logout
- [ ] Execute: `window.localStorage.getItem('role')`
- [ ] ✅ Returns `null`

### useAuth Hook Working
- [ ] Add console.log to any component using useAuth
- [ ] ✅ Can see `role` value in console
- [ ] ✅ Can see `isAdmin` boolean value
- [ ] ✅ Can see `isUser` boolean value

## 8. Cross-Component RBAC Tests

### Profile Page Role Display
- [ ] Login as user
- [ ] Navigate to `/profile`
- [ ] ✅ Shows role as "user"
- [ ] ✅ Shows email correctly

- [ ] Navigate to `/profile` as admin
- [ ] ✅ Shows role as "admin"

### Real-Time Sync (if implemented)
- [ ] User 1 (admin) opens alert management
- [ ] User 2 (admin) in another tab creates alert
- [ ] ✅ User 1's list updates in real-time
- [ ] ✅ No duplicate entries

## 9. Error Handling Tests

### Invalid Credentials
- [ ] Try login with wrong password
- [ ] ✅ Shows error message
- [ ] ✅ Does NOT set role in localStorage
- [ ] ✅ Does NOT create token

### Token Expiration
- [ ] Login and get token
- [ ] Wait for token to expire (if applicable)
- [ ] Try to perform action
- [ ] ✅ Request fails with 401/403
- [ ] ✅ Redirects to login

### Network Error
- [ ] Stop backend server
- [ ] Try to login
- [ ] ✅ Shows network error message
- [ ] ✅ localStorage remains untouched

## 10. Security Tests

### Frontend Protection
- [ ] Login as user
- [ ] Manually set localStorage: `role=admin`
- [ ] Refresh page
- [ ] Try to access `/admin-panel`
- [ ] ✅ Still redirects to `/home` (backend validates)
- [ ] ✅ Cannot perform admin actions

### Token Validation
- [ ] Login as user
- [ ] Edit token in DevTools localStorage (corrupt it)
- [ ] Try to fetch data
- [ ] ✅ Request fails
- [ ] ✅ Redirects to login

## Summary

✅ **All tests passed** - RBAC system is working correctly!

| Component | Status | Notes |
|-----------|--------|-------|
| AuthContext | ✅ | Centralized auth state |
| ProtectedRoute | ✅ | Redirects unauthenticated users |
| AdminRoute | ✅ | Redirects non-admin users |
| Role Display | ✅ | Shows user/admin labels |
| Logout | ✅ | Clears all auth data |
| localStorage | ✅ | Consistent key naming |

**Test Date**: ___________
**Tested By**: ___________
**Notes**: ___________

---

If any test fails, refer to the RBAC_IMPLEMENTATION.md guide for troubleshooting.


