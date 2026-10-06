import React, { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export const AuthContext = createContext()

// LocalStorage keys
const USERS_KEY = 'ecom_users'      // holds the full "registered users" table
const SESSION_KEY = 'ecom_current_user' // holds the currently logged-in user (no password)

const AuthProvider = (props) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true until we've checked localStorage on first mount
  const navigate = useNavigate()

  // Restore session on page refresh
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(SESSION_KEY)
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Failed to restore session from localStorage:', error)
      localStorage.removeItem(SESSION_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || []
    } catch (error) {
      console.error('Failed to parse users from localStorage:', error)
      return []
    }
  }

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  const redirectByRole = (role) => {
    navigate(role === 'ADMIN' ? '/admin' : '/home')
  }

  // ---- determineRole() ----
  // The user never picks their own role anymore. Instead it is derived
  // automatically from the email address they sign up with. Any address
  // registered under the admin domain / naming convention below is treated
  // as an admin account; everyone else is a regular user.
  // Adjust ADMIN_EMAILS / ADMIN_DOMAIN to match how admins should be identified.
  const ADMIN_EMAILS = ['admin@ecommerce.com']
  const ADMIN_DOMAIN = '@admin.ecommerce.com'

  const determineRole = (normalizedEmail) => {
    if (ADMIN_EMAILS.includes(normalizedEmail) || normalizedEmail.endsWith(ADMIN_DOMAIN)) {
      return 'ADMIN'
    }
    return 'USER'
  }

  // ---- register() ----
  const register = ({ name, email, password }) => {
    if (!name?.trim() || !email?.trim() || !password) {
      toast.error('Please fill in all fields')
      return { success: false }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const users = getUsers()

    const alreadyExists = users.some(
      (u) => u.email.toLowerCase() === normalizedEmail
    )
    if (alreadyExists) {
      toast.error('An account with this email already exists')
      return { success: false }
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password, // NOTE: stored in plain text because this demo has no backend/hashing.
      role: determineRole(normalizedEmail), // role is auto-assigned, never user-chosen
    }

    users.push(newUser)
    saveUsers(users)

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)

    toast.success('Account created successfully!')
    redirectByRole(sessionUser.role)
    return { success: true }
  }

  // ---- login() ----
  const login = ({ email, password }) => {
    if (!email?.trim() || !password) {
      toast.error('Please enter both email and password')
      return { success: false }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const users = getUsers()
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    )

    if (!matchedUser) {
      toast.error('Invalid email or password')
      return { success: false }
    }

    const sessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)

    toast.success(`Welcome back, ${matchedUser.name}!`)
    redirectByRole(sessionUser.role)
    return { success: true }
  }

  // ---- logout() ----
  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    navigate('/login')
  }

  // ---- isAuthenticated() ----
  const isAuthenticated = () => !!user

  // ---- hasRole() ---- accepts a single role string or an array of roles
  const hasRole = (role) => {
    if (!user) return false
    if (Array.isArray(role)) return role.includes(user.role)
    return user.role === role
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated,
    hasRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
