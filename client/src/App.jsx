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
  const { user, loading, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [authView, setAuthView] = useState('login') // 'login' | 'register'
  
  // Navigation State
  const [adminTab, setAdminTab] = useState('dashboard') // 'dashboard' | 'users' | 'stores'
  const [userTab, setUserTab] = useState('stores') // 'stores' | 'profile'
  const [ownerTab, setOwnerTab] = useState('dashboard') // 'dashboard' | 'profile'

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

  // Unauthenticated / Auth views
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              S
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Store Rating</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full ml-2 font-medium">
                System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

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
