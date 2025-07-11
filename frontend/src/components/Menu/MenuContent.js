import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MenuContent = () => {
  const { isAdmin } = useAuth();

  return (
    <List>
      {/* Itens de navegação comuns */}
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton component={Link} to="/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton component={Link} to="/time-tracking">
          <ListItemIcon>
            <TimerIcon />
          </ListItemIcon>
          <ListItemText primary="Registro de Tempo" />
        </ListItemButton>
      </ListItem>

      {/* Itens de navegação apenas para Admin */}
      {isAdmin && (
        <>
          <Divider />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to="/admin-management">
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Gerenciar Usuários" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to="/admin-settings">
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Configurações Admin" />
            </ListItemButton>
          </ListItem>
        </>
      )}
    </List>
  );
};

export default MenuContent;