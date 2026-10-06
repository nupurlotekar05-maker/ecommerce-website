import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

/**
 * Wrap a <Route element> with this to enforce authentication and, optionally,
 * role-based access.
 *
 * - Not logged in            -> redirect to /login
 * - Logged in, wrong role    -> redirect to the user's own home (/home or /admin)
 * - Logged in, correct role  -> render the route
 *
 * Usage:
 *   <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><Admin/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext)

  // Wait for the initial localStorage check to finish before deciding,
  // otherwise a logged-in user gets bounced to /login on every refresh.
  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/home'} replace />
  }

  return children
}
