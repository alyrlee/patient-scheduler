import express from 'express';
import { createSuccessResponse } from '../types/api.js';
import config, { healthCheckConfig } from '../config/config.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      services: {
        database: await checkDatabase(),
        openai: await checkOpenAI(),
      },
    };

    const response = createSuccessResponse(health);
    res.status(200).json(response);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Database health check
async function checkDatabase() {
  try {
    // This would be replaced with actual database connection check
    // For now, we'll simulate a quick check
    return {
      status: 'healthy',
      responseTime: '< 10ms',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

// OpenAI API health check
async function checkOpenAI() {
  try {
    // This would make a lightweight request to OpenAI API
    // For now, we'll simulate a check
    return {
      status: 'healthy',
      responseTime: '< 100ms',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Readiness probe
router.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
