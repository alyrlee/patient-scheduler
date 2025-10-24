import React from "react";

export default function AppointmentsView({ appointments, appointmentCards }) {
  return (
    <div className="mb-8">
      <div className="card-primary section-primary">
        <h2 className="text-2xl font-bold text-custom-gray-900 mb-6">All Appointments</h2>
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-custom-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-custom-gray-600 font-medium">No appointments yet.</p>
            <p className="text-sm text-custom-gray-500 mt-1">Book one using the AI assistant or by selecting a slot above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointmentCards}
          </div>
        )}
      </div>
    </div>
  );
}
