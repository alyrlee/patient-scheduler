// src/components/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-curious-blue-50 via-white to-custom-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-curious-blue-600">
                  🏥 Patient Scheduler
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-curious-blue-600 hover:text-curious-blue-700 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-curious-blue-600 hover:bg-curious-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered
            <span className="text-curious-blue-600"> Patient Scheduling</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your healthcare appointments with our intelligent scheduling system. 
            Book, manage, and track your medical appointments with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/signup')}
              className="bg-curious-blue-600 hover:bg-curious-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-curious-blue-600 text-curious-blue-600 hover:bg-curious-blue-50 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600">
                Chat with our intelligent assistant to book appointments, get information, and manage your healthcare needs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">
                Find available time slots, book appointments, and receive reminders automatically.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Provider Network</h3>
              <p className="text-gray-600">
                Access a network of qualified healthcare providers in your area with detailed profiles and ratings.
              </p>
            </div>
          </div>

          {/* Demo Section */}
          <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Try Our Demo
            </h2>
            <p className="text-gray-600 mb-6">
              Experience the power of AI-driven appointment scheduling. No account required for the demo.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-curious-blue-600 to-curious-blue-700 hover:from-curious-blue-700 hover:to-curious-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              Start Free Demo
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Patient Scheduler. Built with ❤️ for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
