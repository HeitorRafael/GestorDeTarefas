import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Alert, 
  Paper, 
  useTheme
} from '@mui/material';
import TimeTracker from '../components/TimeTracker';
import ClientTaskSelector from '../components/ClientTaskSelector';
import TimeEntryList from '../components/TimeEntryList';
import { useAuth } from '../contexts/AuthContext';

function TimeTrackingPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshEntries, setRefreshEntries] = useState(0);

  const handleClientTaskChange = (client, task) => {
    setSelectedClient(client);
    setSelectedTask(task);
  };

  const handleTimeEntrySaved = () => {
    // Força a atualização da lista de entradas
    setRefreshEntries(prev => prev + 1);
  };

  if (!user) {
    return (
      <Box sx={{ 
        width: '100%', 
        py: 4, 
        display: 'flex', 
        justifyContent: 'center' 
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: '600px', 
            fontSize: '1rem',
            boxShadow: 2,
            borderRadius: 2
          }}
        >
          🔒 Você precisa estar logado para acessar esta página.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ 
        mb: 4, 
        fontWeight: 'bold',
        color: 'primary.main',
        fontSize: '2.2rem'
      }}>
        ⏱️ Controle de Tempo
      </Typography>
      
      <Grid container spacing={3} sx={{ 
        maxWidth: '1200px', 
        mx: 'auto',
        px: 2
      }}>
        {/* Seleção de Cliente e Tarefa - Agora em cima */}
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
              border: theme.palette.mode === 'dark' 
                ? `1px solid ${theme.palette.divider}` 
                : 'none',
              animation: 'fadeIn 0.5s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Typography variant="h6" sx={{ 
              mb: 3, 
              fontWeight: 'bold',
              color: 'primary.main',
              textAlign: 'center',
              fontSize: '1.3rem'
            }}>
              🎯 Seleção de Cliente e Tarefa
            </Typography>
            
            <ClientTaskSelector 
              onSelectionChange={handleClientTaskChange}
              selectedClient={selectedClient}
              selectedTask={selectedTask}
            />
          </Paper>
        </Grid>

        {/* Timer - Agora embaixo, centralizado */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
                border: theme.palette.mode === 'dark' 
                  ? `1px solid ${theme.palette.divider}` 
                  : 'none',
                animation: 'fadeIn 0.6s ease-in-out',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                },
                maxWidth: '600px',
                width: '100%'
              }}
            >
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: 'secondary.main',
                textAlign: 'center',
                fontSize: '1.3rem'
              }}>
                ⏲️ Cronômetro
              </Typography>
              <TimeTracker
                selectedClient={selectedClient}
                selectedTask={selectedTask}
                onTimeEntrySaved={handleTimeEntrySaved}
              />
            </Paper>
          </Box>
        </Grid>

        {/* Lista de Entradas de Tempo */}
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
              border: theme.palette.mode === 'dark' 
                ? `1px solid ${theme.palette.divider}` 
                : 'none',
              animation: 'fadeIn 0.7s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: 'success.main',
              textAlign: 'center',
              fontSize: '1.3rem'
            }}>
              📋 Registros de Hoje
            </Typography>
            <TimeEntryList 
              userId={user.id}
              refreshTrigger={refreshEntries}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TimeTrackingPage;
