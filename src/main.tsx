import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle benign Vite HMR dev websocket disconnection errors gracefully in sandboxed preview
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = event.reason?.message || String(event.reason || '');
    if (reasonMsg.includes('WebSocket') || reasonMsg.includes('failed to connect to websocket')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
