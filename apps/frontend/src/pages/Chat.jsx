import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AssistantSection from '../components/features/AssistantSection';

function Chat() {
  const queryClient = useQueryClient();

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

  return (
    <div className="mb-8">
      <AssistantSection
        onBooked={handleBooked}
        onCancelled={handleCancelled}
        onRescheduled={handleRescheduled}
      />
    </div>
  );
}

export default Chat;
