import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize default user for demo purposes
import { AuthService } from './services/auth';
new AuthService().initializeDefaultUser();

// Add marked script to head
const markedScript = document.createElement('script');
markedScript.src = 'https://unpkg.com/marked@4.3.0/marked.min.js';
document.head.appendChild(markedScript);

// Set page title
document.title = 'LawHelp - Cameroon Legal Assistant';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);