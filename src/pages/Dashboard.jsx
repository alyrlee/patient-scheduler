import React, { Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProviders, useAppointments } from '@/hooks/useProviders';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/Spinner';
import AssistantSection from '@/components/AssistantSection';
import { useAuth } from '@/context/auth';

// Lazy load heavy components
const ProvidersView = React.lazy(() => import('@/views/ProvidersView'));
const AppointmentsView = React.lazy(() => import('@/views/AppointmentsView'));

function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: providers = [], isLoading: providersLoading } = useProviders();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();

  const handleBooked = (appointment) => {
    console.log('Appointment booked:', appointment);
    // Invalidate and refetch appointments data
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['providers'] });
  };

  const handleCancelled = (appointmentId) => {
    console.log('Appointment cancelled:', appointmentId);
    // Invalidate and refetch appointments data
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['providers'] });
  };

  const handleRescheduled = (appointment) => {
    console.log('Appointment rescheduled:', appointment);
    // Invalidate and refetch appointments data
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['providers'] });
  };

  if (providersLoading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Precompute derived values
  const today = new Date();
  const todayAppointments = appointments
    .filter(a => new Date(a.time).toDateString() === today.toDateString() && a.status !== "cancelled")
    .sort((a, b) => new Date(a.time) - new Date(b.time));
  const nextAppointmentToday = todayAppointments[0];

  return (
    <div className="space-y-6">
      {/* Today Summary Card */}
      <div className="today-summary section-primary">
        <div className="today-summary-content">
          <h2>
            {user?.name ? `Welcome back, ${user.name}!` : 'Today\'s Summary'}
          </h2>
          {!nextAppointmentToday ? (
            <div className="today-summary-no-appointments">
              <div className="today-summary-no-appointments-icon">
                <span>🎉</span>
              </div>
              <div className="today-summary-no-appointments-content">
                <h3>No appointments today</h3>
                <p>You're all set! Enjoy your day.</p>
              </div>
            </div>
          ) : (
            <div className="today-summary-appointment">
              <div className="today-summary-appointment-icon">
                <span>📅</span>
              </div>
              <div className="today-summary-appointment-details">
                <h3>Next: {nextAppointmentToday.doctor}</h3>
                <p className="appointment-time">
                  🕐 {new Date(nextAppointmentToday.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="appointment-location">
                  ❤️ Location: {nextAppointmentToday.location}
                </p>
                <span className={`appointment-status ${nextAppointmentToday.status}`}>
                  {nextAppointmentToday.status}
                </span>
                {todayAppointments.length > 1 && (
                  <div className="mt-2 text-sm text-gray-600">
                    +{todayAppointments.length - 1} more appointments today
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="today-summary-date">
          <small>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </small>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="mb-8">
        <AssistantSection
          onBooked={handleBooked}
          onCancelled={handleCancelled}
          onRescheduled={handleRescheduled}
        />
      </div>

      {/* Providers and Appointments Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Providers Section */}
        <div className="space-y-6">
          <section className="card-primary section-secondary">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-custom-gray-900">Available Providers</h2>
              <div className="text-sm text-custom-gray-500 font-medium">
                {providers.length} {providers.length === 1 ? 'provider' : 'providers'} available
              </div>
            </div>
            <Suspense fallback={<Spinner className="h-6 w-6 mx-auto" />}>
              <ProvidersView providerCards={providers.map(p => (
                <Card key={p.id} className="p-6 hover:shadow-lg transition-all duration-300 border-custom-gray-200/50 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">👨‍⚕️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-custom-gray-900">{p.doctor}</h3>
                      <p className="text-sm font-semibold text-curious-blue-600">{p.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-custom-gray-600 mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {p.location}
                  </div>
                  <div className="text-sm text-custom-gray-600">
                    <span className="font-medium">Available Slots:</span> {p.slots?.length || 0}
                  </div>
                </Card>
              ))} />
            </Suspense>
          </section>
        </div>

        {/* Appointments Section */}
        <div className="space-y-6">
          <section className="card-secondary section-primary">
            <h2 className="text-xl font-semibold mb-4 text-custom-gray-900">My Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments yet.</p>
            ) : (
              <Suspense fallback={<Spinner className="h-6 w-6 mx-auto" />}>
                <AppointmentsView 
                  appointments={appointments} 
                  appointmentCards={appointments.map(a => (
                    <Card key={a.id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="font-medium">{a.doctor}</h3>
                        <p className="text-sm text-custom-gray-600">{a.location}</p>
                        <p className="text-sm text-custom-gray-700">
                          {a.time} — {a.status}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="destructive" size="sm">
                          Cancel
                        </Button>
                        <Button variant="secondary" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </Card>
                  ))}
                />
              </Suspense>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
