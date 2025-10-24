import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import MainLayout from './components/MainLayout';
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
  
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
