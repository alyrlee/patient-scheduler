import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(4000),
  DATABASE_URL: z.string().default('sqlite:./database.sqlite'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('ps_token'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default(1000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
});

// Parse and validate environment variables
let config;
try {
  config = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error.errors) {
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

// Export validated config
export default config;

// Health check configuration
export const healthCheckConfig = {
  database: {
    timeout: 5000,
    retries: 3,
  },
  external: {
    timeout: 10000,
    retries: 2,
  },
};

// API configuration
export const apiConfig = {
  version: '1.0.0',
  basePath: '/api',
  timeout: 30000,
  maxRequestSize: '10mb',
};

// Security configuration
export const securityConfig = {
  bcryptRounds: config.BCRYPT_ROUNDS,
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
  cookieName: config.COOKIE_NAME,
  sessionSecret: config.SESSION_SECRET,
  cors: {
    origin: config.CORS_ORIGIN,
    credentials: true,
  },
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
};

// Logging configuration
export const loggingConfig = {
  level: config.LOG_LEVEL,
  format: config.LOG_FORMAT,
  timestamp: true,
  colorize: config.NODE_ENV === 'development',
};