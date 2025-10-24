// server/dev-server.js - Development server with listen()
import { createApp } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`📅 Appointment endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/appointments`);
  console.log(`   POST http://localhost:${PORT}/api/appointments`);
  console.log(`👨‍⚕️ Provider endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/providers`);
});
