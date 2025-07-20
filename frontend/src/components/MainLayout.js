// frontend/src/components/MainLayout.js
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // <<< ADICIONE ESTA IMPORTAÇÃO
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TimerIcon from '@mui/icons-material/Timer';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import { useAuth } from '../contexts/AuthContext';
import { Link, Outlet } from 'react-router-dom';
import { useThemeToggle } from '../contexts/ThemeContext';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
// import LightModeIcon from '@mui/icons-material/LightMode'; // Pode remover, não está sendo usado diretamente no JSX
// import DarkModeIcon from '@mui/icons-material/DarkMode'; // Pode remover, não está sendo usado diretamente no JSX

const drawerWidth = 280;

function MainLayout() {
  const { logout, isAdmin } = useAuth();
  const { toggleColorMode, mode } = useThemeToggle();
  const theme = useTheme(); // <<< ADICIONE ESTA LINHA PARA ACESSAR O TEMA
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
          backgroundColor: 'primary.dark',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            GESTÃO DE TEMPO
          </Typography>

          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} color="default" />}
            labelPlacement="start"
            label={<Typography variant="body2" sx={{ color: 'white' }}>{mode === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</Typography>}
            sx={{ mr: 2 }}
          />

          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
            <Typography variant="body2" sx={{ ml: 1 }}>Sair</Typography>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            boxSizing: 'border-box',
            ...(open && {
              width: drawerWidth,
            }),
            ...(!open && {
              overflowX: 'hidden',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              // Aqui o "theme" já estará definido
              width: theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
              },
            }),
          },
        }}
        open={open}
      >
        <Toolbar />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1 }}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          <List>
            {/* Itens de navegação comuns */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} to="/dashboard" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <BarChartIcon />
                </ListItemIcon>
                <ListItemText primary="📊 Relatórios" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} to="/time-tracking" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <TimerIcon />
                </ListItemIcon>
                <ListItemText primary="⏱️ Registro de Tempo" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>

            {/* Itens de navegação apenas para Admin */}
            {isAdmin && (
              <>
                <Divider />
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton component={Link} to="/admin-management" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText primary="👥 Gerenciar Usuários" sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton component={Link} to="/task-management" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="📋 Gerenciar Tarefas" sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton component={Link} to="/client-management" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText primary="🏢 Gerenciar Clientes" sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
          
          {/* Seção inferior do menu */}
          <Box sx={{ mt: 'auto' }}>
            <Divider />
            <List>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton component={Link} to="/about" sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                    <ContactPageIcon />
                  </ListItemIcon>
                  <ListItemText primary="📞 Contato" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          width: '100%'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '1400px' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;