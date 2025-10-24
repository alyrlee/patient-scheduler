// src/components/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Header from './Header';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-curious-blue-200/20 to-curious-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-curious-blue-100/10 to-indigo-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <Header user={user} onSignOut={logout} />

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          {user ? (
            // Authenticated user content
            <>
              <div className="animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                  Welcome back,
                  <span className="bg-gradient-to-r from-curious-blue-600 to-indigo-600 bg-clip-text text-transparent"> {user.name}!</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                  Ready to manage your healthcare appointments? Access your dashboard to view upcoming appointments, 
                  book new ones, or chat with our AI assistant.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up animation-delay-200">
                <button
                  onClick={() => navigate('/chat')}
                  className="group relative bg-gradient-to-r from-curious-blue-600 to-indigo-600 hover:from-curious-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-curious-blue-500/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with AI Assistant
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-curious-blue-600 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group relative border-2 border-curious-blue-600 text-curious-blue-600 hover:bg-curious-blue-50/50 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-curious-blue-500/10"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Dashboard
                  </span>
                </button>
              </div>
            </>
          ) : (
            // Unauthenticated user content
            <>
              <div className="animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                  AI-Powered
                  <span className="bg-gradient-to-r from-curious-blue-600 to-indigo-600 bg-clip-text text-transparent"> Patient Scheduling</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                  Streamline your healthcare appointments with our intelligent scheduling system. 
                  Book, manage, and track your medical appointments with ease.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up animation-delay-200">
                <button
                  onClick={() => navigate('/signup')}
                  className="group relative bg-gradient-to-r from-curious-blue-600 to-indigo-600 hover:from-curious-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-curious-blue-500/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-curious-blue-600 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="group relative border-2 border-curious-blue-600 text-curious-blue-600 hover:bg-curious-blue-50/50 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-curious-blue-500/10"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 animate-fade-in-up animation-delay-400">
            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-curious-blue-50/50 to-indigo-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-curious-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Assistant</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chat with our intelligent assistant to book appointments, get information, and manage your healthcare needs.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Scheduling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Find available time slots, book appointments, and receive reminders automatically.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Provider Network</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access a network of qualified healthcare providers in your area with detailed profiles and ratings.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Section */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-curious-blue-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 animate-fade-in-up animation-delay-600">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-curious-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Try Our Demo
                </h2>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Experience the power of AI-driven appointment scheduling. No account required for the demo.
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="group relative bg-gradient-to-r from-curious-blue-600 to-indigo-600 hover:from-curious-blue-700 hover:to-indigo-700 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-curious-blue-500/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Free Demo
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-curious-blue-600 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-24 bg-gradient-to-r from-gray-50 to-gray-100/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-curious-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">
              &copy; 2025 Patient Scheduler. Built with ❤️ for better healthcare by Ashley Lee-Vigneau.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
