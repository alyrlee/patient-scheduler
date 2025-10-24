#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import path mappings for the new structure
const importMappings = {
  // Frontend imports
  '@/components/Header': './components/layout/Header',
  '@/components/MainLayout': './components/layout/MainLayout', 
  '@/components/Navbar': './components/layout/Navbar',
  '@/components/LandingPage': './components/layout/LandingPage',
  '@/components/Providers': './components/features/Providers',
  '@/components/AssistantSection': './components/features/AssistantSection',
  '@/components/AvailabilityHeatmap': './components/features/AvailabilityHeatmap',
  '@/components/ErrorBoundary': './components/layout/ErrorBoundary',
  '@/components/Spinner': './components/ui/Spinner',
  '@/components/Logo': './components/ui/Logo',
  '@/components/forms/AppointmentForm': './components/forms/AppointmentForm',
  '@/components/ui/button': './components/ui/button',
  '@/components/ui/card': './components/ui/card',
  '@/components/ui': './components/ui',
  '@/hooks/useProviders': './hooks/useProviders',
  '@/hooks/useApiError': './hooks/useApiError',
  '@/context/auth': './context/auth',
  '@/lib/queryClient': './lib/queryClient',
  '@/services/api': './services/api',
  '@/pages/Dashboard': './pages/Dashboard',
  '@/pages/Providers': './pages/Providers',
  '@/pages/Appointments': './pages/Appointments',
  '@/pages/Chat': './pages/Chat',
  '@/pages/Settings': './pages/Settings',
  '@/pages/Login': './pages/Login',
  '@/pages/Signup': './pages/Signup',
  '@/pages/Protected': './pages/Protected',
  '@/assets/react.svg': './assets/react.svg',
  '@/App': './App',
  '@/AppRouter': './AppRouter',
  '@/main': './main',
  '@/index.css': './index.css',
  '@/App.css': './App.css',
};

// Backend import mappings
const backendMappings = {
  './db.js': './src/db.js',
  './app.js': './src/app.js',
  './config.js': './src/config/config.js',
  './routes/auth.js': './src/routes/auth.js',
  './ai/graph.js': './src/ai/graph.js',
  './ai/tools.js': './src/ai/tools.js',
  './ai/state.ts': './src/ai/state.ts',
  './rag/client.js': './src/rag/client.js',
  './rag/indexer.js': './src/rag/indexer.js',
  './rag/cache.js': './src/rag/cache.js',
  './database/schema.sql': './database/schema.sql',
  './database/seed.js': './database/seed.js',
};

function updateImportsInFile(filePath, mappings) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    for (const [oldPath, newPath] of Object.entries(mappings)) {
      const regex = new RegExp(`(['"])${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
      if (content.includes(oldPath)) {
        content = content.replace(regex, `$1${newPath}$1`);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function updateImportsInDirectory(dirPath, mappings) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
        updateImportsInDirectory(fullPath, mappings);
      } else if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
        updateImportsInFile(fullPath, mappings);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
}

// Update frontend imports
console.log('🔄 Updating frontend imports...');
updateImportsInDirectory('./apps/frontend/src', importMappings);

// Update backend imports  
console.log('🔄 Updating backend imports...');
updateImportsInDirectory('./apps/backend', backendMappings);

console.log('✅ Import path updates completed!');
