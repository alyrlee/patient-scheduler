import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProviders, searchProviders, createAppointment, cancelAppointment, rescheduleAppointment } from '../services/api';

// Query keys
export const queryKeys = {
  providers: ['providers'],
  appointments: ['appointments'],
  searchProviders: (query) => ['providers', 'search', query],
};

// Providers query
export function useProviders() {
  return useQuery({
    queryKey: queryKeys.providers,
    queryFn: fetchProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Search providers query
export function useSearchProviders(query, enabled = false) {
  return useQuery({
    queryKey: queryKeys.searchProviders(query),
    queryFn: () => searchProviders(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Appointments query
export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments,
    queryFn: async () => {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('appointments failed');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create appointment mutation with optimistic updates
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAppointment,
    onMutate: async (newAppointment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments });
      
      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(queryKeys.appointments);
      
      // Optimistically update
      const optimisticAppointment = {
        id: `temp-${Date.now()}`,
        patient_name: newAppointment.patientName,
        doctor: 'Loading...',
        location: 'Loading...',
        start: newAppointment.start,
        status: 'confirmed',
        provider_id: newAppointment.providerId,
        isOptimistic: true,
      };
      
      queryClient.setQueryData(queryKeys.appointments, (old) => [
        optimisticAppointment,
        ...(old || [])
      ]);
      
      return { previousAppointments };
    },
    onError: (err, newAppointment, context) => {
      // Rollback on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(queryKeys.appointments, context.previousAppointments);
      }
    },
    onSuccess: (_data, _variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      queryClient.invalidateQueries({ queryKey: queryKeys.providers });
    },
  });
}

// Cancel appointment mutation with optimistic updates
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelAppointment,
    onMutate: async (appointmentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments });
      
      const previousAppointments = queryClient.getQueryData(queryKeys.appointments);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.appointments, (old) =>
        old?.map((appt) =>
          appt.id === appointmentId
            ? { ...appt, status: 'cancelled', isOptimistic: true }
            : appt
        )
      );
      
      return { previousAppointments };
    },
    onError: (err, appointmentId, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(queryKeys.appointments, context.previousAppointments);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    },
  });
}

// Reschedule appointment mutation with optimistic updates
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, start }) => rescheduleAppointment(id, { iso: start, label: new Date(start).toLocaleString() }),
    onMutate: async ({ id, start }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments });
      
      const previousAppointments = queryClient.getQueryData(queryKeys.appointments);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.appointments, (old) =>
        old?.map((appt) =>
          appt.id === id
            ? { 
                ...appt, 
                start: new Date(start).toISOString(),
                time: new Date(start).toLocaleString(),
                isOptimistic: true 
              }
            : appt
        )
      );
      
      return { previousAppointments };
    },
    onError: (err, variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(queryKeys.appointments, context.previousAppointments);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    },
  });
}
