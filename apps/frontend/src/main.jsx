import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { queryClient } from './lib/queryClient'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root');
createRoot(rootEl).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
      <SpeedInsights />
    </QueryClientProvider>
  </BrowserRouter>
);