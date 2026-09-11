import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

// Default Icons using basic SVG
const Icons = {
  Dashboard: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Users: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Stores: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Profile: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

export const Layout = ({ role, activeTab, onTabChange, children }) => {
  // Define navigation based on role
  let navigation = []
  let roleConfig = {}

  if (role === 'ADMIN') {
    roleConfig = {
      title: 'Admin Console',
      subtitle: 'System Control',
      initial: 'A',
      theme: 'from-indigo-600 to-purple-600',
      activeBg: 'bg-indigo-600',
      textTheme: 'text-indigo-400'
    }
    navigation = [
      { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
      { id: 'users', label: 'Users', icon: Icons.Users },
      { id: 'stores', label: 'Stores', icon: Icons.Stores },
    ]
  } else if (role === 'STORE_OWNER') {
    roleConfig = {
      title: 'Owner Portal',
      subtitle: 'Store Management',
      initial: 'O',
      theme: 'from-purple-600 to-indigo-600',
      activeBg: 'bg-purple-600',
      textTheme: 'text-purple-400'
    }
    navigation = [
      { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
      { id: 'profile', label: 'Profile', icon: Icons.Profile }, // Optional, based on requirements
    ]
  } else {
    // USER
    roleConfig = {
      title: 'Store Portal',
      subtitle: 'Normal User',
      initial: 'U',
      theme: 'from-emerald-600 to-teal-600',
      activeBg: 'bg-emerald-600',
      textTheme: 'text-emerald-400'
    }
    navigation = [
      { id: 'stores', label: 'Explore Stores', icon: Icons.Stores },
      { id: 'profile', label: 'My Profile', icon: Icons.Profile },
    ]
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      <Sidebar 
        navigation={navigation} 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        roleConfig={roleConfig} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          navigation={navigation} 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          roleConfig={roleConfig} 
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
