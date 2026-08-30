import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './app/router';
import { AuthProvider } from './shared/auth/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
