// Vercel serverless function entry point
import { createApp } from "../src/app.js";

const app = createApp();

// Export the app for Vercel serverless functions
export default app;
