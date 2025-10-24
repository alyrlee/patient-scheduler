import React from 'react';
import { useAuth } from '../../context/auth';
import Header from './Header';
import NavbarComponent from './Navbar';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Branding */}
      <Header />

      {/* Navbar - Navigation */}
      <NavbarComponent user={user} onSignOut={logout} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
