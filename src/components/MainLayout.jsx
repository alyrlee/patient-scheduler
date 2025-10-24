import React from 'react';
import { useAuth } from '@/context/auth';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-sm px-6 py-3 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Patient Scheduler logo" className="h-8 w-8" />
          <h1 className="text-xl font-semibold text-gray-800">Patient Scheduler</h1>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {user && (
            <>
              <span className="text-gray-600">Welcome, <strong>{user.name}</strong>!</span>
              <button 
                onClick={logout}
                className="border border-gray-300 hover:bg-gray-100 px-3 py-1 rounded-md text-gray-700"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
