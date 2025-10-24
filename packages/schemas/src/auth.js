import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['patient', 'provider', 'admin']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
});

// JWT payload schema
export const JWTPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['patient', 'provider', 'admin']),
  iat: z.number(),
  exp: z.number(),
});

// Response schemas
export const AuthResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['patient', 'provider', 'admin']),
});

export const LoginResponseSchema = z.object({
  user: AuthResponseSchema,
  token: z.string(),
  expiresIn: z.string(),
});

// Error schemas
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
});

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
  timestamp: z.string().datetime(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
