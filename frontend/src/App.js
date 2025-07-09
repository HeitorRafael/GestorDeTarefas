// frontend/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// Importe os componentes necessários
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import UserDashboard from './pages/UserDashboard';
import AdminManagementScreen from './pages/AdminManagementScreen'; // Importe o AdminManagementScreen real
import { useAuth } from './contexts/AuthContext';
import { lazy } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminSettingsScreen = lazy(() => import('./pages/AdminSettingsScreen'));

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando aplicação...</Typography>
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas Protegidas que usam o MainLayout */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} /> {/* <<< Use o UserDashboard real aqui */}
          {/* A rota /user-dashboard se for específica, pode ser redirecionada para /dashboard ou removida se não for necessária */}
          <Route path="/user-dashboard" element={<UserDashboard />} /> {/* Pode manter, se quiser que ambas as URLs funcionem */}
          <Route path="/time-tracking" element={<Typography variant="h4" sx={{ p: 4 }}>Registro de Tempo</Typography>} />
        </Route>
      </Route>

      {/* Rotas de Admin Protegidas que usam o MainLayout */}
      <Route element={<PrivateRoute adminOnly={true} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-management" element={<AdminManagementScreen />} />
          <Route path="/admin-settings" element={<AdminSettingsScreen />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Typography variant="h4" sx={{ p: 4 }}>Página não encontrada!</Typography>} />
    </Routes>
  );
}

export default App;