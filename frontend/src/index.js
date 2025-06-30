// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom'; // <<< Importe o Router AQUI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Router> {/* <<< O ROUTER DEVE ESTAR AQUI, ENVOLVENDO TUDO */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);