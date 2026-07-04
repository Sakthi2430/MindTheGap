import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  // Prevent benign HMR WebSocket connection errors from triggering unhandled rejection overlays
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason);
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('HMR') || 
      msg.includes('connection failed')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('error', (event) => {
    const msg = event.message;
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('HMR')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
