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
import UserDashboard from './pages/UserDashboard'; // <<< Importe o UserDashboard real

import { useAuth } from './contexts/AuthContext';

// Componentes de dashboard temporários (se ainda existirem, remova-os ou ajuste conforme necessário)
// const MainDashboard = () => <Typography variant="h4" sx={{ p: 4 }}>Main Dashboard (Comum)</Typography>;
// const UserDashboard = () => <Typography variant="h4" sx={{ p: 4 }}>User Dashboard (Comum)</Typography>;
const AdminDashboard = () => <Typography variant="h4" sx={{ p: 4 }}>Admin Dashboard (Admin)</Typography>;
const AdminManagementScreen = () => <Typography variant="h4" sx={{ p: 4 }}>Gerenciar Usuários (Admin)</Typography>;
const AdminSettingsScreen = () => <Typography variant="h4" sx={{ p: 4 }}>Configurações Admin</Typography>;

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