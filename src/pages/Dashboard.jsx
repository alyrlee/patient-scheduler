import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const user = { name: "Demo User" }; // replace with your auth context later

  return (
    <div className="flex flex-1">
        {/* Collapsible Sidebar placeholder */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
          <nav className="space-y-2">
            <Link to="/dashboard" className="block text-gray-800 font-medium">
              Overview
            </Link>
            <Link to="/appointments" className="block text-gray-600 hover:text-gray-900">
              Appointments
            </Link>
            <Link to="/providers" className="block text-gray-600 hover:text-gray-900">
              Providers
            </Link>
            <Link to="/chat" className="block text-gray-600 hover:text-gray-900">
              AI Assistant
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <section className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-gray-600 mb-8">
            This is your dashboard overview. Add widgets or analytics here later.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Appointments</h3>
              <p className="text-gray-600">No appointments scheduled.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Tasks</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600">Need help? Start a chat anytime.</p>
            </div>
          </div>
        </section>
    </div>
  );
}