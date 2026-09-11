import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/Users'
import AdminStores from './pages/admin/Stores'
import UserStores from './pages/user/Stores'
import UserProfile from './pages/user/Profile'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import Button from './components/common/Button'
import Layout from './components/Layout'
import LoadingIndicator from './components/Loading'

const MainContent = () => {
  const { user, loading, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [authView, setAuthView] = useState('login')
  
  // Navigation State
  const [adminTab, setAdminTab] = useState('dashboard')
  const [userTab, setUserTab] = useState('stores')
  const [ownerTab, setOwnerTab] = useState('dashboard')

  if (loading) {
    return <LoadingIndicator text="Restoring session..." />
  }

  // Admin View
  if (isAuthenticated && user?.role === 'ADMIN') {
    return (
      <Layout role="ADMIN" activeTab={adminTab} onTabChange={setAdminTab}>
        {adminTab === 'dashboard' && <AdminDashboard onNavigate={setAdminTab} />}
        {adminTab === 'users' && <AdminUsers />}
        {adminTab === 'stores' && <AdminStores />}
      </Layout>
    )
  }

  // Store Owner View
  if (isAuthenticated && user?.role === 'STORE_OWNER') {
    return (
      <Layout role="STORE_OWNER" activeTab={ownerTab} onTabChange={setOwnerTab}>
        {ownerTab === 'dashboard' && <OwnerDashboard />}
        {ownerTab === 'profile' && <UserProfile />}
      </Layout>
    )
  }

  // Normal User View
  if (isAuthenticated && user?.role === 'USER') {
    return (
      <Layout role="USER" activeTab={userTab} onTabChange={setUserTab}>
        {userTab === 'stores' && <UserStores />}
        {userTab === 'profile' && <UserProfile />}
      </Layout>
    )
  }

  // Public / Auth Views
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              S
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Store Rating</span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant={authView === 'login' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setAuthView('login')}
              >
                Sign In
              </Button>
              <Button
                variant={authView === 'register' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setAuthView('register')}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
