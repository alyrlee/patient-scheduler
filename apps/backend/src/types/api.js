// API Error Envelope
export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Standardized error response format
export const createErrorResponse = (error) => {
  const isApiError = error instanceof ApiError;
  
  return {
    error: {
      code: isApiError ? error.code : 'INTERNAL_ERROR',
      message: isApiError ? error.message : 'An unexpected error occurred',
      details: isApiError ? error.details : null,
      timestamp: isApiError ? error.timestamp : new Date().toISOString(),
    },
  };
};

// Success response format
export const createSuccessResponse = (data, meta = null) => {
  const response = {
    data,
    timestamp: new Date().toISOString(),
  };
  
  if (meta) {
    response.meta = meta;
  }
  
  return response;
};

// Common error codes
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource Management
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  OPENAI_API_ERROR: 'OPENAI_API_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
};

// HTTP status code mapping
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error handler middleware
export const errorHandler = (error, req, res, next) => {
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const response = createErrorResponse(error);
  
  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req, res) => {
  const error = new ApiError(
    `Route ${req.method} ${req.url} not found`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND
  );
  
  const response = createErrorResponse(error);
  res.status(HTTP_STATUS.NOT_FOUND).json(response);
};
