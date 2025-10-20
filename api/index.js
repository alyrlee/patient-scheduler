// api/index.js - Vercel serverless function entry point
import { createApp } from "../server/app.js";

// Express app is a request listener; export a handler for Vercel
const app = createApp();
export default function handler(req, res) {
  return app(req, res);
}
