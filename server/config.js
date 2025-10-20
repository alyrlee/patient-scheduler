// OpenAI Configuration
export const OPENAI_CONFIG = {
  apiKey: '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',
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
  url: './database.sqlite'
};
