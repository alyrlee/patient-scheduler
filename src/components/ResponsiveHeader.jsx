import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function ResponsiveHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', current: true },
    { name: 'Providers', href: '/providers', current: false },
    { name: 'Appointments', href: '/appointments', current: false },
    { name: 'Chat', href: '/chat', current: false },
    { name: 'Settings', href: '/settings', current: false },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <button 
            onClick={() => navigate('/')} 
            className="-m-1.5 p-1.5 flex items-center gap-2"
          >
            <span className="sr-only">Patient Scheduler</span>
            <img src="/logo.png" alt="Patient Scheduler logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-gray-800">Patient Scheduler</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100"
          >
            <span className="sr-only">Open main menu</span>
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="size-6"
            >
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`text-sm font-semibold leading-6 transition-colors ${
                item.current 
                  ? 'text-curious-blue-600' 
                  : 'text-gray-900 hover:text-curious-blue-600'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Desktop user menu */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900 hover:text-curious-blue-600"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-curious-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-curious-blue-600">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user.name}</span>
                </div>
                <svg 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="size-5 flex-none text-gray-400"
                >
                  <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => navigate('/settings')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-curious-blue-600"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="rounded-md bg-curious-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-curious-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-curious-blue-600"
              >
                Get started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-gray-900/25" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigate('/')} 
                  className="-m-1.5 p-1.5 flex items-center gap-2"
                >
                  <span className="sr-only">Patient Scheduler</span>
                  <img src="/logo.png" alt="Patient Scheduler logo" className="h-8 w-8" />
                  <span className="text-xl font-semibold text-gray-800">Patient Scheduler</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:bg-gray-100"
                >
                  <span className="sr-only">Close menu</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    className="size-6"
                  >
                    <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          navigate(item.href);
                          setMobileMenuOpen(false);
                        }}
                        className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50 ${
                          item.current 
                            ? 'text-curious-blue-600 bg-curious-blue-50' 
                            : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  
                  <div className="py-6">
                    {user ? (
                      <div className="space-y-2">
                        <div className="px-3 py-2 text-sm text-gray-500">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div>{user.email}</div>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setMobileMenuOpen(false);
                          }}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          Sign out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            navigate('/login');
                            setMobileMenuOpen(false);
                          }}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          Sign in
                        </button>
                        <button
                          onClick={() => {
                            navigate('/signup');
                            setMobileMenuOpen(false);
                          }}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-curious-blue-600 hover:bg-curious-blue-500"
                        >
                          Get started
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
