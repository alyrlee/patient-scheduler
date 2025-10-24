import React from 'react';
import ResponsiveHeader from './ResponsiveHeader';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Header */}
      <ResponsiveHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
