import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateAppointment } from '@/hooks/useProviders';
import { useApiError } from '@/hooks/useApiError';

// Form schema
const appointmentSchema = z.object({
  providerId: z.string().min(1, 'Please select a provider'),
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  start: z.string().min(1, 'Please select a time slot'),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export default function AppointmentForm({ 
  selectedProvider, 
  selectedSlot, 
  onSuccess, 
  onCancel 
}) {
  const { handleError, handleSuccess } = useApiError();
  const createAppointment = useCreateAppointment();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      providerId: selectedProvider?.id || '',
      patientName: '',
      start: selectedSlot?.iso || '',
      phone: '',
      email: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createAppointment.mutateAsync(data);
      handleSuccess('Appointment booked successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      handleError(error, 'booking appointment');
    }
  };

  if (!selectedProvider || !selectedSlot) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center">Please select a provider and time slot first.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Book Appointment</h3>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium">{selectedProvider.doctor}</p>
            <p className="text-sm text-gray-600">{selectedProvider.specialty} • {selectedProvider.location}</p>
            <p className="text-sm text-gray-600">
              {new Date(selectedSlot.iso).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Name *
          </label>
          <input
            {...register('patientName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter patient name"
          />
          {errors.patientName && (
            <p className="text-red-500 text-sm mt-1">{errors.patientName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="patient@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special requests or notes..."
          />
          {errors.notes && (
            <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createAppointment.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting || createAppointment.isPending ? 'Booking...' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
