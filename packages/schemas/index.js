// Re-export all schemas from individual modules
export * from './src/auth.js';
export * from './src/appointments.js';

// Legacy schemas for backward compatibility
import { z } from 'zod';

// Provider schemas (legacy)
export const ProviderSchema = z.object({
  id: z.string(),
  doctor: z.string(),
  specialty: z.string(),
  location: z.string(),
  rating: z.number().min(0).max(5),
  bio: z.string().optional(),
  slots: z.array(z.object({
    id: z.string(),
    start: z.string(),
    end: z.string(),
    status: z.enum(['open', 'booked', 'cancelled'])
  })).optional()
});

// Appointment schemas (legacy)
export const AppointmentSchema = z.object({
  id: z.string(),
  patient_name: z.string(),
  doctor: z.string(),
  location: z.string(),
  start: z.string(),
  end: z.string(),
  status: z.enum(['confirmed', 'cancelled', 'completed']),
  provider_id: z.string()
});

// API Request/Response schemas (legacy)
export const CreateAppointmentSchema = z.object({
  providerId: z.string(),
  patientName: z.string().min(1),
  start: z.string().datetime()
});

export const CancelAppointmentSchema = z.object({
  id: z.string()
});

export const RescheduleAppointmentSchema = z.object({
  id: z.string(),
  start: z.string().datetime()
});

export const SearchProvidersSchema = z.object({
  q: z.string().min(1)
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    appointments: z.array(AppointmentSchema).optional(),
    providers: z.array(ProviderSchema).optional()
  }).optional()
});

// API Response schemas (legacy)
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

// Validation helpers
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
}
