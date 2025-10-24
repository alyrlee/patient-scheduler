import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import { AuthProvider, useAuth } from './context/auth';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Providers = React.lazy(() => import('./pages/Providers'));
const Appointments = React.lazy(() => import('./pages/Appointments'));
const Chat = React.lazy(() => import('./pages/Chat'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./routes/Login'));
const Signup = React.lazy(() => import('./routes/Signup'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

// Error boundary for individual routes
function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

// Protected route component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (user === null) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    );
  }
  
  return children;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="h-screen flex overflow-hidden bg-gradient-to-br from-custom-gray-50 via-white to-curious-blue-50">
          {/* Sidebar would go here */}
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            {/* Header would go here */}
            <main id="main" className="flex-1 relative overflow-y-auto focus:outline-none content-container">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <Routes>
                    {/* Public routes */}
                    <Route 
                      path="/login" 
                      element={
                        <RouteErrorBoundary>
                          <Suspense fallback={<PageLoader />}>
                            <Login />
                          </Suspense>
                        </RouteErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/signup" 
                      element={
                        <RouteErrorBoundary>
                          <Suspense fallback={<PageLoader />}>
                            <Signup />
                          </Suspense>
                        </RouteErrorBoundary>
                      } 
                    />
                    
                    {/* Protected routes */}
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <RouteErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Dashboard />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/providers" 
                      element={
                        <ProtectedRoute>
                          <RouteErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Providers />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/appointments" 
                      element={
                        <ProtectedRoute>
                          <RouteErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Appointments />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/chat" 
                      element={
                        <ProtectedRoute>
                          <RouteErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Chat />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <RouteErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Settings />
                            </Suspense>
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </div>
            </main>
          </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  </AuthProvider>
  );
}
