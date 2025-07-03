// main.jsx (CORRECTED)

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 1. Import AuthProvider dari lokasinya yang benar
import { AuthProvider } from './pages/contexts/AuthContext.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    {/* 2. Bungkus <App /> dengan <AuthProvider /> */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);