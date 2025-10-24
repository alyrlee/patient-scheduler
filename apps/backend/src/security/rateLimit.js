// server/security/rateLimit.js - Hardened rate limiting for auth endpoints
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Key generator that combines IP + email/username for better rate limiting
const keyByIpAndEmail = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const id = (req.body?.email || req.body?.username || '').toLowerCase();
  return `${ip}:${id}`;
};

// General auth rate limiter - generous for shared IPs
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,      // 10 minutes
  limit: 50,                     // generous shared budget
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByIpAndEmail, // IP + identifier
  message: { 
    error: 'Too many attempts. Please wait a moment and try again.',
    retryAfter: Math.ceil(10 * 60) // 10 minutes in seconds
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Login slowdown - penalize bursts without hard blocking
export const loginSlowdown = slowDown({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  delayAfter: 10,                // start delaying after 10 requests
  delayMs: 500,                  // add 500ms per extra request
  keyGenerator: keyByIpAndEmail,
  skip: (req) => {
    // Skip slowdown for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Strict rate limiter for sensitive operations
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  limit: 5,                      // very strict for sensitive ops
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByIpAndEmail,
  message: { 
    error: 'Too many sensitive operations. Please wait before trying again.',
    retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
  }
});

// AI endpoint rate limiter
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  limit: 20,                     // reasonable for AI usage
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    error: 'AI rate limit exceeded. Please wait before making more requests.',
    retryAfter: Math.ceil(15 * 60)
  }
});
