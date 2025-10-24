import { z } from 'zod';

// Appointment schemas
export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  date: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine']),
  notes: z.string().max(1000).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateAppointmentSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  date: z.string().datetime('Invalid date format'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine'], {
    errorMap: () => ({ message: 'Invalid appointment type' })
  }),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
});

export const UpdateAppointmentSchema = z.object({
  date: z.string().datetime('Invalid date format').optional(),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine']).optional(),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
});

export const AppointmentQuerySchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  provider_id: z.string().uuid().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

// Provider schemas
export const ProviderSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  specialty: z.string(),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  availability: z.object({
    monday: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    tuesday: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    wednesday: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    thursday: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    friday: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    saturday: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
    sunday: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateProviderSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  specialty: z.string()
    .min(1, 'Specialty is required')
    .max(100, 'Specialty must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number'),
});

// Time slot schemas
export const TimeSlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  available: z.boolean(),
  provider_id: z.string().uuid(),
});

export const AvailableSlotsQuerySchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  duration: z.number().min(15).max(480).optional(),
});

// Response schemas
export const AppointmentResponseSchema = z.object({
  id: z.string().uuid(),
  provider: z.object({
    id: z.string().uuid(),
    name: z.string(),
    specialty: z.string(),
  }),
  date: z.string().datetime(),
  duration: z.number(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine']),
  notes: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

// Type exports
export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;
export type AppointmentQuery = z.infer<typeof AppointmentQuerySchema>;
export type Provider = z.infer<typeof ProviderSchema>;
export type CreateProvider = z.infer<typeof CreateProviderSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type AvailableSlotsQuery = z.infer<typeof AvailableSlotsQuerySchema>;
export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type PaginatedResponse<T> = z.infer<typeof PaginatedResponseSchema> & { data: T[] };
