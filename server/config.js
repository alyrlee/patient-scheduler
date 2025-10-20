// OpenAI Configuration
export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY, // no default
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7
};

// Application Configuration
export const APP_CONFIG = {
  name: 'ai-scheduler',
  environment: 'development',
  port: 4000,
  corsOrigin: 'http://localhost:5173'
};

// Database Configuration
export const DB_CONFIG = {
  url: '/tmp/database.sqlite'
};
