import React, { Suspense } from 'react';
import { useAppointments, useCancelAppointment, useRescheduleAppointment } from '@/hooks/useProviders';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/Spinner';
import { useApiError } from '@/hooks/useApiError';

const AppointmentsView = React.lazy(() => import('@/views/AppointmentsView'));

function Appointments() {
  const { data: appointments = [], isLoading, error } = useAppointments();
  const cancelAppointment = useCancelAppointment();
  const rescheduleAppointment = useRescheduleAppointment();
  const { handleError, handleSuccess } = useApiError();

  const handleCancel = async (appt) => {
    try {
      await cancelAppointment.mutateAsync(appt.id);
      handleSuccess('Appointment cancelled successfully');
    } catch (error) {
      handleError(error, 'cancelling appointment');
    }
  };

  const handleReschedule = async (appt, newSlot) => {
    try {
      await rescheduleAppointment.mutateAsync({
        id: appt.id,
        start: newSlot.iso
      });
      handleSuccess('Appointment rescheduled successfully');
    } catch (error) {
      handleError(error, 'rescheduling appointment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 font-medium">Failed to load appointments</p>
        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
      </div>
    );
  }

  const appointmentCards = appointments.map((a) => (
    <Card
      key={a.id}
      className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/80 backdrop-blur-sm border border-custom-gray-200/50 rounded-xl shadow-md"
    >
      <div>
        <h3 className="font-bold text-custom-gray-900">{a.doctor}</h3>
        <p className="text-sm text-custom-gray-600">{a.location}</p>
        <p className="text-sm font-semibold text-curious-blue-600 mt-1">
          {a.time} — <span className={`font-bold ${a.status === 'cancelled' ? 'text-red-600' : 'text-fern-600'}`}>{a.status}</span>
        </p>
        {a.isOptimistic && (
          <span className="text-xs text-blue-600 font-medium">Processing...</span>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          variant="destructive"
          onClick={() => handleCancel(a)}
          disabled={a.status === "cancelled" || a.isOptimistic}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            handleReschedule(a, {
              iso: new Date(Date.now() + 3600000).toISOString(),
              label: "Next Hour",
            })
          }
          disabled={a.isOptimistic}
          className="px-6 py-3 bg-gradient-to-r from-custom-gray-600 to-custom-gray-700 hover:from-custom-gray-700 hover:to-custom-gray-800 text-white disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          Reschedule
        </Button>
      </div>
    </Card>
  ));

  return (
    <div className="mb-8">
      <Suspense fallback={<Spinner className="h-6 w-6 mx-auto" />}>
        <AppointmentsView 
          appointments={appointments} 
          appointmentCards={appointmentCards} 
        />
      </Suspense>
    </div>
  );
}

export default Appointments;
